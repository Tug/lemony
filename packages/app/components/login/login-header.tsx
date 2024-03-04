import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';
import { useTranslation } from 'react-i18next';

export function LoginHeader({ isSignup }: { isSignup: boolean }) {
	const { t } = useTranslation();
	return (
		<View tw="px-4 pb-4">
			<Text tw="text-center text-sm font-semibold text-gray-900 dark:text-gray-400">
				{isSignup
					? t(
							'Sign up to access the most exciting investment opportunities.'
					  )
					: t(
							'Sign in to access the most exciting investment opportunities.'
					  )}
			</Text>
		</View>
	);
}
