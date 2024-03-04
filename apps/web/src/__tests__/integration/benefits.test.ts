import { createFreeTokenPool } from '../../lib/token-claim';

jest.mock('../../lib/emails/sendgrid');
import prisma, {
	userWithLabelsIncludes,
	userWithWalletsIncludes,
} from '../../lib/prismadb';
import { user1, user2 } from '../fixtures/user';
import { checkUserPendingBenefits } from '../../lib/benefits';
import { ensureEurWallet } from '../../lib/payment/sync';
import { addUserLabel, getSellerUser } from '../../lib/user';
import { product1, project1 } from '../fixtures/project';

const cleanup = async () => {
	await prisma.userTokenClaim.deleteMany();
	await prisma.order.deleteMany();
	await prisma.sandboxOrder.deleteMany();
	await prisma.userLabel.deleteMany();
	await prisma.payment.deleteMany();
	await prisma.productsInProjects.deleteMany();
	await prisma.oracleProduct.deleteMany();
	await prisma.productInInventory.deleteMany();
	await prisma.userTokenClaim.deleteMany();
	await prisma.sandboxUserTokenClaim.deleteMany();
	await prisma.user.deleteMany({
		where: {
			AND: [
				{ role: { not: 'ADMIN' } },
				{ email: { not: 'propco@diversified.fi' } },
			],
		},
	});
	await prisma.freeTokenPool.deleteMany();
	await prisma.project.deleteMany();
	await prisma.projectCrowdfundingState.deleteMany();
};

const createFixtures = async () => {
	const seller = await getSellerUser();
	const sponsorUser = await prisma.user.create({
		data: {
			...user1,
		},
		include: userWithWalletsIncludes,
	});
	await ensureEurWallet(sponsorUser);
	const referralUser = await prisma.user.create({
		data: {
			...user2,
			referrer: {
				connect: {
					id: sponsorUser.id,
				},
			},
		},
	});
	const project = await prisma.project.create({
		data: {
			...project1,
			owner: { connect: { id: seller.id } },
			crowdfundingState: {
				create: {
					collectedAmount: 0,
					maximumAmount: project1.targetPrice,
				},
			},
			products: {
				create: [
					{
						product: {
							create: product1,
						},
						quantity: 1,
						unitPrice: project1.targetPrice,
					},
				],
			},
		},
	});
	await createFreeTokenPool(project.id, seller.id, 1000);
};

beforeEach(async () => {
	await cleanup();
	await createFixtures();
});

afterAll(async () => {
	await cleanup();
	await prisma.$disconnect();
});

