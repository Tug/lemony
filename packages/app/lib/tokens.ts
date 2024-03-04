import { Project } from '@diversifiedfinance/types';
import { ReactNode } from 'react';
import i18n from '@diversifiedfinance/app/lib/i18n';

export function getTokenAmount(quantityInDecimal: number, project: Project) {
	return quantityInDecimal / Math.pow(10, project.tokenDecimals);
}

export const printTokenAmount = (
	amount: number,
	renderer?: ({
		whole,
		fractional,
		separator,
	}: {
		whole: string;
		fractional: string;
		separator: string;
	}) => ReactNode,
	maxTokensDigits: number = 4,
	i18nInstance: { language: string } = i18n
) => {
	if (!renderer) {
		return amount.toString();
	}
	const [whole, fractional] = amount.toString().split('.');
	return renderer({
		whole: new Intl.NumberFormat(i18nInstance.language, {
			style: 'decimal',
		}).format(Math.round(Number(whole))),
		fractional: fractional?.slice(0, maxTokensDigits),
		separator:
			new Intl.NumberFormat(i18nInstance.language, {
				style: 'decimal',
			})
				.format(0.1)
				.replace(/\d/g, '') ?? '.',
	});
};
