import Decimal from 'decimal.js';

export const eurNumber = (value: Decimal.Value) =>
	Number(new Decimal(value).toFixed(2, Decimal.ROUND_DOWN));

export const difiedNumber = (value: Decimal.Value, decimals = 3) =>
	Number(new Decimal(value).toFixed(decimals, Decimal.ROUND_DOWN));

export const eurToDIFIED = (eurAmount: number = 0) =>
	difiedNumber(Decimal.div(eurAmount, 10));

export const difiedToEUR = (difiedAmount: number = 0) =>
	eurNumber(Decimal.mul(difiedAmount, 10));

// WARNING: This is used on the server as well to compute the fees
export const computeFees = (
	eurAmount: Decimal.Value,
	feesPercent: Decimal.Value,
	amountIncludesFees = true
): number => {
	const eurAmountDecimal = new Decimal(eurAmount);
	const feesPercentDecimal = new Decimal(feesPercent);
	if (!eurAmountDecimal.isFinite()) {
		return Infinity;
	}
	if (amountIncludesFees) {
		return eurNumber(
			Decimal.sub(
				eurAmountDecimal,
				Decimal.div(
					eurAmountDecimal,
					Decimal.add(1, feesPercentDecimal)
				)
			)
		);
	}
	return eurNumber(eurAmountDecimal.mul(feesPercentDecimal));
};

export const subFees = (amount: number, feesPercent: number) => {
	const fees = computeFees(amount, feesPercent, true);
	return eurNumber(Decimal.sub(amount, fees));
};

export const addFees = (amount: number, feesPercent: number) => {
	const fees = computeFees(amount, feesPercent, false);
	return eurNumber(Decimal.add(amount, fees));
};

export const DecimalMath = {
	add: (...values: Decimal.Value[]) => {
		let sum = new Decimal(0);
		for (const value of values) {
			sum = Decimal.add(sum, value);
		}
		return eurNumber(sum);
	},
	mul: (...values: Decimal.Value[]) => {
		let sum = new Decimal(0);
		for (const value of values) {
			sum = Decimal.mul(sum, value);
		}
		return eurNumber(sum);
	},
	sub: (a: Decimal.Value, b: Decimal.Value) => eurNumber(Decimal.sub(a, b)),
	div: (a: Decimal.Value, b: Decimal.Value) => eurNumber(Decimal.div(a, b)),
};
