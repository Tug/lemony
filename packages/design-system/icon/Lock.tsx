import * as React from 'react';

import Svg, { SvgProps, Path } from 'react-native-svg';

const SvgLock = (props: SvgProps) => {
	if (!props.width || Number(props.width) <= 24) {
		return <SvgLockSmall {...props} />;
	}

	return (
		<Svg width={24} height={24} viewBox="0 0 20 20" fill="none" {...props}>
			<Path
				d="M15.062 18H4.938C3.869 18 3 17.232 3 16.289v-6.76c0-.943.87-1.711 1.938-1.711h10.124c1.069 0 1.938.768 1.938 1.711v6.76c0 .943-.87 1.711-1.938 1.711ZM4.938 8.545c-.615 0-1.114.442-1.114.985v6.759c0 .542.5.984 1.114.984h10.124c.615 0 1.115-.442 1.115-.984v-6.76c0-.542-.5-.984-1.115-.984H4.938Z"
				fill={props.color}
			/>
			<Path
				d="M14.117 8.545H5.882V5.273C5.882 3.376 7.614 2 10 2s4.117 1.376 4.117 3.273v3.272Zm-7.411-.727h6.588V5.273c0-1.5-1.355-2.546-3.294-2.546-1.94 0-3.294 1.047-3.294 2.546v2.545ZM10 13.273c-.909 0-1.647-.653-1.647-1.455S9.09 10.364 10 10.364c.908 0 1.647.652 1.647 1.454 0 .803-.739 1.455-1.647 1.455Zm0-2.182c-.454 0-.824.326-.824.727 0 .401.37.728.824.728.454 0 .823-.327.823-.728 0-.4-.37-.727-.823-.727Z"
				fill={props.color}
			/>
			<Path
				d="M10 15.091c-.228 0-.412-.163-.412-.364V12.91c0-.2.184-.364.412-.364.227 0 .412.163.412.364v1.818c0 .201-.185.364-.412.364Z"
				fill={props.color}
			/>
		</Svg>
	);
};

const SvgLockSmall = (props: SvgProps) => (
	<Svg
		width={24}
		height={24}
		fill="currentColor"
		viewBox="0 0 24 24"
		{...props}
	>
		<Path
			fillRule="evenodd"
			d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7c0-1.1.9-2 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6c.6 0 1 .4 1 1v3a1 1 0 1 1-2 0v-3c0-.6.4-1 1-1Z"
			clipRule="evenodd"
		/>
	</Svg>
);

export default SvgLock;
