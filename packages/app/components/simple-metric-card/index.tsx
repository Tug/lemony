import { Pressable, Text, View } from '@diversifiedfinance/design-system';
import type { TW } from '@diversifiedfinance/design-system/tailwind';
import React, { ReactNode, useState } from 'react';
import { Platform } from 'react-native';
import { Help } from '@diversifiedfinance/design-system/icon';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import * as Tooltip from 'universal-tooltip';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
const TriggerView = Platform.OS === 'web' ? View : Pressable;

export interface SimpleMetricCardProps {
	tw?: string | Array<string> | TW[];
	label: string;
	right?: ReactNode;
	children: string | ReactNode;
	helpMessage?: string;
}

export default function SimpleMetricCard({
	tw = '',
	label,
	right,
	helpMessage,
	children,
}: SimpleMetricCardProps) {
	const [isTooltipOpen, setTooltipOpen] = useState(false);
	const isDark = useIsDarkMode();

	return (
		<View
			tw={[
				'grow flex-row items-stretch justify-between rounded-2xl bg-homeLightBlue p-4 dark:bg-gray-900',
				tw,
			]}
		>
			<View tw="shrink grow flex-col items-stretch justify-between mt-1 mr-2">
				<View tw="pr-1 pb-2 flex-row flex-wrap">
					<Text tw="text-sm font-bold leading-4 text-gray-900 dark:text-white">
						{label}
					</Text>
				</View>
				<View tw="w-full">
					{typeof children === 'string' ? (
						<Text tw="text-diversifiedBlue dark:text-themeYellow text-base font-bold">
							{children}
						</Text>
					) : (
						children
					)}
				</View>
			</View>
			<View tw="mt-2 justify-end">{right}</View>
			<View tw="absolute top-1 right-2">
				{helpMessage && (
					<Tooltip.Root
						{...Platform.select({
							web: {},
							default: {
								open: isTooltipOpen,
								onDismiss: () => setTooltipOpen(false),
							},
						})}
					>
						<Tooltip.Trigger>
							<TriggerView
								{...Platform.select({
									web: {},
									default: {
										open: isTooltipOpen,
										onPress: () => setTooltipOpen(true),
									},
								})}
							>
								<Help
									color={
										isDark
											? colors.themeYellow
											: colors.blueGray[400]
									}
									width={20}
									height={20}
								/>
							</TriggerView>
						</Tooltip.Trigger>
						<Tooltip.Content
							sideOffset={5}
							containerStyle={{
								paddingLeft: 10,
								paddingRight: 10,
								paddingTop: 6,
								paddingBottom: 6,
							}}
							className="web:outline-none"
							side="top"
							presetAnimation="fadeIn"
							backgroundColor={colors.diversifiedBlue}
							borderRadius={12}
							onTap={() => setTooltipOpen(false)}
							dismissDuration={500}
							maxWidth={200}
						>
							<Tooltip.Text
								textSize={14}
								textColor={colors.white}
								// style={{
								// 	fontSize: 14,
								// 	color: isDark ? colors.black : colors.white,
								// }}
								text={helpMessage}
							/>
						</Tooltip.Content>
					</Tooltip.Root>
				)}
			</View>
		</View>
	);
}
