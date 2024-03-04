import { Button } from '@diversifiedfinance/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const PaymentRequest =
	typeof window !== 'undefined' && window.PaymentRequest;
export const canMakePayment = () => Boolean(PaymentRequest);
export const ApplePayButton = ({ onPress }: { onPress: () => void }) => {
	const { t } = useTranslation();
	return <Button onPress={onPress}>{t('Pay with Pay')}</Button>;
};
