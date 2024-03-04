import prisma, { Prisma, UserWithLabels } from '../prismadb';
import { addUserXP } from '../user';
import { transferFreeCredits } from '../payment';
import { UserLabelBenefit, UserLabelBenefitProps } from './user-label';

export interface FreeCreditsBenefitProps extends UserLabelBenefitProps {
	amountEur: number;
	xp?: number;
}

export class FreeCreditsBenefit
	extends UserLabelBenefit
	implements FreeCreditsBenefitProps
{
	public readonly amountEur: number;
	public readonly xp: number | undefined;

	constructor(props: FreeCreditsBenefitProps) {
		super(props);
		this.amountEur = props.amountEur;
		this.xp = props.xp;
	}

	public async apply(user: UserWithLabels) {
		if (this.customApply) {
			await this.customApply(user);
			return;
		}
		await transferFreeCredits(user, this.amountEur, this.name, user.id);
	}

	public async onApplied(
		userId: string,
		tx: Prisma.TransactionClient = prisma
	) {
		await super.onApplied(userId, tx);
		if (this.xp) {
			const referrer = await tx.user.findUniqueOrThrow({
				where: {
					id: userId,
				},
				select: {
					id: true,
					referrerId: true,
				},
			});
			await addUserXP(referrer, this.xp, tx);
		}
	}
}
