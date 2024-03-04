/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import babelPresetDefault from '../';
import { transform } from '@babel/core';
import { readFileSync } from 'fs';
import path from 'path';

describe('Babel preset default', () => {
	test('transpilation works properly', () => {
		const filename = path.join(__dirname, '/fixtures/input.js');
		const input = readFileSync(filename);

		const output = transform(input, {
			filename,
			configFile: false,
			envName: 'production',
			presets: [babelPresetDefault],
		});

		expect(output.code).toMatchSnapshot();
	});
});
