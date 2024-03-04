import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	Video as ExpoVideo,
	ResizeMode,
	Audio,
	InterruptionModeIOS,
	InterruptionModeAndroid,
} from 'expo-av';
import { WP_Block_Parsed } from 'wp-types';
import { Platform, StyleSheet } from 'react-native';
import { View } from '@diversifiedfinance/design-system/view';
import { Image } from '@diversifiedfinance/design-system/image';
import { Pressable } from '@diversifiedfinance/design-system/pressable';

export default function VideoBlock(blockParsedProps: WP_Block_Parsed) {
	const {
		attrs: { src, poster },
	} = blockParsedProps;
	const videoRef = useRef<ExpoVideo | null>(null);
	const [hasPressedThumbnail, setThumbnailPressed] = useState<boolean>(false);
	const onThumbnailPress = async () => {
		setThumbnailPressed(true);
		await videoRef.current?.playAsync();
	};

	useEffect(() => {
		if (Platform.OS !== 'web') {
			Audio.setAudioModeAsync({
				playsInSilentModeIOS: true,
				interruptionModeIOS: InterruptionModeIOS.DuckOthers,
				interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
			}).catch(() => {});
		}
	}, []);

	if (!src) {
		return null;
	}

	return (
		<View
			tw={Platform.select({
				default: 'my-2 h-48',
				web: 'my-2 h-64 max-w-[512px]',
			})}
		>
			{poster && !hasPressedThumbnail && (
				<Pressable
					tw="z-10"
					style={StyleSheet.absoluteFill}
					onPress={onThumbnailPress}
				>
					<Image
						source={{ uri: poster }}
						style={StyleSheet.absoluteFill}
						resizeMode={ResizeMode.COVER}
						alt="Video thumbnail"
					/>
				</Pressable>
			)}
			<ExpoVideo
				ref={videoRef}
				source={{
					uri: src,
				}}
				videoStyle={
					Platform.OS === 'web'
						? {
								position: 'relative',
								width: '100%',
								height: '100%',
						  }
						: {}
				}
				// posterSource={{
				// 	uri: poster ?? '',
				// }}
				style={[StyleSheet.absoluteFill, { justifyContent: 'center' }]}
				resizeMode={ResizeMode.CONTAIN}
				isMuted={false}
				volume={1.0}
				useNativeControls
				onLoadStart={() => setThumbnailPressed(false)}
			/>
		</View>
	);
}
