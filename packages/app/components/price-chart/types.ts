import { Path } from '@diversifiedfinance/react-native-redash';

export type Graphs = Array<{
	data: Graph;
	label: string;
	value: number;
}>;

export interface Graph {
	label: string;
	maxPrice: number;
	minPrice: number;
	lastPrice: number;
	startDate: number;
	endDate: number;
	path: Path;
	percentChange: number;
}
