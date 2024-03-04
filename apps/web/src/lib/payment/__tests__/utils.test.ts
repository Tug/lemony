import { getNetAmountAndFeesV101, mangopayMoneyToDecimal } from '../utils';
import Decimal from 'decimal.js';
import {
	addFees,
	computeFees,
	DecimalMath,
	difiedToEUR,
	subFees,
} from '@diversifiedfinance/app/components/checkout/currency-utils';
import { toMangopayMoneyType } from '@diversifiedfinance/app/lib/mangopay';
import { MAX_AMOUNT_EUR } from '@diversifiedfinance/app/lib/constants';

describe('getNetAmountAndFeesV101', () => {
	it('there is a surjection from eur to dified (every possible eur amount can be spent)', () => {
		const project = { feesPercent: new Decimal(5) };

		expect(getNetAmountAndFeesV101(new Decimal(100), project)).toEqual({
			netAmount: new Decimal(95.24),
			feesAmount: new Decimal(4.76),
			net: 95.24,
			fees: 4.76,
		});
		expect(getNetAmountAndFeesV101(new Decimal(100.99), project)).toEqual({
			netAmount: new Decimal(96.19),
			feesAmount: new Decimal(4.8),
			net: 96.19,
			fees: 4.8,
		});
		// 101 has rounding errors with 5% fees
		expect(getNetAmountAndFeesV101(new Decimal(101), project)).toEqual({
			netAmount: new Decimal(96.2),
			feesAmount: new Decimal(4.8),
			net: 96.2,
			fees: 4.8,
		});
		expect(getNetAmountAndFeesV101(new Decimal(101.01), project)).toEqual({
			netAmount: new Decimal(96.2),
			feesAmount: new Decimal(4.81),
			net: 96.2,
			fees: 4.81,
		});
		expect(getNetAmountAndFeesV101(new Decimal(101.1), project)).toEqual({
			netAmount: new Decimal(96.29),
			feesAmount: new Decimal(4.81),
			net: 96.29,
			fees: 4.81,
		});
	});

	it('matches the client implementation for all amounts between €0 and €200.00', () => {
		const project = { feesPercent: new Decimal(5) };
		const fees = 0.05;
		for (let i = 0; i <= 20000; i++) {
			const val = new Decimal(0).add(Decimal.div(i, 100));
			const clientFees = computeFees(val, fees, true);
			const clientNetAmount = subFees(val.toNumber(), fees);
			expect(getNetAmountAndFeesV101(val, project)).toEqual({
				netAmount: new Decimal(clientNetAmount),
				feesAmount: new Decimal(clientFees),
				net: clientNetAmount,
				fees: clientFees,
			});
		}
	});

	it('matches the client implementation for all integer amounts of DIFIED', () => {
		const project = { feesPercent: new Decimal(5) };
		const fees = 0.05;
		for (
			let difiedAmount = 1;
			difiedAmount <= MAX_AMOUNT_EUR / 10;
			difiedAmount++
		) {
			// use same calculation as in checkout component
			const clientNetAmount = difiedToEUR(difiedAmount);
			const clientFees = computeFees(clientNetAmount, fees, false);
			const clientGrossAmount = DecimalMath.add(
				clientNetAmount,
				clientFees
			);
			const totalCent = toMangopayMoneyType(clientGrossAmount);
			// use same calculation as in
			const amountDecimal = mangopayMoneyToDecimal(totalCent);
			expect(getNetAmountAndFeesV101(amountDecimal, project)).toEqual({
				netAmount: new Decimal(clientNetAmount),
				feesAmount: new Decimal(clientFees),
				net: clientNetAmount,
				fees: clientFees,
			});
		}
	});
});
