/** @type {import('tailwindcss').Config} */
const nativeTheme = require('./tailwind.config.js');
const defaultTheme = require('tailwindcss/defaultTheme');
const {
	textSizes,
	fontFamily,
} = require('@diversifiedfinance/design-system/typography');
const plugin = require('tailwindcss/plugin');

module.exports = {
	...nativeTheme,
	important: 'html',
	darkMode: 'class',
	content: [...nativeTheme.content, './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		...nativeTheme.theme,
		extend: {
			...nativeTheme.theme.extend,
			maxWidth: {
				...nativeTheme.theme.extend.maxWidth,
				60: '240px',
			},
			boxShadow: {
				dark: '0px 0px 2px rgba(255, 255, 255, 0.5), 0px 8px 16px rgba(255, 255, 255, 0.1)',
				light: '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 4px 8px rgba(0, 0, 0, 0.05)',
				'lg-dark':
					'0px 0px 2px rgba(255, 255, 255, 0.5), 0px 16px 48px rgba(255, 255, 255, 0.2)',
				'lg-light':
					'0px 12px 16px rgba(0, 0, 0, 0.1), 0px 16px 48px rgba(0, 0, 0, 0.1)',
			},
			borderRadius: {
				inherit: 'inherit',
				4: '16px',
			},
			cursor: {
				copy: 'copy',
			},
			fontFamily: {
				inter: 'var(--font-inter)',
				'inter-semibold': 'var(--font-inter)',
				'inter-bold': 'var(--font-inter)',
				poppins: 'var(--font-brick-text)',
				'poppins-semibold': 'var(--font-brick-text)',
				'poppins-bold': 'var(--font-brick-text)',
				brick: 'var(--font-brick-text)',
				'brick-semibold': 'var(--font-brick-text)',
				'brick-bold': 'var(--font-brick-text)',
				sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
			},
			whitespace: {
				'break-spaces': 'break-spaces',
			},
			fill: {
				black: 'black',
				white: 'white',
			},
			zIndex: {
				1: 1,
				2: 2,
			},
			keyframes: {
				'bounce-in': {
					'0%': { transform: 'scale(1)', opacity: 0 },
					'50%': { transform: 'scale(1.1)', opacity: 1 },
					'100%': { transform: 'scale(1)', opacity: 1 },
				},
				'fade-in': {
					from: { opacity: 0 },
					to: { opacity: 1 },
				},
			},
			animation: {
				'bounce-in': 'bounce-in 250ms',
				'fade-in': 'fade-in 150ms',
			},
		},
	},
	plugins: [
		require('nativewind/tailwind/css'),
		require('@neojp/tailwindcss-line-clamp-utilities'),
		plugin(({ addUtilities }) => {
			addUtilities({
				'.text-xs': textSizes['text-xs'],
				'.text-13': textSizes['text-13'],
				'.text-sm': textSizes['text-sm'],
				'.text-base': textSizes['text-base'],
				'.text-lg': {
					...textSizes['text-lg'],
					// fontFamily: 'var(--font-brick-text)',
					// fontWeight: 'black',
				},
				'.text-xl': {
					...textSizes['text-xl'],
					fontFamily: 'var(--font-brick-text)',
					fontWeight: 'black',
				},
				'.text-2xl': {
					...textSizes['text-2xl'],
					fontFamily: 'var(--font-brick-text)',
					fontWeight: 'black',
				},
				'.text-3xl': {
					...textSizes['text-3xl'],
					fontFamily: 'var(--font-brick-text)',
					fontWeight: 'black',
				},
				'.text-4xl': {
					...textSizes['text-4xl'],
					fontFamily: 'var(--font-brick-text)',
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
