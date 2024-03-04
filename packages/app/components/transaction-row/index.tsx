import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import React from 'react';
import type { transaction } from 'mangopay2-nodejs-sdk';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { HelpBox } from './help-box';
import { TransactionIcon } from '@diversifiedfinance/app/components/transaction-row/icon';
import { useTranslation } from 'react-i18next';
import {
	fromMangopayMoney,
	printMoney,
} from '@diversifiedfinance/app/lib/mangopay';
import i18n from '@diversifiedfinance/app/lib/i18n';

export interface TransactionRowProps {
	item: transaction.TransactionData;
}

const getDateString = (date: Date) => {
	if (!date) {
		return '';
	}
	return new Intl.DateTimeFormat(i18n.language, {
		dateStyle: 'long',
		timeStyle: 'short',
		timeZone: 'CET',
	}).format(date);
	// const rtf = new Intl.RelativeTimeFormat(i18n.language, {
	// 	style: 'short',
	// 	numeric: 'auto',
	// });
	// if (timeSinceDateMs > MONTH) {
	// 	return rtf.format(-Math.round(timeSinceDateMs / MONTH), 'month');
	// }
	// if (timeSinceDateMs > DAY) {
	// 	return rtf.format(-Math.round(timeSinceDateMs / DAY), 'day');
	// }
	// if (timeSinceDateMs > HOUR) {
	// 	return rtf.format(-Math.round(timeSinceDateMs / HOUR), 'hour');
	// }
	// if (timeSinceDateMs > MINUTE) {
	// 	return rtf.format(-Math.round(timeSinceDateMs / MINUTE), 'minute');
	// }
	// return rtf.format(-Math.round(timeSinceDateMs / SECOND), 'second');
};

export function TransactionRow({
	item,
}: TransactionRowProps): React.ReactElement {
	const { t } = useTranslation();
	const { Id, CreationDate, Status, ResultMessage, Type, DebitedFunds } =
		item;
	const date = CreationDate ? new Date(CreationDate * 1000) : null;
	const amountEur = fromMangopayMoney(DebitedFunds.Amount ?? 0);
	const statusesString: {
		[status in transaction.TransactionStatus]: string;
	} = {
		FAILED: t('Transfer failed'),
		SUCCEEDED: t('Transfer success'),
		CREATED: t('Transfer pending'),
	};
	const helpMessage = ResultMessage
		? t('Error returned from our payment service provider: {{- error}}', {
				error: ResultMessage,
		  })
		: '';

	return (
		<View tw="my-3 flex-row items-center justify-items-stretch">
			<View tw="flex-col">
				<View tw="py-1">
					<Text tw="text-xs text-black dark:text-white">
						{date
							? t('On {{dateStr}}', {
									dateStr: getDateString(date),
							  })
							: t('Unknown date')}
					</Text>
				</View>
				<View tw="flex-row items-center justify-items-stretch py-1">
					<View>
						<Text tw="text-xs text-black dark:text-white">
							{Id}
						</Text>
					</View>
					<View tw="flex-row grow shrink items-center px-2">
						<View tw="mr-1">
							<Text tw="text-base text-black dark:text-white">
								{statusesString[Status]}
							</Text>
						</View>
						{Status === 'FAILED' && (
							<HelpBox
								color={colors.red[500]}
								message={helpMessage}
							/>
						)}
					</View>
				</View>
			</View>
			<View tw="px-2 grow items-end">
				<Text tw="text-base font-semibold text-black dark:text-white">
					{printMoney(amountEur)}
				</Text>
			</View>
			<View tw="pl-2">
				<TransactionIcon
					transactionType={Type}
					transactionStatus={Status}
				/>
			</View>
		</View>
	);
}
