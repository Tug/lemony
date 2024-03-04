import { UserWithLabels } from '../prismadb';
import { PrismaClient } from '@prisma/client';

export interface BenefitProps {
	readonly name: string;
}

export abstract class Benefit implements BenefitProps {
	public readonly name: string;

	protected constructor(props: BenefitProps) {
		this.name = props.name;
	}

	abstract shouldApply(user: UserWithLabels): Promise<boolean>;
	abstract apply(user: UserWithLabels): Promise<void>;
	abstract onApplied(userId: string, tx: PrismaClient): Promise<void>;
}
