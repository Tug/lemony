import { Button } from '@diversifiedfinance/design-system/button';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { ArrowRight } from '@diversifiedfinance/design-system/icon';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';

import { SnackbarProvider, useSnackbar } from './index';

export default {
	component: SnackbarProvider,
	title: 'Components/Snackbar',
};
export const Basic = () => {
	const snackbar = useSnackbar();
	const isDark = useIsDarkMode();
	const toggleSnackbar = (cb: () => void) => {
		if (snackbar?.isVisible) {
			snackbar.hide();
		} else {
			cb();
		}
	};
	return (
		<View tw="flex-1 items-center justify-center bg-gray-600">
			<Button
				tw="mb-4"
				onPress={() =>
					toggleSnackbar(() =>
						snackbar?.show({
							text: 'Minting “A day in the woods...”',
						})
					)
				}
			>
				Show default
			</Button>
			<Button
				tw="mb-4"
				onPress={() =>
					toggleSnackbar(() =>
						snackbar?.show({
							text: 'Minting “A day in the woods...”',
							iconStatus: 'waiting',
						})
					)
				}
			>
				Show to waiting
			</Button>

			<Button
				tw="mb-4"
				onPress={() =>
					snackbar?.update({
						text: 'Minting “A day in the woods...”',
						iconStatus: 'done',
						action: {
							text: 'View',
							onPress: () => {
								console.log('View');
							},
							element: (
								<View tw="flex-row items-center justify-center">
									<Text
										tw="text-xs font-bold text-white dark:text-gray-900"
										numberOfLines={1}
									>
										View
									</Text>
									<ArrowRight
										width={14}
										height={14}
										color={
											isDark
												? colors.gray[900]
												: colors.white
										}
									/>
								</View>
							),
						},
					})
				}
			>
				Update to success
			</Button>
			<Button
				tw="mb-4"
				onPress={() =>
					toggleSnackbar(() => {
						snackbar?.show({
							text: 'Minting “A day in the woods...”',
							iconStatus: 'waiting',
							preset: 'explore',
						});
					})
				}
			>
				Show explore style
			</Button>

			<View tw="flex-row items-center justify-center">
				<Text tw="text-base text-gray-300 dark:text-white">
					Transition:
				</Text>
				<Button
					tw="ml-4"
					onPress={() =>
						toggleSnackbar(() =>
							snackbar?.show({
								text: 'Minting “A day in the woods...”',
								transition: 'slide',
							})
						)
					}
				>
					Slide
				</Button>
				<Button
					tw="ml-4"
					onPress={() =>
						toggleSnackbar(() =>
							snackbar?.show({
								text: 'Minting “A day in the woods...”',
								transition: 'scale',
							})
						)
					}
				>
					Grow
				</Button>
				<Button
					tw="ml-4"
					onPress={() =>
						toggleSnackbar(() =>
							snackbar?.show({
								text: 'Minting “A day in the woods...”',
								transition: 'fade',
							})
						)
					}
				>
					Fade
				</Button>
			</View>

			<Button tw="mt-4" onPress={() => snackbar?.hide()}>
				Hide
			</Button>
		</View>
	);
};