describe('New VIP Programme (DIFIED Claims benefits)', () => {
	describe('No free credits benefits should apply', () => {
		it('should not give free credits benefit to the user and sponsor if user became a customer', async () => {
			const referralUser = await prisma.user.update({
				where: { id: user2.id },
				data: {
					kycStatus: 'completed',
				},
				include: userWithWalletsIncludes,
			});
			await ensureEurWallet(referralUser);
			await addUserLabel(referralUser, 'customer');
			const referralUserUpdated = await prisma.user.findUniqueOrThrow({
				where: { id: user2.id },
				include: userWithLabelsIncludes,
			});
			const benefitsAppliedToReferral = await checkUserPendingBenefits(
				referralUserUpdated
			);
			expect(benefitsAppliedToReferral).not.toContain(
				'10eur free credits to customers invited by a sponsor'
			);
			expect(benefitsAppliedToReferral).not.toContain(
				'10eur free credits to sponsor for a referral turned customer'
			);
			const labelsSponsor = (
				await prisma.user.findUniqueOrThrow({
					where: { id: user1.id },
					include: userWithLabelsIncludes,
				})
			).labels.map(({ label }) => label);
			expect(labelsSponsor).toEqual([]);
			const labelsReferral = (
				await prisma.user.findUniqueOrThrow({
					where: { id: user2.id },
					include: userWithLabelsIncludes,
				})
			).labels.map(({ label }) => label);
			expect(labelsReferral).toContain('customer');
			expect(labelsReferral).not.toContain('referral_10eur_credited');
			expect(labelsReferral).not.toContain(
				'referral_10eur_credited_to_sponsor'
			);
		});
	});

	describe('No dified claim should be credited if equivalent free credits have been given', () => {
		it('should not give dified claim to referral nor sponsor if they already reveived credits', async () => {
			const referralUser = await prisma.user.update({
				where: { id: user2.id },
				data: {
					kycStatus: 'completed',
				},
				include: userWithWalletsIncludes,
			});
			await addUserLabel(referralUser, 'customer');
			await addUserLabel(referralUser, 'referral_10eur_credited');
			await addUserLabel(
				referralUser,
				'referral_10eur_credited_to_sponsor'
			);
			const referralUserUpdated = await prisma.user.findUniqueOrThrow({
				where: { id: user2.id },
				include: userWithLabelsIncludes,
			});
			const benefitsAppliedToReferral = await checkUserPendingBenefits(
				referralUserUpdated
			);
			expect(benefitsAppliedToReferral).toEqual([]);
			const labelsSponsor = (
				await prisma.user.findUniqueOrThrow({
					where: { id: user1.id },
					include: userWithLabelsIncludes,
				})
			).labels.map(({ label }) => label);
			expect(labelsSponsor).toEqual([]);
			const labelsReferral = (
				await prisma.user.findUniqueOrThrow({
					where: { id: user2.id },
					include: userWithLabelsIncludes,
				})
			).labels.map(({ label }) => label);
			expect(labelsReferral).toEqual([
				'customer',
				'referral_10eur_credited',
				'referral_10eur_credited_to_sponsor',
			]);
		});
	});

	describe('main referral 1 DIFIED / 1 DIFIED benefit', () => {
		it('should not give benefit to any user if the new user is not KYCd', async () => {
			const sponsorUser = await prisma.user.findUniqueOrThrow({
				where: { id: user1.id },
				include: userWithLabelsIncludes,
			});
			const referralUser = await prisma.user.findUniqueOrThrow({
				where: { id: user2.id },
				include: userWithLabelsIncludes,
			});
			const benefitsAppliedToSponsor = await checkUserPendingBenefits(
				sponsorUser
			);
			const benefitsAppliedToReferral = await checkUserPendingBenefits(
				referralUser
			);
			expect(benefitsAppliedToSponsor).toEqual([]);
			expect(benefitsAppliedToReferral).toEqual([]);
		});

		// This is disabled for now, to grow the user base
		it.skip('should not give benefit to the new user immediately even if KYCd (they need to invest first)', async () => {
			const sponsorUser = await prisma.user.findUniqueOrThrow({
				where: { id: user1.id },
				include: userWithLabelsIncludes,
			});
			const referralUser = await prisma.user.update({
				where: { id: user2.id },
				data: {
					kycStatus: 'completed',
				},
				include: userWithWalletsIncludes,
			});
			const benefitsAppliedToSponsor = await checkUserPendingBenefits(
				sponsorUser
			);
			const benefitsAppliedToReferral = await checkUserPendingBenefits(
				referralUser
			);
			expect(benefitsAppliedToSponsor).toEqual([]);
			expect(benefitsAppliedToReferral).toEqual([]);
			const labelsSponsor = (
				await prisma.user.findUniqueOrThrow({
					where: { id: user1.id },
					include: userWithLabelsIncludes,
				})
			).labels.map(({ label }) => label);
			expect(labelsSponsor).toEqual([]);
			const labelsReferral = (
				await prisma.user.findUniqueOrThrow({
					where: { id: user2.id },
					include: userWithLabelsIncludes,
				})
			).labels.map(({ label }) => label);
			expect(labelsReferral).toEqual([]);
		});

		it('should give benefit to the user and sponsor if user became a customer', async () => {
			const referralUser = await prisma.user.update({
				where: { id: user2.id },
				data: {
					kycStatus: 'completed',
				},
				include: userWithWalletsIncludes,
			});
			await addUserLabel(referralUser, 'customer');
			const referralUserUpdated = await prisma.user.findUniqueOrThrow({
				where: { id: user2.id },
				include: userWithLabelsIncludes,
			});
			const benefitsAppliedToReferral = await checkUserPendingBenefits(
				referralUserUpdated
			);
			const referralUserUpdated2 = await prisma.user.findUniqueOrThrow({
				where: { id: user2.id },
				include: userWithLabelsIncludes,
			});
			expect(referralUserUpdated2.xp).toEqual(0);
			expect(benefitsAppliedToReferral).toEqual([
				'1 DIFIED claim to customers invited by a sponsor',
				'1 DIFIED to regular sponsor for a referral turned customer',
			]);
			const sponsorUser = await prisma.user.findUniqueOrThrow({
				where: { id: user1.id },
				include: userWithLabelsIncludes,
			});
			expect(sponsorUser.xp).toEqual(1000);
			const labelsSponsor = sponsorUser.labels.map(({ label }) => label);
			expect(labelsSponsor).toEqual([]);
			const labelsReferral = (
				await prisma.user.findUniqueOrThrow({
					where: { id: user2.id },
					include: userWithLabelsIncludes,
				})
			).labels.map(({ label }) => label);
			expect(labelsReferral).toEqual([
				'customer',
				'referral_1dified_claim_credited',
				'referral_1dified_claim_credited_to_sponsor',
			]);
		});
	});

	describe('VIP Programme', () => {
		it('should give benefit to the user and special benefits to vip1 sponsor if user became a customer', async () => {
			const sponsorUser = await prisma.user.findUniqueOrThrow({
				where: { id: user1.id },
				include: userWithWalletsIncludes,
			});
			await addUserLabel(sponsorUser, 'vip1');
			const referralUser = await prisma.user.update({
				where: { id: user2.id },
				data: {
					kycStatus: 'completed',
				},
				include: userWithWalletsIncludes,
			});
			await addUserLabel(referralUser, 'customer');
			const referralUserUpdated = await prisma.user.findUniqueOrThrow({
				where: { id: user2.id },
				include: userWithLabelsIncludes,
			});
			expect(referralUserUpdated.xp).toEqual(0);
			const benefitsAppliedToReferral = await checkUserPendingBenefits(
				referralUserUpdated
			);
			const referralUserUpdated2 = await prisma.user.findUniqueOrThrow({
				where: { id: user2.id },
				include: userWithLabelsIncludes,
			});
			expect(referralUserUpdated2.xp).toEqual(0);
			expect(benefitsAppliedToReferral).toEqual([
				'1 DIFIED claim to customers invited by a sponsor',
				'2 DIFIED to vip1 sponsor for a referral turned customer',
			]);
			const sponsorUser2 = await prisma.user.findUniqueOrThrow({
				where: { id: user1.id },
				include: userWithLabelsIncludes,
			});
			expect(sponsorUser2.xp).toEqual(1000);
			const labelsSponsor = sponsorUser2.labels.map(({ label }) => label);
			expect(labelsSponsor).toEqual(['vip1']);
			const labelsReferral = (
				await prisma.user.findUniqueOrThrow({
					where: { id: user2.id },
					include: userWithLabelsIncludes,
				})
			).labels.map(({ label }) => label);
			expect(labelsReferral).toEqual([
				'customer',
				'referral_1dified_claim_credited',
				'referral_2dified_claim_credited_to_sponsor',
			]);
		});

		it('should give benefit to the user and special benefits to vip2 sponsor if user became a customer', async () => {
			const sponsorUser = await prisma.user.findUniqueOrThrow({
				where: { id: user1.id },
				include: userWithWalletsIncludes,
			});
			await addUserLabel(sponsorUser, 'vip1');
			await addUserLabel(sponsorUser, 'vip2');
			const referralUser = await prisma.user.update({
				where: { id: user2.id },
				data: {
					kycStatus: 'completed',
				},
				include: userWithWalletsIncludes,
			});
			await addUserLabel(referralUser, 'customer');
			const referralUserUpdated = await prisma.user.findUniqueOrThrow({
				where: { id: user2.id },
				include: userWithLabelsIncludes,
			});
			const benefitsAppliedToReferral = await checkUserPendingBenefits(
				referralUserUpdated
			);
			const referralUserUpdated2 = await prisma.user.findUniqueOrThrow({
				where: { id: user2.id },
				include: userWithLabelsIncludes,
			});
			expect(referralUserUpdated2.xp).toEqual(0);
			expect(benefitsAppliedToReferral).toEqual([
				'1 DIFIED claim to customers invited by a sponsor',
				'3 DIFIED to vip2 sponsor for a referral turned customer',
			]);
			const sponsorUser2 = await prisma.user.findUniqueOrThrow({
				where: { id: user1.id },
				include: userWithLabelsIncludes,
			});
			expect(sponsorUser2.xp).toEqual(1000);
			const labelsSponsor = sponsorUser2.labels.map(({ label }) => label);
			expect(labelsSponsor).toEqual(
				expect.arrayContaining(['vip1', 'vip2'])
			);
			const labelsReferral = (
				await prisma.user.findUniqueOrThrow({
					where: { id: user2.id },
					include: userWithLabelsIncludes,
				})
			).labels.map(({ label }) => label);
			expect(labelsReferral).toEqual([
				'customer',
				'referral_1dified_claim_credited',
				'referral_3dified_claim_credited_to_sponsor',
			]);
		});

		it('should give benefit to the user and special benefits to vip3 sponsor and higher if user became a customer', async () => {
			const sponsorUser = await prisma.user.findUniqueOrThrow({
				where: { id: user1.id },
				include: userWithWalletsIncludes,
			});
			await addUserLabel(sponsorUser, 'vip1');
			await addUserLabel(sponsorUser, 'vip2');
			await addUserLabel(sponsorUser, 'vip3');
			const referralUser = await prisma.user.update({
				where: { id: user2.id },
				data: {
					kycStatus: 'completed',
				},
				include: userWithWalletsIncludes,
			});
			await addUserLabel(referralUser, 'customer');
			const referralUserUpdated = await prisma.user.findUniqueOrThrow({
				where: { id: user2.id },
				include: userWithLabelsIncludes,
			});
			const benefitsAppliedToReferral = await checkUserPendingBenefits(
				referralUserUpdated
			);
			const referralUserUpdated2 = await prisma.user.findUniqueOrThrow({
				where: { id: user2.id },
				include: userWithLabelsIncludes,
			});
			expect(referralUserUpdated2.xp).toEqual(0);
			expect(benefitsAppliedToReferral).toEqual([
				'1 DIFIED claim to customers invited by a sponsor',
				'3 DIFIED to vip2 sponsor for a referral turned customer',
			]);
			const sponsorUser2 = await prisma.user.findUniqueOrThrow({
				where: { id: user1.id },
				include: userWithLabelsIncludes,
			});
			expect(sponsorUser2.xp).toEqual(1000);
			const labelsSponsor = sponsorUser2.labels.map(({ label }) => label);
			expect(labelsSponsor).toEqual(
				expect.arrayContaining(['vip1', 'vip2', 'vip3'])
			);
			const labelsReferral = (
				await prisma.user.findUniqueOrThrow({
					where: { id: user2.id },
					include: userWithLabelsIncludes,
				})
			).labels.map(({ label }) => label);
			expect(labelsReferral).toEqual([
				'customer',
				'referral_1dified_claim_credited',
				'referral_3dified_claim_credited_to_sponsor',
			]);
		});

		describe('Special cases', () => {
			it('VIP Influencer', async () => {
				const sponsorUser = await prisma.user.findUniqueOrThrow({
					where: { id: user1.id },
					include: userWithWalletsIncludes,
				});
				await addUserLabel(sponsorUser, 'vip_influencer');
				await addUserLabel(sponsorUser, 'vip1');
				await addUserLabel(sponsorUser, 'vip2');
				const referralUser = await prisma.user.update({
					where: { id: user2.id },
					data: {
						kycStatus: 'completed',
					},
					include: userWithWalletsIncludes,
				});
				await addUserLabel(referralUser, 'customer');
				const referralUserUpdated = await prisma.user.findUniqueOrThrow(
					{
						where: { id: user2.id },
						include: userWithLabelsIncludes,
					}
				);
				const benefitsAppliedToReferral =
					await checkUserPendingBenefits(referralUserUpdated);
				const referralUserUpdated2 =
					await prisma.user.findUniqueOrThrow({
						where: { id: user2.id },
						include: userWithLabelsIncludes,
					});
				expect(referralUserUpdated2.xp).toEqual(0);
				expect(benefitsAppliedToReferral.sort()).toEqual(
					['2 DIFIED for users invited by influencer'].sort()
				);
				const sponsorUser2 = await prisma.user.findUniqueOrThrow({
					where: { id: user1.id },
					include: userWithLabelsIncludes,
				});
				expect(sponsorUser2.xp).toEqual(0);
				const labelsSponsor = sponsorUser2.labels.map(
					({ label }) => label
				);
				expect(labelsSponsor.sort()).toEqual(
					['vip_influencer', 'vip1', 'vip2'].sort()
				);
				const labelsReferral = (
					await prisma.user.findUniqueOrThrow({
						where: { id: user2.id },
						include: userWithLabelsIncludes,
					})
				).labels.map(({ label }) => label);
				expect(labelsReferral.sort()).toEqual(
					[
						'customer',
						'referral_influencer_2dified_claim_credited',
					].sort()
				);
			});

			it('vip_ama + vip1 => vip_ama disables all other benefits', async () => {
				const sponsorUser = await prisma.user.findUniqueOrThrow({
					where: { id: user1.id },
					include: userWithWalletsIncludes,
				});
				await addUserLabel(sponsorUser, 'vip_ama');
				await addUserLabel(sponsorUser, 'vip1');
				await addUserLabel(sponsorUser, 'vip2');
				const referralUser = await prisma.user.update({
					where: { id: user2.id },
					data: {
						kycStatus: 'completed',
					},
					include: userWithWalletsIncludes,
				});
				await addUserLabel(referralUser, 'customer');
				const referralUserUpdated = await prisma.user.findUniqueOrThrow(
					{
						where: { id: user2.id },
						include: userWithLabelsIncludes,
					}
				);
				const benefitsAppliedToReferral =
					await checkUserPendingBenefits(referralUserUpdated);
				const referralUserUpdated2 =
					await prisma.user.findUniqueOrThrow({
						where: { id: user2.id },
						include: userWithLabelsIncludes,
					});
				expect(referralUserUpdated2.xp).toEqual(0);
				expect(benefitsAppliedToReferral).toEqual([
					'VIP label given to users invited by an AMA (Asset Manager Advisor) or a VIP Special',
				]);
				const sponsorUser2 = await prisma.user.findUniqueOrThrow({
					where: { id: user1.id },
					include: userWithLabelsIncludes,
				});
				expect(sponsorUser2.xp).toEqual(0);
				const labelsSponsor = sponsorUser2.labels.map(
					({ label }) => label
				);
				expect(labelsSponsor.sort()).toEqual(
					['vip1', 'vip2', 'vip_ama'].sort()
				);
				const labelsReferral = (
					await prisma.user.findUniqueOrThrow({
						where: { id: user2.id },
						include: userWithLabelsIncludes,
					})
				).labels.map(({ label }) => label);
				expect(labelsReferral.sort()).toEqual(
					['customer', 'vip1'].sort()
				);
			});

			it('vip_ama + vip_influencer => vip_ama disables all other benefits', async () => {
				const sponsorUser = await prisma.user.findUniqueOrThrow({
					where: { id: user1.id },
					include: userWithWalletsIncludes,
				});
				await addUserLabel(sponsorUser, 'vip_influencer');
				await addUserLabel(sponsorUser, 'vip_ama');
				await addUserLabel(sponsorUser, 'vip1');
				await addUserLabel(sponsorUser, 'vip2');
				const referralUser = await prisma.user.update({
					where: { id: user2.id },
					data: {
						kycStatus: 'completed',
					},
					include: userWithWalletsIncludes,
				});
				await addUserLabel(referralUser, 'customer');
				const referralUserUpdated = await prisma.user.findUniqueOrThrow(
					{
						where: { id: user2.id },
						include: userWithLabelsIncludes,
					}
				);
				const benefitsAppliedToReferral =
					await checkUserPendingBenefits(referralUserUpdated);
				const referralUserUpdated2 =
					await prisma.user.findUniqueOrThrow({
						where: { id: user2.id },
						include: userWithLabelsIncludes,
					});
				expect(referralUserUpdated2.xp).toEqual(0);
				expect(benefitsAppliedToReferral).toEqual([
					'VIP label given to users invited by an AMA (Asset Manager Advisor) or a VIP Special',
				]);
				const sponsorUser2 = await prisma.user.findUniqueOrThrow({
					where: { id: user1.id },
					include: userWithLabelsIncludes,
				});
				expect(sponsorUser2.xp).toEqual(0);
				const labelsSponsor = sponsorUser2.labels.map(
					({ label }) => label
				);
				expect(labelsSponsor.sort()).toEqual(
					['vip1', 'vip2', 'vip_ama', 'vip_influencer'].sort()
				);
				const labelsReferral = (
					await prisma.user.findUniqueOrThrow({
						where: { id: user2.id },
						include: userWithLabelsIncludes,
					})
				).labels.map(({ label }) => label);
				expect(labelsReferral.sort()).toEqual(
					['customer', 'vip1'].sort()
				);
			});

			it('vip_special + vip_influencer => vip_special is like vip_ama but can be cumulated with other benefits', async () => {
				const sponsorUser = await prisma.user.findUniqueOrThrow({
					where: { id: user1.id },
					include: userWithWalletsIncludes,
				});
				await addUserLabel(sponsorUser, 'vip_influencer');
				await addUserLabel(sponsorUser, 'vip_special');
				await addUserLabel(sponsorUser, 'vip1');
				await addUserLabel(sponsorUser, 'vip2');
				const referralUser = await prisma.user.update({
					where: { id: user2.id },
					data: {
						kycStatus: 'completed',
					},
					include: userWithWalletsIncludes,
				});
				await addUserLabel(referralUser, 'customer');
				const referralUserUpdated = await prisma.user.findUniqueOrThrow(
					{
						where: { id: user2.id },
						include: userWithLabelsIncludes,
					}
				);
				const benefitsAppliedToReferral =
					await checkUserPendingBenefits(referralUserUpdated);
				const referralUserUpdated2 =
					await prisma.user.findUniqueOrThrow({
						where: { id: user2.id },
						include: userWithLabelsIncludes,
					});
				expect(referralUserUpdated2.xp).toEqual(0);
				expect(benefitsAppliedToReferral.sort()).toEqual(
					[
						'VIP label given to users invited by an AMA (Asset Manager Advisor) or a VIP Special',
						'2 DIFIED for users invited by influencer',
					].sort()
				);
				const sponsorUser2 = await prisma.user.findUniqueOrThrow({
					where: { id: user1.id },
					include: userWithLabelsIncludes,
				});
				expect(sponsorUser2.xp).toEqual(0);
				const labelsSponsor = sponsorUser2.labels.map(
					({ label }) => label
				);
				expect(labelsSponsor.sort()).toEqual(
					['vip_influencer', 'vip_special', 'vip1', 'vip2'].sort()
				);
				const labelsReferral = (
					await prisma.user.findUniqueOrThrow({
						where: { id: user2.id },
						include: userWithLabelsIncludes,
					})
				).labels.map(({ label }) => label);
				expect(labelsReferral.sort()).toEqual(
					[
						'customer',
						'referral_influencer_2dified_claim_credited',
						'vip1',
					].sort()
				);
			});

			it('vip_special + vip2 => cumulated benefits', async () => {
				const sponsorUser = await prisma.user.findUniqueOrThrow({
					where: { id: user1.id },
					include: userWithWalletsIncludes,
				});
				await addUserLabel(sponsorUser, 'vip_special');
				await addUserLabel(sponsorUser, 'vip1');
				await addUserLabel(sponsorUser, 'vip2');
				const referralUser = await prisma.user.update({
					where: { id: user2.id },
					data: {
						kycStatus: 'completed',
					},
					include: userWithWalletsIncludes,
				});
				await addUserLabel(referralUser, 'customer');
				const referralUserUpdated = await prisma.user.findUniqueOrThrow(
					{
						where: { id: user2.id },
						include: userWithLabelsIncludes,
					}
				);
				const benefitsAppliedToReferral =
					await checkUserPendingBenefits(referralUserUpdated);
				const referralUserUpdated2 =
					await prisma.user.findUniqueOrThrow({
						where: { id: user2.id },
						include: userWithLabelsIncludes,
					});
				expect(referralUserUpdated2.xp).toEqual(0);
				expect(benefitsAppliedToReferral.sort()).toEqual(
					[
						'1 DIFIED claim to customers invited by a sponsor',
						'3 DIFIED to vip2 sponsor for a referral turned customer',
						'VIP label given to users invited by an AMA (Asset Manager Advisor) or a VIP Special',
					].sort()
				);
				const sponsorUser2 = await prisma.user.findUniqueOrThrow({
					where: { id: user1.id },
					include: userWithLabelsIncludes,
				});
				expect(sponsorUser2.xp).toEqual(1000);
				const labelsSponsor = sponsorUser2.labels.map(
					({ label }) => label
				);
				expect(labelsSponsor.sort()).toEqual(
					['vip1', 'vip2', 'vip_special'].sort()
				);
				const labelsReferral = (
					await prisma.user.findUniqueOrThrow({
						where: { id: user2.id },
						include: userWithLabelsIncludes,
					})
				).labels.map(({ label }) => label);
				expect(labelsReferral.sort()).toEqual(
					[
						'customer',
						'referral_1dified_claim_credited',
						'referral_3dified_claim_credited_to_sponsor',
						'vip1',
					].sort()
				);
			});
		});
	});
});
