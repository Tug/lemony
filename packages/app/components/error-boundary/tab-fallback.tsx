import { Fallback } from './fallback';
import { FallbackProps } from '@diversifiedfinance/app/components/error-boundary';
import { TabScrollView } from '@diversifiedfinance/design-system/tab-view';

type TabFallbackViewProps = FallbackProps & {
	index: number;
};
export function TabFallback({ index, ...rest }: TabFallbackViewProps) {
	return (
		<TabScrollView index={index}>
			<Fallback {...rest} />
		</TabScrollView>
	);
}
