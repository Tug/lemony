import { useEffect, useState } from 'react';
import { axios } from '@diversifiedfinance/app/lib/axios';
import { View, Text } from '@diversifiedfinance/design-system';
import { Table } from '../../components/table';

export default function AdminOracle({}) {
	const [lastPrices, setLastPrices] = useState<any>();
	const fetchLastPrices = async () => {
		try {
			const lastPricesRes = await axios({
				url: '/api/admin/prices/last',
				method: 'get',
			});
			const priceFormatter = new Intl.NumberFormat('fr-FR', {
				style: 'currency',
				currency: 'EUR',
			});
			setLastPrices(
				Object.values(
					lastPricesRes.reduce((groupedByProject, priceRow) => {
						if (!groupedByProject[priceRow.projectId]) {
							groupedByProject[priceRow.projectId] = {
								project: priceRow.tokenName,
							};
						}
						const dateString = new Date(
							priceRow.date
						).toLocaleDateString();
						groupedByProject[priceRow.projectId] = {
							...groupedByProject[priceRow.projectId],
							[`${dateString}`]:
								priceFormatter.format(priceRow.mean) +
								'\n' +
								(
									Number(priceRow.price_diff) / 100
								).toLocaleString(undefined, {
									style: 'percent',
									minimumFractionDigits: 2,
								}),
						};
						return groupedByProject;
					}, {})
				)
			);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		fetchLastPrices();
	}, []);

	return (
		<View tw="mt-24 w-[80%] flex-col">
			<View tw="mb-4">
				<Text tw="text-2xl font-bold">Last project prices</Text>
			</View>
			<View tw="rounded border border-gray-500 p-4">
				{lastPrices?.map((projectData) => (
					<View key={projectData.project} tw="mb-6">
						<Table
							data={[projectData]}
							tdStyles={[{ width: '40%' }]}
						/>
					</View>
				))}
			</View>
		</View>
	);
}
