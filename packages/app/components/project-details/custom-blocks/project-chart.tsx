import { useProject } from '@diversifiedfinance/app/hooks/use-project';
import { usePrice } from '@diversifiedfinance/app/hooks/api-hooks';
import ModalPriceChart from '@diversifiedfinance/app/components/modal-price-chart';

export default function ProjectChart() {
	const { data: project } = useProject();
	const {
		isLoading,
		data: prices,
		currency,
	} = usePrice(project?.tokenSymbol);

	return (
		<ModalPriceChart
			// force rerender on project change
			key={`chart-${project?.slug}`}
			isLoading={isLoading}
			prices={prices}
			currency={currency}
		/>
	);
}
