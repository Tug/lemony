// import { Graphs } from '@diversifiedfinance/app/components/price-chart/types';
// import Animated, {
// 	interpolate,
// 	useAnimatedProps,
// 	useDerivedValue,
// } from 'react-native-reanimated';
// import { View, Text } from '@diversifiedfinance/design-system';
//
// interface TimeAxisProps {
// 	graphs: Graphs;
// 	index: Animated.SharedValue<number>;
// 	width: number;
// }
//
// export function TimeAxis({ width, index, graphs }: TimeAxisProps) {
// 	const labels = useDerivedValue(() => {
// 		'worklet';
// 		const currentGraph = graphs[index.value];
// 		if (currentGraph) {
// 			let invervals = 10;
// 			let format = (t: number) => t;
// 			switch (currentGraph.label) {
// 				case '1H':
// 					invervals = 10;
// 					format = (t) => new Date(t).getMinutes();
// 					break;
// 				case '1D':
// 					invervals = 12;
// 					format = (t) => new Date(t).getHours();
// 					break;
// 				case '1M':
// 					invervals = 8;
// 					format = (t) => new Date(t).getDate();
// 					break;
// 				case '1Y':
// 					invervals = 12;
// 					format = (t) => new Date(t).getMonth();
// 					break;
// 				case 'All':
// 				default:
// 					invervals = 10;
// 					format = (t) => new Date(t).getFullYear();
// 					return [];
// 			}
// 			return [...Array(invervals)].map((_, x) =>
// 				format(
// 					interpolate(
// 						x,
// 						[0, invervals],
// 						[currentGraph.data.startDate, currentGraph.data.endDate]
// 					)
// 				)
// 			);
// 		}
// 	}, [index]);
//
// 	const animatedProps = useAnimatedProps(() => {
// 		return {
// 			labels: labels.value ?? [],
// 		};
// 	}, [labels]);
//
// 	return (
// 		<View style={{ width }} tw="flex-row justify-between">
// 			{animatedProps.labels?.map((label, i) => (
// 				<Text key={i.toString()}>{label}</Text>
// 			))}
// 		</View>
// 	);
// }
