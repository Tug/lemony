import { Button } from '@diversifiedfinance/design-system/button';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';

import Apple from '@diversifiedfinance/design-system/icon/Apple';
import GoogleOriginal from '@diversifiedfinance/design-system/icon/GoogleOriginal';
import Mail from '@diversifiedfinance/design-system/icon/Mail';
import type { PressableProps } from '@diversifiedfinance/design-system/pressable';
import { colors } from '@diversifiedfinance/design-system/tailwind';
import { View } from '@diversifiedfinance/design-system/view';
import React, { useMemo } from 'react';
import { useFeature } from '@growthbook/growthbook-react';
import { useTranslation } from 'react-i18next';

type LoginType = 'apple' | 'google' | 'email' | 'social';
type LoginButtonProps = PressableProps & {
	type: LoginType;
};

const BUTTON_ICON = {
	apple: Apple,
	google: GoogleOriginal,
	email: Mail,
	social: () => <></>,
};

export const LoginButton = ({ type, ...rest }: LoginButtonProps) => {
	const { t } = useTranslation();
	const isDark = useIsDarkMode();
	const socialConnectDisabled = useFeature('social-login').off;

	const BUTTON_TEXT = {
		apple: t('Continue with Apple'),
		google: t('Continue with Google'),
		email: t('Continue with Email'),
		social: !socialConnectDisabled
			? t('Back to social connect')
			: t('Back to SMS connect'),
	};

	const Icon = useMemo(
		() => (BUTTON_ICON[type] ? BUTTON_ICON[type] : null),
		[type]
	);

	const iconColorProps = useMemo(() => {
		switch (type) {
			case 'google':
				return {};
			default:
				return { color: isDark ? colors.white : colors.black };
		}
	}, [isDark, type]);

	const variant = useMemo(() => {
		switch (type) {
			case 'social':
				return 'text';
			default:
				return 'outlined';
		}
	}, [type]);

	const labelTW = useMemo(() => {
		switch (type) {
			case 'social':
				return 'underline';
			default:
				return '';
		}
	}, [type]);
	return (
		<Button
			variant={variant}
			size="regular"
			tw="my-1"
			labelTW={labelTW}
			{...rest}
		>
			{Icon && (
				<View tw="absolute left-4 top-3">
					<Icon width={24} height={24} {...iconColorProps} />
				</View>
			)}
			{BUTTON_TEXT[type]}
		</Button>
	);
};
