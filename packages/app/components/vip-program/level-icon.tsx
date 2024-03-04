import Svg, { Circle, Mask, Path, Rect } from 'react-native-svg';
import { Text, View } from '@diversifiedfinance/design-system';
import React from 'react';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';

export function LevelIcon({
	levelName = 'Regular',
	color = '#94A3B8',
}: {
	color: string;
}) {
	const isDark = useIsDarkMode();
	return (
		<View tw="items-center">
			<View>
				<Svg
					width="84"
					height="98"
					viewBox="0 0 84 98"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<Circle
						cx="41.7416"
						cy="38.4988"
						r="28.8221"
						fill="#FFD8A0"
						stroke={
							isDark ? colors.blueGray[800] : colors.blueGray[100]
						}
						strokeWidth="4"
					/>
					<Path
						d="M32.7897 45.0523L33.3217 46.6472C33.4395 47.0015 33.8237 47.2381 34.208 47.1492C36.4238 46.676 38.9049 46.3806 41.5351 46.3806C44.164 46.3806 46.6464 46.646 48.8622 47.1492C49.2465 47.238 49.6308 47.0315 49.7485 46.6472L50.2805 45.0523C47.6216 44.4314 44.6672 44.0771 41.535 44.0771C38.4029 44.0783 35.4486 44.4326 32.7897 45.0523Z"
						fill={isDark ? 'black' : 'white'}
					/>
					<Path
						d="M52.8793 33.0866C52.0231 33.2644 51.3133 33.9429 51.1368 34.8004C50.989 35.539 51.1956 36.1887 51.6099 36.6907L46.6177 39.2908C46.1445 39.5273 45.5837 39.3496 45.3182 38.9065L42.1562 33.1756C43.2203 32.8502 43.9288 31.8162 43.7223 30.6056C43.5745 29.7493 42.866 29.0396 42.0085 28.863C40.5614 28.5676 39.2908 29.6604 39.2908 31.0487C39.2908 32.0527 39.9705 32.9102 40.8856 33.1756L37.7248 38.8778C37.4593 39.351 36.8973 39.4987 36.4253 39.2621L31.4331 36.662C31.8462 36.16 32.054 35.5103 31.9063 34.7717C31.7286 33.9155 31.05 33.2057 30.1637 33.058C28.7454 32.7926 27.5348 33.8266 27.4748 35.156C27.4448 35.7169 27.7113 36.2789 28.1245 36.6632C28.9808 37.5195 29.6605 37.5195 30.2514 37.3718L32.3783 43.7824C35.126 43.1327 38.2281 42.7484 41.5066 42.7484C44.7865 42.7484 47.8885 43.1027 50.6349 43.7824L52.7618 37.3718C53.3826 37.5195 54.0324 37.5195 54.9187 36.6332C55.3318 36.2201 55.5684 35.6881 55.5395 35.0972C55.5095 33.8254 54.2688 32.8212 52.8793 33.0866Z"
						fill={isDark ? 'black' : 'white'}
					/>
					<Mask id="path-4-inside-1_2128_13005" fill="white">
						<Path d="M51.9939 11.7293C52.4392 10.5059 53.7967 9.86677 54.9825 10.4043C58.1645 11.8465 61.0835 13.8217 63.6111 16.2498C66.7065 19.2233 69.1466 22.8105 70.7753 26.7817C72.404 30.7529 73.1853 35.0204 73.0692 39.311C72.9531 43.6017 71.9422 47.8207 70.1011 51.698C68.2601 55.5753 65.6295 59.0253 62.3779 61.827C59.1263 64.6288 55.3253 66.7206 51.2185 67.9683C47.1117 69.216 42.7896 69.5923 38.5289 69.0729C35.0497 68.6488 31.6741 67.6351 28.5454 66.0808C27.3794 65.5015 27.0167 64.0457 27.6834 62.9273C28.35 61.809 29.7933 61.4534 30.9672 62.0165C33.5257 63.2438 36.2722 64.048 39.0994 64.3927C42.7083 64.8326 46.3693 64.5139 49.8479 63.457C53.3265 62.4002 56.546 60.6284 59.3002 58.2552C62.0544 55.882 64.2826 52.9598 65.842 49.6756C67.4014 46.3914 68.2578 42.8178 68.3561 39.1835C68.4544 35.5492 67.7926 31.9345 66.4131 28.5708C65.0335 25.2071 62.9666 22.1686 60.3448 19.65C58.2908 17.6768 55.9317 16.0568 53.3635 14.8498C52.1852 14.2959 51.5486 12.9528 51.9939 11.7293Z" />
					</Mask>
					<Path
						d="M51.9939 11.7293C52.4392 10.5059 53.7967 9.86677 54.9825 10.4043C58.1645 11.8465 61.0835 13.8217 63.6111 16.2498C66.7065 19.2233 69.1466 22.8105 70.7753 26.7817C72.404 30.7529 73.1853 35.0204 73.0692 39.311C72.9531 43.6017 71.9422 47.8207 70.1011 51.698C68.2601 55.5753 65.6295 59.0253 62.3779 61.827C59.1263 64.6288 55.3253 66.7206 51.2185 67.9683C47.1117 69.216 42.7896 69.5923 38.5289 69.0729C35.0497 68.6488 31.6741 67.6351 28.5454 66.0808C27.3794 65.5015 27.0167 64.0457 27.6834 62.9273C28.35 61.809 29.7933 61.4534 30.9672 62.0165C33.5257 63.2438 36.2722 64.048 39.0994 64.3927C42.7083 64.8326 46.3693 64.5139 49.8479 63.457C53.3265 62.4002 56.546 60.6284 59.3002 58.2552C62.0544 55.882 64.2826 52.9598 65.842 49.6756C67.4014 46.3914 68.2578 42.8178 68.3561 39.1835C68.4544 35.5492 67.7926 31.9345 66.4131 28.5708C65.0335 25.2071 62.9666 22.1686 60.3448 19.65C58.2908 17.6768 55.9317 16.0568 53.3635 14.8498C52.1852 14.2959 51.5486 12.9528 51.9939 11.7293Z"
						stroke={color}
						strokeWidth={26}
						strokeLinejoin="round"
						mask="url(#path-4-inside-1_2128_13005)"
					/>
					<Path
						d="M12.5014 92.4943L12.8675 93.5917C12.9485 93.8355 13.2129 93.9983 13.4774 93.9372C15.0021 93.6116 16.7093 93.4083 18.5192 93.4083C20.3282 93.4083 22.0364 93.5909 23.5611 93.9372C23.8255 93.9983 24.09 93.8562 24.171 93.5917L24.5371 92.4943C22.7074 92.067 20.6745 91.8232 18.5192 91.8232C16.3639 91.824 14.3311 92.0678 12.5014 92.4943Z"
						fill={color}
					/>
					<Path
						d="M26.3254 84.2601C25.7361 84.3824 25.2477 84.8493 25.1263 85.4393C25.0246 85.9476 25.1668 86.3946 25.4518 86.7401L22.0166 88.5292C21.691 88.692 21.3051 88.5697 21.1225 88.2648L18.9466 84.3213C19.6788 84.0974 20.1664 83.3858 20.0242 82.5528C19.9226 81.9636 19.435 81.4752 18.845 81.3537C17.8492 81.1504 16.9749 81.9025 16.9749 82.8578C16.9749 83.5486 17.4426 84.1387 18.0723 84.3213L15.8973 88.245C15.7146 88.5706 15.3279 88.6723 15.0031 88.5095L11.5679 86.7203C11.8522 86.3749 11.9951 85.9278 11.8935 85.4196C11.7712 84.8304 11.3043 84.342 10.6944 84.2404C9.71843 84.0577 8.88542 84.7692 8.84411 85.684C8.82346 86.07 9.0069 86.4567 9.29119 86.7212C9.88041 87.3104 10.3481 87.3104 10.7547 87.2087L12.2183 91.62C14.109 91.1729 16.2437 90.9085 18.4996 90.9085C20.7565 90.9085 22.8911 91.1522 24.7809 91.62L26.2444 87.2087C26.6717 87.3104 27.1188 87.3104 27.7286 86.7005C28.0129 86.4162 28.1757 86.0501 28.1559 85.6436C28.1352 84.7684 27.2815 84.0774 26.3254 84.2601Z"
						fill={color}
					/>
					<Rect
						x="36.1575"
						y="83.1357"
						width="39"
						height="9"
						rx="4.5"
						fill="#CBD5E1"
					/>
					<Rect
						x="1.34253"
						y="77.8203"
						width="81.315"
						height="19.6304"
						rx="9.81522"
						stroke="#E2E8F0"
					/>
				</Svg>
			</View>
			<View
				tw="absolute items-center rounded-full py-1.5 px-2"
				style={{ backgroundColor: color }}
			>
				<Text tw="text-xs text-white font-bold">{levelName}</Text>
			</View>
		</View>
	);
}
