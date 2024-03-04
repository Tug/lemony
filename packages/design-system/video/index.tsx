import { useVideoConfig } from '@diversifiedfinance/app/context/video-config-context';
import { useViewabilityMount } from '@diversifiedfinance/app/hooks/use-viewability-mount';
import { useMuted } from '@diversifiedfinance/app/providers/mute-provider';
import { Image } from '@diversifiedfinance/design-system/image';
import type { TW } from '@diversifiedfinance/design-system/tailwind';
import { View } from '@diversifiedfinance/design-system/view';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { ComponentProps, useRef, forwardRef } from 'react';
import { StyleSheet, Text } from 'react-native';

type VideoProps = {
	tw?: TW;
	blurhash?: string;
	width?: number;
	height?: number;
} & ComponentProps<typeof ExpoVideo>;

const Video = forwardRef<ExpoVideo, VideoProps>(function Video(
	{
		tw,
		blurhash,
		style,
		width,
		height,
		isMuted: isMutedProp,
		posterSource,
		...props
	}: VideoProps,
	ref
) {
	const videoRef = useRef<ExpoVideo>(null);
	const videoConfig = useVideoConfig();
	const [muted] = useMuted();

	const isMuted = isMutedProp ?? muted;

	const { id } = useViewabilityMount({
		videoRef,
		source: props.source,
		isMuted,
	});

	return (
		<>
			<View style={style} tw={tw}>
				{videoConfig?.previewOnly ? (
					<Image
						tw={tw}
						//@ts-ignore
						width={width}
						height={height}
						blurhash={blurhash}
						source={posterSource as any}
					/>
				) : (
					<>
						<Image
							tw={tw}
							width={width}
							height={height}
							// @ts-ignore
							style={[StyleSheet.absoluteFill, style]}
							blurhash={blurhash}
							source={posterSource as any}
						/>

						<ExpoVideo
							ref={(innerRef) => {
								if (videoRef) {
									videoRef.current = innerRef;
								}
								if (ref) {
									// @ts-ignore
									ref.current = innerRef;
								}
							}}
							style={StyleSheet.absoluteFill}
							useNativeControls={videoConfig?.useNativeControls}
							resizeMode={ResizeMode.CONTAIN}
							posterSource={posterSource}
							isMuted={isMuted}
						/>
					</>
				)}

				{__DEV__ ? (
					<Text
						style={{
							fontSize: 30,
							fontWeight: 'bold',
							color: 'white',
							position: 'absolute',
						}}
					>
						Video {id}
					</Text>
				) : null}
			</View>
		</>
	);
});

export { Video };
