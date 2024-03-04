import { DataPoints, Price, PriceList } from '@diversifiedfinance/types';
import prisma, { Prisma } from '../../prismadb';
import { SnapshotData, SnapshotPrice } from '../types';

function sanitizeDate(date: string) {
	if (date.length === 4) {
		return new Date(`${date}-01-01`);
	}
	if (!Number.isNaN(Number(date))) {
		if (Number(date) < Date.now() / 1000) {
			return new Date(Number(date) * 1000);
		}
		return new Date(Number(date));
	}
	if (date.match(/^\d{2}[-|/]\d{2}[-|/]\d{4}$/)) {
		const dateParts = date.split(/-|\//);
		if (dateParts.length === 3) {
			return new Date(
				Number(dateParts[2]),
				Number(dateParts[1]),
				Number(dateParts[0])
			);
		}
	}
	return new Date(date);
}

export function getPercentChange(data?: SnapshotData) {
	if (!data || data.length === 0) {
		return undefined;
	}
	const firstPrice = data[0]?.[1]?.mean;
	const lastPrice = data[data.length - 1]?.[1]?.mean;
	if (firstPrice && lastPrice) {
		return (lastPrice / firstPrice - 1) * 100;
	}
	return undefined;
}

export function getSnapshotPrices(snapshotData?: SnapshotData): PriceList {
	if (!snapshotData || !Array.isArray(snapshotData)) {
		return [];
	}
	return snapshotData.map(([date, { mean, min, max }]: SnapshotPrice) => {
		const extra = min !== undefined || max !== undefined ? [min, max] : [];
		return [sanitizeDate(date).getTime(), mean, ...extra];
	}) as PriceList;
}

export function mergeSnapshotData(
	oldData: SnapshotData,
	newData: SnapshotData
): SnapshotData {
	// TODO: normalize dates
	const mergedDataMap = new Map([...oldData, ...newData]);
	return [...mergedDataMap];
}

export async function saveSnapshot(
	snapshot: Prisma.OraclePriceSnapshotUncheckedCreateInput
) {
	const oldSnapshot = await prisma.oraclePriceSnapshot.findUnique({
		where: {
			oracleProductId_period: {
				oracleProductId: snapshot.oracleProductId,
				period: snapshot.period,
			},
		},
	});
	if (oldSnapshot) {
		snapshot.data = mergeSnapshotData(oldSnapshot.data, snapshot.data);
	}
	const percentChange = getPercentChange(snapshot.data);
	if (percentChange) {
		snapshot.metadata = {
			...snapshot.metadata,
			percentChange,
		};
	}
	await prisma.oraclePriceSnapshot.upsert({
		where: {
			oracleProductId_period: {
				oracleProductId: snapshot.oracleProductId,
				period: snapshot.period,
			},
		},
		create: snapshot,
		update: snapshot,
	});
	await updateOracleProductPrices(snapshot);
}

export async function updateOracleProductPrices(
	snapshot: Prisma.OraclePriceSnapshotUncheckedCreateInput
) {
	const priceList = getSnapshotPrices(snapshot.data);
	if (!priceList) {
		return;
	}
	const source = snapshot.metadata?.source;
	const priceListAdjusted = adjustPriceList(priceList, source);
	try {
		const dbPrices = priceList.map(([date, mean, min, max]: Price) => ({
			oracleProductId: snapshot.oracleProductId,
			date: new Date(date),
			period: snapshot.period,
			mean,
			min,
			max,
			currency: snapshot.metadata?.currency ?? 'EUR',
		}));
		await Promise.all(
			dbPrices.map(async (dbPrice) => {
				return prisma.oraclePrice.upsert({
					where: {
						oracleProductId_period_date: {
							oracleProductId: dbPrice.oracleProductId,
							period: snapshot.period,
							date: dbPrice.date,
						},
					},
					create: dbPrice,
					update: dbPrice,
				});
			})
		);
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error(err);
	}
}

async function adjustPriceList(priceList, source?: string) {
	if (!source) {
		return priceList;
	}

	if (source === 'chrono24') {
		return priceList;
	}
}

export async function refreshAllPrices() {
	const snapshots = await prisma.oraclePriceSnapshot.findMany({});
	for (const snapshot of snapshots) {
		await updateOracleProductPrices(snapshot);
	}
}
