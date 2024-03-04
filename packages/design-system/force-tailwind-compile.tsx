import { View } from './view';
import { Text } from './text';
import React from 'react';

/**
 * Tailwind CSS does not support dynamic class names
 * See: https://tailwindcss.com/docs/content-configuration#dynamic-class-names
 * It has a `safelist` option in tailwind.config.js but it does not seem to help
 * TODO NEXT: investigate why safelist is not working
 *
 * We're listing here all the dynamic classes we want to use in Text components
 */
export const DynamicTextClasses = () => (
	<View>
		<Text tw="text-primary-100 text-xs font-light"></Text>
		<Text tw="text-primary-200 text-sm font-normal"></Text>
		<Text tw="text-primary-300 text-base font-medium"></Text>
		<Text tw="text-primary-400 text-lg font-semibold"></Text>
		<Text tw="text-primary-500 text-xl font-bold"></Text>
		<Text tw="text-primary-600 text-left text-2xl"></Text>
		<Text tw="text-primary-700 text-center text-3xl"></Text>
		<Text tw="text-primary-800 text-right text-4xl"></Text>
		<Text tw="text-primary-900 text-justify text-5xl"></Text>
		<Text tw="text-secondary-100 text-start text-6xl"></Text>
		<Text tw="text-secondary-200 text-end text-7xl"></Text>
		<Text tw="text-secondary-300 break-normal text-8xl"></Text>
		<Text tw="text-secondary-400 break-words"></Text>
		<Text tw="text-secondary-500	break-all"></Text>
		<Text tw="text-secondary-600 break-keep"></Text>
		<Text tw="text-secondary-700"></Text>
		<Text tw="text-secondary-800"></Text>
		<Text tw="text-secondary-900"></Text>
		<Text tw="text-secondary-900"></Text>
		<Text tw="text-success-100 dark:text-white"></Text>
		<Text tw="text-success-200"></Text>
		<Text tw="text-success-300"></Text>
		<Text tw="text-success-400"></Text>
		<Text tw="text-success-500"></Text>
		<Text tw="text-success-600"></Text>
		<Text tw="text-success-700"></Text>
		<Text tw="text-success-800"></Text>
		<Text tw="text-success-900"></Text>
		<Text tw="text-info-100"></Text>
		<Text tw="text-info-200"></Text>
		<Text tw="text-info-300"></Text>
		<Text tw="text-info-400"></Text>
		<Text tw="text-info-500"></Text>
		<Text tw="text-info-600"></Text>
		<Text tw="text-info-700"></Text>
		<Text tw="text-info-800"></Text>
		<Text tw="text-info-900"></Text>
		<Text tw="text-warning-100"></Text>
		<Text tw="text-warning-200"></Text>
		<Text tw="text-warning-300"></Text>
		<Text tw="text-warning-400"></Text>
		<Text tw="text-warning-500"></Text>
		<Text tw="text-warning-600"></Text>
		<Text tw="text-warning-700"></Text>
		<Text tw="text-warning-800"></Text>
		<Text tw="text-warning-900"></Text>
		<Text tw="text-danger-100"></Text>
		<Text tw="text-danger-200"></Text>
		<Text tw="text-danger-300"></Text>
		<Text tw="text-danger-400"></Text>
		<Text tw="text-danger-500"></Text>
		<Text tw="text-danger-600"></Text>
		<Text tw="text-danger-700"></Text>
		<Text tw="text-danger-800"></Text>
		<Text tw="text-danger-900"></Text>
		<Text tw="text-accent-100"></Text>
		<Text tw="text-accent-200"></Text>
		<Text tw="text-accent-300"></Text>
		<Text tw="text-accent-400"></Text>
		<Text tw="text-accent-500"></Text>
		<Text tw="text-accent-600"></Text>
		<Text tw="text-accent-700"></Text>
		<Text tw="text-accent-800"></Text>
		<Text tw="text-accent-900"></Text>
	</View>
);

/**
 * Tailwind CSS does not support dynamic class names
 * See: https://tailwindcss.com/docs/content-configuration#dynamic-class-names
 *
 * We're listing here all the dynamic classes we want to use in View components
 * TODO NEXT: load content from the API on build time, refresh on launch
 */
export const DynamicViewClasses = () => (
	<View tw="gap m-2 h-full max-h-full w-full max-w-full flex-1 flex-row p-2">
		<View tw="m-1 flex grow basis-1 flex-col content-between items-stretch justify-between gap-1 self-stretch p-1"></View>
		<View tw="m-2 flex grow-0 basis-2 flex-col content-start items-start justify-start gap-2 self-start p-2"></View>
		<View tw="m-3 flex grow basis-3 flex-col content-center items-center justify-center gap-3 self-center p-3"></View>
		<View tw="m-4 flex grow basis-4 flex-col content-end items-end justify-end gap-4 self-end p-4"></View>
		<View tw="m-6 flex grow basis-6 flex-col flex-wrap gap-6 rounded border p-6"></View>
		<View tw="m-8 flex grow basis-8 flex-col flex-nowrap gap-8 rounded-md border-0 p-8"></View>
		<View tw="m-12 flex grow basis-12 flex-col gap-12 rounded-lg border-2 p-12"></View>
		<View tw="m-16 flex grow basis-16 flex-col gap-16 rounded-xl border-4 p-16"></View>
		<View tw="m-24 flex grow basis-24 flex-col gap-24 rounded-2xl border-none rounded-none p-24"></View>
		<View tw="m-32 flex grow basis-32 flex-col gap-32 rounded-3xl border-b-none rounded-b-none border-t-none rounded-t-none border-r-none rounded-r-none border-l-none rounded-l-none p-32"></View>
		<View tw="mx-1 my-1 flex grow basis-0 flex-row-reverse rounded-full px-1 py-1"></View>
		<View tw="mx-2 my-2 flex grow basis-0 flex-col-reverse justify-self-stretch px-2 py-2"></View>
		<View tw="mx-3 my-3 flex shrink basis-0 flex-col justify-self-stretch px-3 py-3"></View>
		<View tw="mx-4 my-4 flex shrink-0 basis-0 flex-col justify-self-center px-4 py-4"></View>
		<View tw="order-1 mx-6 my-6 flex basis-0 flex-col justify-self-start px-6 py-6"></View>
		<View tw="order-2 mx-8 my-8 flex basis-0 flex-col justify-self-end px-8 py-8"></View>
		<View tw="order-3 mx-12 my-12 flex basis-0 flex-col px-12 py-12"></View>
		<View tw="order-4 mx-16 my-16 flex basis-0 flex-col px-16 py-16"></View>
		<View tw="order-5 mx-24 my-24 flex basis-0 flex-col px-24 py-24"></View>
		<View tw="order-6 mx-32 my-32 flex basis-0 flex-col px-32 py-32"></View>
		<View tw="absolute mb-2 overflow-hidden pb-2"></View>
		<View tw="fixed mb-4 inline overflow-scroll pb-4"></View>
		<View tw="sticky mb-8 pb-8"></View>
		<View tw="pb--16 relative mb-16"></View>
		<View tw="static mb-32 pb-32"></View>
		<View tw="absolute mt-2 overflow-hidden pt-2"></View>
		<View tw="fixed mt-4 inline overflow-scroll pt-4"></View>
		<View tw="sticky mt-8 pt-8"></View>
		<View tw="relative mt-16 pt-16"></View>
		<View tw="static mt-32 pt-32"></View>
	</View>
);
