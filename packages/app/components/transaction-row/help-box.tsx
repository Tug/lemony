import { Help } from '@diversifiedfinance/design-system/icon';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import * as Tooltip from 'universal-tooltip';
import { Pressable, View } from '@diversifiedfinance/design-system';
import { Platform } from 'react-native';
import { useState } from 'react';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
const TriggerView = Platform.OS === 'web' ? View : Pressable;

export const HelpBox = ({
	message,
	color,
}: {
	message: string;
	color: string;
}) => {
	const isDark = useIsDarkMode();
	const [isTooltipOpen, setTooltipOpen] = useState(false);

	return (
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
						color={color ?? colors.gray[300]}
						width={16}
						height={16}
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
					style={{
						color: isDark ? '#000' : '#fff',
					}}
					text={message}
				/>
			</Tooltip.Content>
		</Tooltip.Root>
	);
};
