import RequiresAPIKEY from '../../../helpers/api/requires-api-key';
import { Catch, createHandler, Get, SetHeader } from 'next-api-decorators';
import { exceptionHandler } from '../../../lib/error';
import prisma, { SchemaTypes } from '../../../lib/prismadb';
import { sendSimpleEmail } from '../../../lib/emails/sendgrid';
import path from 'path';
import { TemplateHandler } from 'easy-template-x';
import axios from 'axios';
import * as sumsub from '../../../lib/kyc-providers/sumsub';
import { deleteKlaviyoProfile } from '../../../lib/sync/klaviyo';
import { getEurWallet, getEurWalletOrThrow } from '../../../lib/payment';

export const config = {
	maxDuration: 5 * 60, // 5 min max duration
};

async function generateRequestDPForTerminationDocument(
	deletedUsers: Pick<SchemaTypes.User, 'sumsubId'>[]
): Promise<{
	content: string;
	filename: string;
	type: string;
}> {
	const templateUrl =
		'https://getdiversified.app/wp-content/uploads/2023/09/Sum_Sub_Request_DP_termination_for_clients_template.docx';
	const template = await axios.get(templateUrl, {
		responseType: 'arraybuffer',
		headers: {
			Accept: 'application/pdf',
		},
	});
	const filename = path
		.basename(templateUrl)
		.replace('_template.docx', '.docx');
	const templateHandler = new TemplateHandler();
	const outputDocBuffer = await templateHandler.process(template.data, {
		deletedUsers,
		todaysDate: new Date().toISOString().split('T')[0],
	});
	return {
		content: outputDocBuffer.toString('base64'),
		filename,
		type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	};
}

@RequiresAPIKEY()
@Catch(exceptionHandler)
class DeleteDisabledUsersHandler {
	@Get()
	@SetHeader('Cache-Control', 'nostore')
	public async removeAll(): Promise<{
		ok: number;
	}> {
		const usersToDelete = await prisma.user.findMany({
			where: {
				role: 'USER',
				disabled: true,
				updatedAt: {
					lte: new Date(Date.now() - 15 * 24 * 3600 * 1000),
				},
				creditsEur: 0,
				orders: {
					none: {
						status: {
							in: [
								'paid',
								'prepaid',
								'processed',
								'preprocessed',
								'refunded',
								'exited',
								'pendingRefund',
								'pendingExit',
							],
						},
					},
				},
				paymentsSent: {
					none: {
						status: { in: ['paid', 'processed'] },
					},
				},
				paymentsReceived: {
					none: {
						status: { in: ['paid', 'processed'] },
					},
				},
			},
		});
		const deletedUsers = [];
		for (const user of usersToDelete) {
			if (user.sumsubId) {
				await sumsub.resetApplicant(user.sumsubId);
			}
			if (user.klaviyoId) {
				await deleteKlaviyoProfile(user);
			}
			const eurWallet = await getEurWallet(user);
			if (!eurWallet || eurWallet.Balance.Amount > 0) {
				continue;
			}
			await prisma.user.delete({
				where: {
					id: user.id,
				},
			});
			deletedUsers.push(user);
		}
		const deletedUsersWithSumsubAccount = deletedUsers.filter(
			({ sumsubId }) => Boolean(sumsubId)
		);
		if (deletedUsersWithSumsubAccount.length > 0) {
			await sendSimpleEmail(
				`
					Hello Sumsub team,
					
					Please proceed to the user data removal of the following applicants (see attached document).
					
					Regards,
					
					Tugdual de Kerviler
				`,
				'Request to delete personal data',
				'privacy@sumsub.com',
				'tug@getdiversified.app',
				{
					attachments: [
						await generateRequestDPForTerminationDocument(
							deletedUsersWithSumsubAccount
						),
					],
					cc: 'admin@diversified.fi',
				}
			);
		}

		return {
			ok: 1,
		};
	}
}

export default createHandler(DeleteDisabledUsersHandler);
