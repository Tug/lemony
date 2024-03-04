import i18n from '@diversifiedfinance/app/lib/i18n';
import Decimal from 'decimal.js';

export function printMoney(
	amountInEur: Decimal.Value = 0,
	currency: 'EUR' = 'EUR',
	i18nInstance: { language: string } = i18n
): string {
	return new Intl.NumberFormat(i18nInstance.language, {
		style: 'currency',
		currency,
	})
		.format(Number(amountInEur))
		.replace(/\D00(?=\D*$)/, '');
}
