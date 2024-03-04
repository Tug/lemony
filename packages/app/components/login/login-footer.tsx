import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { Trans, useTranslation } from 'react-i18next';
import { TextLink } from '@diversifiedfinance/app/navigation/link';

export function LoginFooter({
	isSignup,
	tw = '',
}: {
	isSignup?: boolean;
	tw?: string;
}) {
	const { t } = useTranslation();

	if (!isSignup) {
		return null;
	}

	return (
		<View tw={['w-full flex-row justify-center', tw]}>
			<Text tw="text-center text-xs text-gray-600 dark:text-gray-400">
				<Trans t={t}>
					By signing up you agree to our{' '}
					<TextLink
						tw="font-bold underline"
						href={t('https://www.diversified.fi/en-us/legals-hub')}
					>
						Terms & Conditions
					</TextLink>
					.
				</Trans>
			</Text>
		</View>
	);
}
