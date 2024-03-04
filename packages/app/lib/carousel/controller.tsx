import { Button } from '@diversifiedfinance/design-system/button';
import {
	ChevronRight,
	ChevronLeft,
} from '@diversifiedfinance/design-system/icon';
import { View } from '@diversifiedfinance/design-system/view';

type ControllerProps = {
	prev: () => void;
	next: () => void;
	tw?: string;
	allowSlideNext?: boolean;
	allowSlidePrev?: boolean;
};
export const Controller = ({
	prev,
	next,
	tw = '',
	allowSlideNext = false,
	allowSlidePrev = false,
}: ControllerProps) => {
	return (
		<View
			tw={[
				'absolute top-1/2 z-10 hidden w-full -translate-y-2 flex-row  justify-between md:flex',
				tw,
			]}
		>
			<Button
				variant="secondary"
				size="small"
				iconOnly
				tw={[
					'px-0 absolute -left-0 border border-gray-800 transition-all dark:border-gray-200',
				]}
				style={{
					opacity: allowSlidePrev ? 1 : 0,
					paddingLeft: 4,
					paddingRight: 4,
				}}
				onPress={() => {
					prev?.();
				}}
			>
				<ChevronLeft width={24} height={24} />
			</Button>
			<Button
				variant="secondary"
				size="small"
				iconOnly
				tw={[
					'absolute -right-0 border border-gray-800 transition-all dark:border-gray-200',
				]}
				style={{
					opacity: allowSlideNext ? 1 : 0,
					paddingLeft: 4,
					paddingRight: 4,
				}}
				onPress={() => {
					next?.();
				}}
			>
				<ChevronRight width={24} height={24} />
			</Button>
		</View>
	);
};
