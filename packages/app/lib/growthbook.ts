import { GrowthBook } from '@growthbook/growthbook-react';

export const growthbook = new GrowthBook({
	trackingCallback: (experiment, result) => {},
});
