import type { transaction } from 'mangopay2-nodejs-sdk';
import ArrowRight from '@diversifiedfinance/design-system/icon/ArrowRight';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { ArrowLeft } from '@diversifiedfinance/design-system/icon';

export const TransactionIcon = ({
	transactionType,
	transactionStatus,
}: {
	transactionType: transaction.TransactionType;
	transactionStatus: transaction.TransactionStatus;
}) => {
	const color =
		transactionStatus === 'SUCCEEDED' ? colors.green[500] : colors.red[500];
	if (transactionType === 'PAYOUT') {
		return <ArrowRight width={24} height={24} color={color} />;
	}
	if (transactionType === 'PAYIN') {
		return <ArrowLeft width={24} height={24} color={color} />;
	}
	return null;
};
