import prisma, { Prisma, UserWithLabels } from '../prismadb';
import { addUserLabel } from '../user';
import { Benefit, BenefitProps } from './benefit';

export interface UserLabelBenefitProps extends BenefitProps {
	readonly userLabel: string;
	shouldApply: (user: UserWithLabels) => Promise<boolean>;
	apply?: (user: UserWithLabels) => Promise<void>;
}

export class UserLabelBenefit extends Benefit implements UserLabelBenefitProps {
	public readonly name: string;
	public readonly userLabel: string;

	protected readonly customShouldApply: (
		user: UserWithLabels
	) => Promise<boolean>;

	protected readonly customApply:
		| undefined
		| ((user: UserWithLabels) => Promise<void>);

	public constructor(props: UserLabelBenefitProps) {
		super(props);
		this.userLabel = props.userLabel;
		this.customShouldApply = props.shouldApply.bind(this);
		this.customApply = props.apply ? props.apply.bind(this) : undefined;
	}

	public async shouldApply(user: UserWithLabels) {
		if (user.labels.find(({ label }) => label === this.userLabel)) {
			return false;
		}
		if (this.customShouldApply) {
			return this.customShouldApply(user);
		}
		return true;
	}

	public async onApplied(
		userId: string,
		tx: Prisma.TransactionClient = prisma
	) {
		await addUserLabel({ id: userId }, this.userLabel, tx);
	}

	public async apply(user: UserWithLabels): Promise<void> {
		if (this.customApply) {
			// MUST USE A METHOD THAT WILL CALL onApplied ON SUCCESS
			// can be called later from an async job for instance
			await this.customApply(user);
		} else {
			await this.onApplied(user.id);
		}
	}
}
