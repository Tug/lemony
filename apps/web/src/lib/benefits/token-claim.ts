import prisma, {
	Prisma,
	transactionExtendable,
	userForCheckoutSelect,
	UserWithLabels,
} from '../prismadb';
import { addUserXP } from '../user';
import { UserLabelBenefit, UserLabelBenefitProps } from './user-label';
import { giveRandomTokenClaim, postCreateTokenClaim } from '../token-claim';
import { VIPLevelLabel } from '@diversifiedfinance/types/diversified';
import { getLiveVIPLevelBenefits } from '../vip';

export interface TokenClaimBenefitProps extends UserLabelBenefitProps {
	vipLevel: VIPLevelLabel; // level used to determine benefits in constants (see lib/vip.ts)
	xp?: number;
}

export class TokenClaimBenefit
	extends UserLabelBenefit
	implements TokenClaimBenefitProps
{
	public readonly vipLevel: VIPLevelLabel;

	constructor(props: TokenClaimBenefitProps) {
		super(props);
		this.vipLevel = props.vipLevel;
	}

	public async apply(user: UserWithLabels) {
		if (this.customApply) {
			await this.customApply(user);
			return;
		}
		const tokenClaim = await transactionExtendable(async (tx) => {
			const randomTokenClaim = await giveRandomTokenClaim(user, 1, tx);
			await this.onApplied(user.id, tx);
			return randomTokenClaim;
		});
		await postCreateTokenClaim(tokenClaim, 'first-investment');
	}
}

export class TokenClaimBenefitToSponsor
	extends UserLabelBenefit
	implements TokenClaimBenefitProps
{
	public readonly vipLevel: VIPLevelLabel;

	constructor(props: TokenClaimBenefitProps) {
		super(props);
		this.vipLevel = props.vipLevel;
	}

	public async apply(user: UserWithLabels) {
		if (this.customApply) {
			await this.customApply(user);
			return;
		}
		if (!user.referrerId) {
			return;
		}
		const referrer = await prisma.user.findUniqueOrThrow({
			where: { id: user.referrerId, disabled: false },
			select: userForCheckoutSelect,
		});
		const vipLevelBenefits = getLiveVIPLevelBenefits();
		const amountDified = vipLevelBenefits[this.vipLevel].difiedPerReferral;
		const tokenClaim = await transactionExtendable(async (tx) => {
			const randomTokenClaim = await giveRandomTokenClaim(
				referrer,
				amountDified,
				tx
			);
			await this.onApplied(user.id, tx);
			return randomTokenClaim;
		});
		await postCreateTokenClaim(tokenClaim, 'referral');
	}

	public async onApplied(
		userId: string,
		tx: Prisma.TransactionClient = prisma
	) {
		await super.onApplied(userId, tx);
		const vipLevelBenefits = getLiveVIPLevelBenefits();
		const xp = vipLevelBenefits[this.vipLevel].xpPerReferral;
		const user = await tx.user.findUniqueOrThrow({
			where: {
				id: userId,
			},
			select: {
				referrer: {
					select: {
						id: true,
					},
				},
			},
		});
		if (xp > 0 && user.referrer) {
			await addUserXP(user.referrer, xp, tx);
		}
	}
}
