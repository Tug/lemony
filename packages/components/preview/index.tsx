import { useMemo, memo } from 'react';
import { Platform, ViewStyle } from 'react-native';

import { Video } from 'expo-av';
import { ImageProps } from 'expo-image';

import { Image } from '@diversifiedfinance/design-system/image';
import { styled } from '@diversifiedfinance/design-system/tailwind';
import { View } from '@diversifiedfinance/design-system/view';

import { contentFitToresizeMode } from '@diversifiedfinance/app/utilities';

import { MuteButton } from '../mute-button';

export const supportedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
export const supportedVideoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];

type PreviewProps = {
	file?: File | string;
	type?: 'image' | 'video';
	tw?: string;
	style?: any;
	resizeMode?: ImageProps['contentFit'];
	width: number;
	height: number;
	isMuted?: boolean;
	showMuteButton?: boolean;
	isLooping?: boolean;
};

const StyledVideo = styled(Video);
const videoStyle: ViewStyle = {
	position: Platform.OS === 'web' ? 'relative' : 'absolute',
};
export const Preview = memo(function Preview({
	tw = '',
	style,
	type,
	file,
	resizeMode = 'cover',
	width,
	height,
	isMuted = true,
	isLooping = false,
	showMuteButton = false,
}: PreviewProps) {
	const uri = getLocalFileURI(file);

	const fileType = useMemo(() => {
		if (type) return type;

		if (typeof file === 'string') {
			// try to get file type from file extension
			const fileExtension =
				typeof file === 'string' ? file?.split('.').pop() : undefined;
			const isVideo =
				(fileExtension &&
					supportedVideoExtensions.includes(fileExtension)) ||
				file.includes('data:video/');

			return isVideo ? 'video' : 'image';
		} else if (typeof file === 'object') {
			return file?.type.includes('video') ? 'video' : 'image';
		}
	}, [file, type]);
	if (uri) {
		if (fileType === 'image') {
			return (
				<Image
					tw={tw}
					resizeMode={resizeMode}
					source={{
						uri: uri as string,
					}}
					width={width}
					height={height}
					onLoad={() => {
						revokeObjectURL(uri);
					}}
					style={style}
					alt="Preview Image"
				/>
			);
		}

		if (fileType === 'video') {
			return (
				<>
					<StyledVideo
						tw={tw}
						style={[
							{
								width,
								height,
								justifyContent: 'center',
								alignItems: 'center',
							},
							style,
						]}
						resizeMode={contentFitToresizeMode(resizeMode)}
						source={{ uri: uri as string }}
						isMuted={isMuted}
						shouldPlay
						isLooping={isLooping}
						videoStyle={videoStyle}
						onLoad={() => {
							revokeObjectURL(uri);
						}}
					/>
					{showMuteButton && (
						<View tw="z-9 absolute bottom-2.5 right-2.5">
							<MuteButton />
						</View>
					)}
				</>
			);
		}
	}

	return null;
});

export const getLocalFileURI = (file?: string | File) => {
	if (!file) return null;

	if (typeof file === 'string') return file;

	if (Platform.OS === 'web') return (URL || webkitURL)?.createObjectURL(file);

	return file;
};
/**
 * Browsers will release object URLs automatically when the document is unloaded;
 * for optimal performance and memory usage
 * if there are safe times when you can explicitly unload them, you should do so.
 *
 * @param  uri
 * @return
 */
export const revokeObjectURL = (uri: any) => {
	if (!uri || Platform.OS !== 'web' || typeof uri !== 'string') return;
	(URL || webkitURL).revokeObjectURL(uri);
};
