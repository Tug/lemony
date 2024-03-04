/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import config from '../';
import browserslist from 'browserslist';

it('should export an array', () => {
	expect(Array.isArray(config)).toBe(true);
});

it('should not contain invalid queries', () => {
	const result = browserslist([
		'extends @diversifiedfinance/browserslist-config',
	]);

	expect(result).toBeTruthy();
});
