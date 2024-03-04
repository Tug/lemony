import Mangopay from 'mangopay2-nodejs-sdk';
import prisma from '../prismadb';
import { Mango } from './client';

// TODO NEXT: handle hooks for sandbox
export const ensureHooksActive = async (): Promise<
	Mangopay.event.EventType[]
> => {
	const mangoClient = Mango.getDefaultClient();
	const registeredHooks = await mangoClient.Hooks.getAll({
		parameters: {
			Per_Page: 100,
		},
	});
	const registeredHooksByHookType = registeredHooks.reduce(
		(result, hookData: Mangopay.hook.HookData) => {
			result[hookData.EventType] = hookData;
			return result;
		},
		{} as Record<Mangopay.event.EventType, Mangopay.hook.HookData>
	);
	const invalidHooks: Mangopay.event.EventType[] = [];
	// preauthorization and dispute related events are not handled at the moment
	const hookTypes: Mangopay.event.EventType[] = [
		'PAYIN_NORMAL_CREATED',
		'PAYIN_NORMAL_SUCCEEDED',
		'PAYIN_NORMAL_FAILED',
		'PAYOUT_NORMAL_CREATED',
		'PAYOUT_NORMAL_SUCCEEDED',
		'PAYOUT_NORMAL_FAILED',
		'TRANSFER_NORMAL_CREATED',
		'TRANSFER_NORMAL_SUCCEEDED',
		'TRANSFER_NORMAL_FAILED',
		'PAYIN_REFUND_CREATED',
		'PAYIN_REFUND_SUCCEEDED',
		'PAYIN_REFUND_FAILED',
		'PAYOUT_REFUND_CREATED',
		'PAYOUT_REFUND_SUCCEEDED',
		'PAYOUT_REFUND_FAILED',
		'INSTANT_PAYOUT_SUCCEEDED',
		'INSTANT_PAYOUT_FALLBACKED',
		'TRANSFER_REFUND_CREATED',
		'TRANSFER_REFUND_SUCCEEDED',
		'TRANSFER_REFUND_FAILED',
		'KYC_CREATED',
		'KYC_OUTDATED',
		'KYC_VALIDATION_ASKED',
		'KYC_SUCCEEDED',
		'KYC_FAILED',
		'USER_KYC_REGULAR',
		'USER_KYC_LIGHT',
		'USER_INFLOWS_BLOCKED',
		'USER_INFLOWS_UNBLOCKED',
		'USER_OUTFLOWS_BLOCKED',
		'USER_OUTFLOWS_UNBLOCKED',
	];
	for (const hookType of hookTypes) {
		const registeredHook: Mangopay.hook.HookData =
			registeredHooksByHookType[hookType];
		if (registeredHook && registeredHook.Validity === 'VALID') {
			continue;
		}
		const url = `${process.env.NEXT_API_URL}/payment/mangopay/payload`;
		if (registeredHook) {
			if (
				registeredHook.Validity === 'VALID' &&
				registeredHook.Status === 'DISABLED'
			) {
				console.log(
					`Skipping valid hook ${hookType} as it is disabled.`
				);
				// TODO NEXT: notify us (via email?) of disabled hooks
				continue;
			}
			if (registeredHook.Validity === 'INVALID') {
				invalidHooks.push(registeredHook.EventType);
			}
			if (registeredHook.Url !== url) {
				console.log(`Updating url for hook ${hookType}.`);
				await mangoClient.Hooks.update({
					...registeredHook,
					Url: url,
				});
			}
		} else {
			console.log(`Creating new hook ${hookType}.`);
			await mangoClient.Hooks.create({
				Url: url,
				EventType: hookType,
			});
		}
	}
	return invalidHooks;
};

export const handleHookPayload = async ({
	resourceId,
	eventType,
	timestamp,
}: {
	resourceId: string;
	eventType: string;
	timestamp: number;
}) => {
	await prisma.mangopayEvent.create({
		data: {
			resourceId,
			eventType,
			timestamp: new Date(timestamp * 1000),
		},
	});
};
