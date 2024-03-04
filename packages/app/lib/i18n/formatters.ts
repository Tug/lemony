import i18next from 'i18next';
import { printMoney } from '@diversifiedfinance/app/lib/money';

export function init() {
	i18next.services.formatter?.add('money', (value, lng, options) => {
		return printMoney(value);
	});
}
