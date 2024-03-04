import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

export function Newsletter({ color = '#242C89' }: { color?: string }) {
	return (
		<Svg
			width="37"
			height="34"
			viewBox="0 0 37 34"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<G clip-path="url(#clip0_2231_3181)">
				<Path
					d="M8 15.4996L12 12.5996V17.6816L8 15.4996Z"
					fill="#242C89"
				/>
				<Path
					d="M30 15.4996L26 12.5996V17.6816L30 15.4996Z"
					fill="#242C89"
				/>
				<Path
					d="M12 12.5996L8 15.4996V27.4996H30V15.4996L26 12.5996"
					stroke={color}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M12 17.7V5.5H26V17.7"
					stroke={color}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M8 15.5L30 27.5"
					stroke={color}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M30 15.5L19 21.5"
					stroke={color}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M16 10.5H22"
					stroke={color}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M16 14.5H22"
					stroke={color}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</G>
			<Path
				opacity="0.07"
				d="M1.63931 4.83134C0.240706 6.756 -0.479669 9.13891 0.355659 11.3385C1.23697 13.6718 3.40576 15.2451 5.23352 16.8146C6.4367 17.8495 7.67819 18.9111 8.5595 20.2439C9.63623 21.8631 9.42932 23.7457 9.99259 25.5176C10.8164 28.1029 13.1998 29.4089 15.5065 30.5011C18.5988 31.9637 21.8864 33.3919 25.3619 33.495C26.4309 33.5256 27.5306 33.4225 28.5039 32.9833C30.6765 32.0019 31.4812 29.2753 31.6766 27.0986C31.9372 24.2001 32.0598 21.3055 32.7879 18.4758C33.8569 14.3133 36.7078 10.5404 36.9837 6.19846C37.0641 4.90771 36.861 3.54059 36.0717 2.51334C35.2862 1.48991 34.0064 0.932374 32.7265 0.75671C29.4274 0.302276 26.2432 1.80687 22.9517 1.7305C19.8058 1.65794 16.7212 0.959105 13.6021 0.642147C10.8892 0.367195 8.04988 0.405383 5.57071 1.53956C4.1223 2.20402 2.69305 3.38784 1.64314 4.83134H1.63931Z"
				fill="#293380"
			/>
			<Defs>
				<ClipPath id="clip0_2231_3181">
					<Rect
						width="24"
						height="24"
						fill="white"
						transform="translate(7 4.5)"
					/>
				</ClipPath>
			</Defs>
		</Svg>
	);
}
