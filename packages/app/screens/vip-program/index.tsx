import { VIPProgram } from '@diversifiedfinance/app/components/vip-program';
import React from 'react';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';

export const VIPProgramScreen = () => {
	useTrackPageViewed({ name: 'vipProgram' });
	return <VIPProgram />;
};
