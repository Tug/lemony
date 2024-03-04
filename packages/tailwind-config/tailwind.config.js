/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');
const { textSizes } = require('@diversifiedfinance/design-system/typography');
const colors = require('./colors');
const safelist = require('./safelist');

const MAX_CONTENT_WIDTH = 1140;
const MAX_HEADER_WIDTH = 1440;

module.exports = {
	// mode: 'jit',
	content: ['./App.{js,jsx,ts,tsx}', '../../packages/**/*.{js,ts,jsx,tsx}'],
	safelist,
	theme: {
		extend: {
			lineHeight: {},
			maxWidth: {
				screen: '100vw',
				'screen-xl': `${MAX_CONTENT_WIDTH}px`,
				'screen-2xl': `${MAX_HEADER_WIDTH}px`,
				'screen-3xl': '1680px',
			},
			colors: {
				black45: 'rgba(0, 0, 0, 0.45)',
				inherit: 'inherit',
				...colors,
			},
			fontFamily: {
				poppins: 'BrickText-Black',
				'poppins-semibold': 'BrickText-Black',
				'poppins-bold': 'BrickText-Black',
				bricktext: 'BrickText-Black',
				'bricktext-black': 'BrickText-Black',
				inter: 'Inter-Regular',
				'inter-semibold': 'Inter-SemiBold',
				'inter-bold': 'Inter-Bold',
				sans: ['Inter-Regular', ...defaultTheme.fontFamily.sans],
			},
		},
	},
	plugins: [
		plugin(({ addUtilities }) => {
			addUtilities({
				'.text-xs': textSizes['text-xs'],
				'.text-13': textSizes['text-13'],
				'.text-sm': textSizes['text-sm'],
				'.text-base': textSizes['text-base'],
				'.text-lg': {
					...textSizes['text-lg'],
					// fontFamily: 'BrickText-Black',
					// fontWeight: 'black',
				},
				'.text-xl': {
					...textSizes['text-xl'],
					fontFamily: 'BrickText-Black',
					fontWeight: 'black',
				},
				'.text-2xl': {
					...textSizes['text-2xl'],
					fontFamily: 'BrickText-Black',
					fontWeight: 'black',
				},
				'.text-3xl': {
					...textSizes['text-3xl'],
					fontFamily: 'BrickText-Black',
					fontWeight: 'black',
				},
				'.text-4xl': {
					...textSizes['text-4xl'],
					fontFamily: 'BrickText-Black',
					fontWeight: 'black',
				},
				'.safe-top': {
					paddingTop: 'constant(safe-area-inset-top)',
					// eslint-disable-next-line no-dupe-keys
					paddingTop: 'env(safe-area-inset-top)',
				},
				'.safe-bottom': {
					paddingBottom: 'constant(safe-area-inset-bottom)',
					// eslint-disable-next-line no-dupe-keys
					paddingBottom: 'env(safe-area-inset-bottom)',
				},
			});
		}),
	],
};
