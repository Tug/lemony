export const DEFAULT_CVC_LENGTH = 3;
export const DEFAULT_CARD_FORMAT = /(\d{1,4})/g;
// https://en.wikipedia.org/wiki/Payment_card_number
export const CARD_TYPES = [
	{
		type: 'amex',
		format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
		startPattern: /^3[47]/,
		maxCardNumberLength: 15,
		minCardNumberLength: 15,
		cvcLength: 4,
	},
	{
		type: 'dankort',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^5019/,
		maxCardNumberLength: 16,
		minCardNumberLength: 16,
		cvcLength: DEFAULT_CVC_LENGTH,
	},
	{
		// brazil
		type: 'hipercard',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^(384100|384140|384160|606282|637095|637568|60(?!11))/,
		maxCardNumberLength: 19,
		minCardNumberLength: 19,
		cvcLength: DEFAULT_CVC_LENGTH,
	},
	{
		type: 'dinersclub',
		format: /(\d{1,4})(\d{1,6})?(\d{1,4})?/,
		startPattern: /^(36|38|30[0-5])/,
		maxCardNumberLength: 14,
		minCardNumberLength: 14,
		cvcLength: DEFAULT_CVC_LENGTH,
	},
	{
		type: 'discover',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^(6011|65|64[4-9]|622)/,
		maxCardNumberLength: 19,
		minCardNumberLength: 16,
		cvcLength: DEFAULT_CVC_LENGTH,
	},
	{
		// japan, myanmar, vietnam, philippines
		type: 'jcb',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^35/,
		maxCardNumberLength: 16,
		minCardNumberLength: 19,
		cvcLength: DEFAULT_CVC_LENGTH,
	},
	{
		type: 'laser',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^(6706|6771|6709)/,
		maxCardNumberLength: 19,
		minCardNumberLength: 16,
		cvcLength: DEFAULT_CVC_LENGTH,
	},
	{
		type: 'maestro',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^(?:5[0678]\d{0,2}|6304|67\d{0,2})\d{0,12}/,
		maxCardNumberLength: 19,
		minCardNumberLength: 12,
		cvcLength: DEFAULT_CVC_LENGTH,
	},
	{
		type: 'mastercard',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^(5[1-5]|677189)|^(222[1-9]|2[3-6]\d{2}|27[0-1]\d|2720)/,
		maxCardNumberLength: 16,
		minCardNumberLength: 16,
		cvcLength: DEFAULT_CVC_LENGTH,
	},
	{
		type: 'unionpay',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^62/,
		minCardNumberLength: 16,
		maxCardNumberLength: 19,
		cvcLength: DEFAULT_CVC_LENGTH,
		luhn: false,
	},
	{
		type: 'visaelectron',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^4(026|17500|405|508|844|91[37])/,
		minCardNumberLength: 16,
		maxCardNumberLength: 16,
		cvcLength: DEFAULT_CVC_LENGTH,
	},
	{
		// brazil
		type: 'elo',
		format: DEFAULT_CARD_FORMAT,
		startPattern:
			/^(4011(78|79)|43(1274|8935)|45(1416|7393|763(1|2))|50(4175|6699|67[0-7][0-9]|9000)|627780|63(6297|6368)|650(03([^4])|04([0-9])|05(0|1)|4(0[5-9]|3[0-9]|8[5-9]|9[0-9])|5([0-2][0-9]|3[0-8])|9([2-6][0-9]|7[0-8])|541|700|720|901)|651652|655000|655021)/,
		minCardNumberLength: 16,
		maxCardNumberLength: 16,
		cvcLength: DEFAULT_CVC_LENGTH,
	},
	{
		type: 'visa',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^4/,
		minCardNumberLength: 13,
		maxCardNumberLength: 16,
		cvcLength: DEFAULT_CVC_LENGTH,
	},
] as const;

export const getCardTypeByValue = (value) =>
	CARD_TYPES.find((cardType) => cardType.startPattern.test(value));

export const getCardTypeByType = (type) =>
	CARD_TYPES.find((cardType) => cardType.type === type);

export const getCardNumberMaxLength = (number: string = '') => {
	const cardType = getCardTypeByValue(number);
	const maxLength = cardType ? cardType.maxCardNumberLength : 19;
	return maxLength + 3; // this could be dynamic (number of groups returned by match or length of formatCardNumber of a demo number).
};

export const hasCVCReachedMaxLength = (cvc: string = '', type: string) => {
	const cardType = getCardTypeByType(type);
	if (!cardType) {
		return cvc.length >= DEFAULT_CVC_LENGTH;
	}
	return cvc.length >= cardType.cvcLength;
};

export const formatCardNumber = (cardNumber = '') => {
	const cardType = getCardTypeByValue(cardNumber);
	if (!cardType) return (cardNumber.match(/\d+/g) || []).join('');
	const { format } = cardType;
	if (format.global) {
		return cardNumber.match(format).join(' ');
	}
	const execResult = format.exec(unformatCardNumber(cardNumber));
	if (execResult) {
		return execResult
			.splice(1, 3)
			.filter((x) => x)
			.join(' ');
	}
	return cardNumber;
};

export const formatCvc = (cvc = '') => {
	return (cvc.match(/\d+/g) || []).join('');
};
export const formatExpiry = (value: string = '') => {
	let expiryRaw = value.split(' / ').join('/');
	if (/^[2-9]$/.test(expiryRaw)) {
		expiryRaw = `0${expiryRaw}`;
	}

	if (expiryRaw.length === 2 && +expiryRaw > 12) {
		const [head, ...tail] = expiryRaw;
		expiryRaw = `0${head}/${tail.join('')}`;
	}

	if (/^1[/-]$/.test(expiryRaw)) {
		return `01 / `;
	}

	const matches = expiryRaw.match(/(\d{1,2})/g) || [];
	if (matches.length === 1) {
		if (expiryRaw.includes('/')) {
			return matches[0];
		}
		if (/\d{2}/.test(expiryRaw)) {
			return `${matches[0]} / `;
		}
	}
	if (matches.length > 2) {
		const [, month, year] =
			matches.join('').match(/^(\d{2}).*(\d{2})$/) || [];
		return [month, year].join(' / ');
	}
	return matches.join(' / ');
};

export const unformatCardNumber = (number: string = '') => {
	return number.split(' ').join('');
};

export const isCompleted = ({
	number = '',
	cvc = '',
	expiry = '',
}: {
	number: string;
	cvc: string;
	expiry: string;
}) => {
	const cardType = getCardTypeByValue(number);
	if (!cardType) {
		return false;
	}
	if (cardType.minCardNumberLength > number?.length) {
		return false;
	}
	if (cardType.cvcLength !== cvc?.length) {
		return false;
	}
	const expiryMonth = Number(expiry.substring(0, 2) ?? '');
	if (expiryMonth <= 0 || expiryMonth > 12) {
		return false;
	}
	const year2digits = new Date().getFullYear() - 2000;
	const expiryYear = Number(expiry.substring(5, 7) ?? '');
	if (expiryYear < year2digits) {
		return false;
	}
	if (expiryYear === year2digits) {
		const monthValue = new Date().getMonth() + 1;
		return expiryMonth >= monthValue;
	}
	return true;
};
