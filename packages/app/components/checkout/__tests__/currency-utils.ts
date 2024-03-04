import {
	addFees,
	computeFees,
	difiedToEUR,
	eurNumber,
	eurToDIFIED,
	subFees,
} from '@diversifiedfinance/app/components/checkout/currency-utils';
import Decimal from 'decimal.js';

describe('EUR to DIFIED conversion with fees', () => {
	it('fees calculation works as expected', () => {
		const fee = 0.05;
		expect(computeFees(100, fee)).toEqual(4.76);
		expect(computeFees(100.01, fee)).toEqual(4.76);
		expect(computeFees(100.02, fee)).toEqual(4.76);
		expect(computeFees(100.03, fee)).toEqual(4.76);
		expect(computeFees(100.04, fee)).toEqual(4.76);
		expect(computeFees(100.05, fee)).toEqual(4.76);
		expect(computeFees(100.11, fee)).toEqual(4.76);
		expect(computeFees(100.15, fee)).toEqual(4.76);
		expect(computeFees(100.38, fee)).toEqual(4.78);
		expect(computeFees(100.43, fee)).toEqual(4.78);
		expect(computeFees(100.51, fee)).toEqual(4.78);
		expect(computeFees(100.77, fee)).toEqual(4.79);
		expect(computeFees(100.88, fee)).toEqual(4.8);
		expect(computeFees(100.9, fee)).toEqual(4.8);
		expect(computeFees(100.97, fee)).toEqual(4.8);
		expect(computeFees(101, fee)).toEqual(4.8);
		expect(computeFees(101.1, fee)).toEqual(4.81);
		expect(computeFees(101.11, fee)).toEqual(4.81);
		expect(computeFees(101.21, fee)).toEqual(4.81);
		expect(computeFees(105, fee)).toEqual(5);

		expect(computeFees(9, fee)).toEqual(0.42);
		expect(computeFees(9.01, fee)).toEqual(0.42);
		expect(computeFees(9.1, fee)).toEqual(0.43);
		expect(computeFees(9.14, fee)).toEqual(0.43);
		expect(computeFees(9.15, fee)).toEqual(0.43);
		expect(computeFees(9.5, fee)).toEqual(0.45);
		expect(computeFees(9.7, fee)).toEqual(0.46);
		expect(computeFees(9.77, fee)).toEqual(0.46);
		expect(computeFees(10, fee)).toEqual(0.47);
	});

	it('sub fees and add fees match or are less than the initial amount', () => {
		const fee = 0.05;

		// Find all the prices that don't match between 100 and 200
		let count = 0;
		for (let i = 0; i <= 10000; i++) {
			const val = new Decimal(100).add(Decimal.div(i, 100));
			const valNumber = eurNumber(val);
			if (valNumber !== addFees(subFees(valNumber, fee), fee)) {
				count++;
				// console.log('rounding error for', valNumber);
			}
		}
		// This should not change unless we change the rounding mode
		expect(count).toEqual(476);

		// 5% of 102.5 is 5.01
		// 107.63 * 5%/(1+5%) = 5.00952380952
		expect(computeFees(105.2, fee)).toEqual(5);
		expect(subFees(105.2, fee)).toEqual(100.2);
		expect(computeFees(100.2, fee, false)).toEqual(5.01);
		expect(addFees(100.2, fee)).toEqual(105.21);

		// 5% of 96.2 is 4.81
		// 101 * 5%/(1+5%) = 4.80952380952
		expect(computeFees(101, fee)).toEqual(4.8);
		expect(subFees(101, fee)).toEqual(96.2);
		expect(computeFees(96.2, fee, false)).toEqual(4.81);
		expect(computeFees(96.19, fee, false)).toEqual(4.8);
		expect(addFees(96.2, fee)).toEqual(101.01);

		// Random tests that don't match
		expect(addFees(subFees(91.34, fee), fee)).toEqual(91.35);
		expect(addFees(subFees(101, fee), fee)).toEqual(101.01);

		// Random tests that matches
		expect(addFees(subFees(91.3, fee), fee)).toEqual(91.3);
		expect(addFees(subFees(91.35, fee), fee)).toEqual(91.35);
		expect(addFees(subFees(91.36, fee), fee)).toEqual(91.36);
		expect(addFees(subFees(91.37, fee), fee)).toEqual(91.37);
		expect(addFees(subFees(91.38, fee), fee)).toEqual(91.38);
		expect(addFees(subFees(91.39, fee), fee)).toEqual(91.39);
		expect(addFees(subFees(100, fee), fee)).toEqual(100);
		expect(addFees(subFees(100.01, fee), fee)).toEqual(100.01);
		expect(addFees(subFees(100.02, fee), fee)).toEqual(100.02);
		expect(addFees(subFees(100.03, fee), fee)).toEqual(100.03);
		expect(addFees(subFees(100.04, fee), fee)).toEqual(100.04);
		expect(addFees(subFees(100.05, fee), fee)).toEqual(100.05);
		expect(addFees(subFees(100.11, fee), fee)).toEqual(100.11);
		expect(addFees(subFees(100.15, fee), fee)).toEqual(100.15);
		expect(addFees(subFees(100.38, fee), fee)).toEqual(100.38);
		expect(addFees(subFees(100.43, fee), fee)).toEqual(100.43);
		expect(addFees(subFees(100.51, fee), fee)).toEqual(100.51);
		expect(addFees(subFees(100.77, fee), fee)).toEqual(100.77);
		expect(addFees(subFees(100.88, fee), fee)).toEqual(100.88);
		expect(addFees(subFees(100.9, fee), fee)).toEqual(100.9);
		expect(addFees(subFees(100.97, fee), fee)).toEqual(100.97);
		expect(addFees(subFees(9, fee), fee)).toEqual(9);
		expect(addFees(subFees(9.01, fee), fee)).toEqual(9.01);
		expect(addFees(subFees(9.1, fee), fee)).toEqual(9.1);
		expect(addFees(subFees(9.11, fee), fee)).toEqual(9.11);
		expect(addFees(subFees(9.12, fee), fee)).toEqual(9.12);
		expect(addFees(subFees(9.13, fee), fee)).toEqual(9.13);
		expect(addFees(subFees(9.15, fee), fee)).toEqual(9.15);
		expect(addFees(subFees(9.5, fee), fee)).toEqual(9.5);
		expect(addFees(subFees(9.6, fee), fee)).toEqual(9.6);
		expect(addFees(subFees(9.7, fee), fee)).toEqual(9.7);
		expect(addFees(subFees(9.77, fee), fee)).toEqual(9.77);
		expect(addFees(subFees(9.8, fee), fee)).toEqual(9.8);
		expect(addFees(subFees(9.89, fee), fee)).toEqual(9.89);
		expect(addFees(subFees(9.9, fee), fee)).toEqual(9.9);
		expect(addFees(subFees(9.95, fee), fee)).toEqual(9.95);
		expect(addFees(subFees(10, fee), fee)).toEqual(10);
	});

	it('adding fees is (mostly) stable', () => {
		const test = (amount: number, fee: number = 0.05) =>
			computeFees(
				difiedToEUR(eurToDIFIED(subFees(amount, fee))),
				fee,
				false
			) + difiedToEUR(eurToDIFIED(subFees(amount, fee)));
		// unstable
		expect(test(101.0)).toEqual(101.01);
		// stable
		expect(test(1.0)).toEqual(1.0);
		expect(test(10.0)).toEqual(10.0);
		expect(test(100.0)).toEqual(100.0);
		expect(test(1000.0)).toEqual(1000.0);
		expect(test(100.01)).toEqual(100.01);
		expect(test(101.01)).toEqual(101.01);
		expect(test(102.11)).toEqual(102.11);
	});
});
