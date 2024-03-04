import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { View } from '@diversifiedfinance/design-system/view';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Extrapolation } from 'react-native-reanimated';

const width = 50;
const height = 28;
const thumbHeight = 24;
const thumbWidth = 24;
const thumbOffset = 2;

export type SwitchProps = {
	checked?: boolean;
	onChange?: (nextValue: boolean) => void;
};

export const Switch = (props: SwitchProps) => {
	const { checked, onChange, ...rest } = props;

	const isDark = useIsDarkMode();

	return (
		<Pressable
			style={styles.pressableStyle}
			onPress={useCallback(() => {
				if (onChange) {
					onChange(!checked);
				}
			}, [onChange, checked])}
			role="switch"
			accessibilityState={{ checked }}
			{...rest}
		>
			<View style={styles.gradientWrapper}>
				<LinearGradient
					colors={
						checked
							? [
									colors.primary[300],
									colors.primary[500],
									colors.primary[900],
							  ]
							: isDark
							? ['#3F3F46', '#3F3F46', '#3F3F46']
							: ['#D4D4D8', '#D4D4D8', '#D4D4D8']
					}
					start={[0, 1]}
					end={[1, 0]}
					locations={[0, 0.4, 1]}
					style={{ width, height }}
				/>
			</View>
			<MotiView
				style={styles.thumbStyle}
				animate={{
					translateX: checked
						? width - thumbWidth - thumbOffset
						: thumbOffset,
				}}
				// @ts-ignore
				transition={{ overshootClamping: Extrapolation.CLAMP }}
			/>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	thumbStyle: {
		position: 'absolute',
		height: thumbHeight,
		width: thumbWidth,
		backgroundColor: 'white',
		borderRadius: 999,
	},
	pressableStyle: {
		justifyContent: 'center',
		width,
	},
	gradientWrapper: { overflow: 'hidden', borderRadius: 999 },
});
