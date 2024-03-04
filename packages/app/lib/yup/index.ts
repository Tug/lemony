import * as yup from 'yup';
import { iban } from './validators/iban';

yup.addMethod(yup.mixed, 'isRequired', function (message) {
	return this.required(message).typeError(message);
});

yup.addMethod(yup.string, 'iban', iban);

yup.addMethod(yup.string, 'or', function (schemas, msg) {
	return this.test({
		name: 'or',
		message: 'Please enter valid value' || msg,
		test: (value) => {
			if (Array.isArray(schemas) && schemas.length > 1) {
				const resee = schemas.map((schema) =>
					schema.isValidSync(value)
				);
				return resee.some((res) => res);
			}
			throw new TypeError('Schemas is not correct array schema');
		},
		exclusive: false,
	});
});

// https://github.com/jquense/yup/issues/507
yup.addMethod(yup.string, 'isEmail', function (message) {
	const emailRegex = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z0-9-]+$/i;

	return this.test('validateIsEmail', function (value) {
		return !value || emailRegex.test(value)
			? true
			: this.createError({
					message,
			  });
	});
});

export { yup };
