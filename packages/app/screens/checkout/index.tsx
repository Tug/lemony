import {
	useModalScreenContext,
	withModalScreen,
} from '@diversifiedfinance/design-system/modal-screen';
import React, { useEffect } from 'react';
import { Checkout } from '@diversifiedfinance/app/components/checkout';
import { useTrackPageViewed } from '@diversifiedfinance/app/lib/analytics';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { createParam } from '@diversifiedfinance/app/navigation/lib/use-param';
import { useProject } from '@diversifiedfinance/app/hooks/use-project';

const { useParam } = createParam<{ slug: string }>();

export const CheckoutPage = () => {
	const [slug] = useParam('slug');
	const { data: project } = useProject(slug);
	useTrackPageViewed({ name: 'checkout', params: { slug } });
	const { t } = useTranslation();
	const modalScreenContext = useModalScreenContext();
	useEffect(() => {
		modalScreenContext?.setTitle(
			project?.isPresale ? t('Buy on presale') : t('Invest')
		);
	}, [modalScreenContext, t, project?.isPresale]);
	return <Checkout projectSlug={slug} />;
};

export const CheckoutScreen = withModalScreen(CheckoutPage, {
	title: 'Invest',
	matchingPathname: '/checkout/[slug]',
	matchingQueryParam: 'checkoutModal',
	snapPoints: ['100%'],
	// Need to disable content panning gesture for now on android as it swallows events for the Slider
	enableContentPanningGesture: Platform.OS !== 'android',
});
