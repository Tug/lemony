import { growthbook } from '@diversifiedfinance/app/lib/growthbook';
import axios from 'axios';

export async function fetchFeatures() {
	const {
		data: { features },
	} = await axios({
		url: process.env.GROWTHBOOK_FEATURES_ENDPOINT,
		method: 'GET',
	});
	return features;
}

let features: any = null;
let lastUpdate: Date | null = null;

export default async function loadFeatures(cacheTime = 1000 * 60) {
	if (
		features &&
		lastUpdate &&
		Date.now() - lastUpdate.getTime() < cacheTime
	) {
		return features;
	}

	features = await fetchFeatures();
	growthbook.setFeatures(features);
	lastUpdate = new Date();

	return features;
}

export async function isEnabled(featureName: string) {
	const feat = await loadFeatures();
	return feat[featureName]?.defaultValue ?? false;
}
