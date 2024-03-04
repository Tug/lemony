import * as React from 'react';
import Svg, { SvgProps, G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgTezos(props: SvgProps) {
	return (
		<Svg
			width="1em"
			height="1em"
			viewBox="0 0 24 24"
			fill="none"
			{...props}
		>
			<G clipPath="url(#Tezos_svg__clip0_61:23)">
				<Path
					d="M14.584 24c-1.723 0-2.978-.412-3.766-1.237-.788-.825-1.182-1.714-1.182-2.667 0-.348.068-.641.206-.88.134-.234.329-.43.564-.563.238-.138.531-.206.88-.206.348 0 .64.068.88.206.237.137.425.326.563.564.137.238.206.531.206.88 0 .42-.101.764-.303 1.03-.201.266-.44.44-.715.523.239.33.615.563 1.128.7a5.57 5.57 0 001.54.22c.714 0 1.36-.192 1.937-.577.578-.385 1.004-.953 1.279-1.704.275-.752.412-1.604.412-2.557 0-1.036-.151-1.92-.453-2.653-.294-.742-.729-1.292-1.307-1.65a3.488 3.488 0 00-1.869-.536c-.44 0-.99.184-1.65.55l-1.209.605v-.605l5.444-7.257H9.636v7.532c0 .623.137 1.136.412 1.54.275.403.697.605 1.265.605.44 0 .861-.147 1.264-.44a4.47 4.47 0 001.045-1.072.405.405 0 01.137-.18.274.274 0 01.18-.068c.1 0 .219.05.357.152a.747.747 0 01.192.508c-.016.13-.039.258-.069.385-.311.696-.742 1.228-1.292 1.594a3.202 3.202 0 01-1.814.55c-1.631 0-2.759-.32-3.382-.962-.623-.642-.934-1.512-.934-2.612V6.186h-3.85V4.783h3.85V1.595l-.88-.88V0h2.557l.961.495v4.288l9.953-.027.99.99-6.104 6.103a4.09 4.09 0 011.155-.275c.66 0 1.402.21 2.227.632.834.413 1.475.981 1.924 1.704.45.715.738 1.403.866 2.062.137.66.206 1.247.206 1.76a7.329 7.329 0 01-.742 3.272 4.806 4.806 0 01-2.254 2.254 7.323 7.323 0 01-3.272.742z"
					fill={props.color}
				/>
			</G>
			<Defs>
				<ClipPath id="Tezos_svg__clip0_61:23">
					<Path fill={props.color} d="M0 0h24v24H0z" />
				</ClipPath>
			</Defs>
		</Svg>
	);
}

export default SvgTezos;
