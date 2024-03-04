import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

export function CasinoChip({ color = '#293380' }: { color?: string }) {
	return (
		<Svg
			width="40"
			height="40"
			viewBox="0 0 40 40"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<Path
				opacity="0.07"
				d="M23.1616 1.98458C25.0745 3.18191 26.7663 4.88211 28.9772 5.35147C30.5201 5.67714 32.1686 5.35626 33.6682 5.84477C34.6919 6.17523 35.557 6.85531 36.3357 7.59766C37.9362 9.12066 39.2579 11.0077 39.777 13.1533C40.296 15.2989 39.926 17.7175 38.4889 19.3985C37.5613 20.4857 36.2636 21.2041 35.2783 22.2386C33.8412 23.7472 33.1395 25.9216 33.4327 27.981C33.8027 30.5816 35.6436 33.0768 34.9466 35.6104C34.1872 38.3642 30.8949 39.4897 28.0448 39.7962C22.3782 40.4093 16.6587 39.5376 11.0498 38.5271C9.20896 38.1966 7.33451 37.8422 5.68115 36.9753C3.11459 35.6343 1.26417 33.1152 0.48074 30.3373C-0.307491 27.5595 -0.0815955 24.5518 0.8316 21.8124C1.39874 20.1169 2.21581 18.5077 2.69644 16.7884C3.14342 15.1839 3.28761 13.5173 3.59041 11.8841C4.47477 7.15225 6.17139 2.71734 10.9296 0.921346C14.8852 -0.572921 19.5617 -0.271194 23.1712 1.98458H23.1616Z"
				fill={color}
			/>
			<G clipPath="url(#clip0_2231_4933)">
				<Path
					d="M20 31C26.0751 31 31 26.0751 31 20C31 13.9249 26.0751 9 20 9C13.9249 9 9 13.9249 9 20C9 26.0751 13.9249 31 20 31Z"
					stroke="black"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M20 26C23.3137 26 26 23.3137 26 20C26 16.6863 23.3137 14 20 14C16.6863 14 14 16.6863 14 20C14 23.3137 16.6863 26 20 26Z"
					stroke="black"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M15.79 9.83691L17.704 14.4569"
					stroke="black"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M9.83698 15.79L14.457 17.704"
					stroke="black"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M9.83698 24.2099L14.457 22.2959"
					stroke="black"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M15.79 30.163L17.704 25.543"
					stroke="black"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M24.21 30.163L22.296 25.543"
					stroke="black"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M30.163 24.2099L25.543 22.2959"
					stroke="black"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M30.163 15.79L25.543 17.704"
					stroke="black"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M24.21 9.83691L22.296 14.4569"
					stroke="black"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<Path
					d="M19.648 22.8378L17.474 20.2998C17.4029 20.216 17.364 20.1097 17.364 19.9998C17.364 19.8899 17.4029 19.7836 17.474 19.6998L19.648 17.1638C19.6914 17.1136 19.7452 17.0734 19.8056 17.0458C19.866 17.0182 19.9316 17.0039 19.998 17.0039C20.0644 17.0039 20.13 17.0182 20.1904 17.0458C20.2508 17.0734 20.3045 17.1136 20.348 17.1638L22.526 19.6998C22.597 19.7836 22.636 19.8899 22.636 19.9998C22.636 20.1097 22.597 20.216 22.526 20.2998L20.352 22.8358C20.3087 22.8868 20.2548 22.9278 20.1941 22.956C20.1334 22.9842 20.0674 22.9988 20.0004 22.999C19.9335 22.9992 19.8674 22.9849 19.8065 22.9571C19.7457 22.9292 19.6916 22.8886 19.648 22.8378Z"
					fill="black"
				/>
				<G clipPath="url(#clip1_2231_4933)">
					<Path
						d="M20 31C26.0751 31 31 26.0751 31 20C31 13.9249 26.0751 9 20 9C13.9249 9 9 13.9249 9 20C9 26.0751 13.9249 31 20 31Z"
						stroke={color}
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<Path
						d="M20 26C23.3137 26 26 23.3137 26 20C26 16.6863 23.3137 14 20 14C16.6863 14 14 16.6863 14 20C14 23.3137 16.6863 26 20 26Z"
						stroke={color}
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<Path
						d="M15.79 9.83691L17.704 14.4569"
						stroke={color}
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<Path
						d="M9.83698 15.79L14.457 17.704"
						stroke={color}
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<Path
						d="M9.83698 24.2099L14.457 22.2959"
						stroke={color}
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<Path
						d="M15.79 30.163L17.704 25.543"
						stroke={color}
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<Path
						d="M24.21 30.163L22.296 25.543"
						stroke={color}
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<Path
						d="M30.163 24.2099L25.543 22.2959"
						stroke={color}
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<Path
						d="M30.163 15.79L25.543 17.704"
						stroke={color}
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<Path
						d="M24.21 9.83691L22.296 14.4569"
						stroke={color}
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<Path
						d="M19.648 22.8378L17.474 20.2998C17.4029 20.216 17.364 20.1097 17.364 19.9998C17.364 19.8899 17.4029 19.7836 17.474 19.6998L19.648 17.1638C19.6914 17.1136 19.7452 17.0734 19.8056 17.0458C19.866 17.0182 19.9316 17.0039 19.998 17.0039C20.0644 17.0039 20.13 17.0182 20.1904 17.0458C20.2508 17.0734 20.3045 17.1136 20.348 17.1638L22.526 19.6998C22.597 19.7836 22.636 19.8899 22.636 19.9998C22.636 20.1097 22.597 20.216 22.526 20.2998L20.352 22.8358C20.3087 22.8868 20.2548 22.9278 20.1941 22.956C20.1334 22.9842 20.0674 22.9988 20.0004 22.999C19.9335 22.9992 19.8674 22.9849 19.8065 22.9571C19.7457 22.9292 19.6916 22.8886 19.648 22.8378Z"
						fill={color}
					/>
				</G>
			</G>
			<Defs>
				<ClipPath id="clip0_2231_4933">
					<Rect
						width="24"
						height="24"
						fill="white"
						transform="translate(8 8)"
					/>
				</ClipPath>
				<ClipPath id="clip1_2231_4933">
					<Rect
						width="24"
						height="24"
						fill="white"
						transform="translate(8 8)"
					/>
				</ClipPath>
			</Defs>
		</Svg>
	);
}
