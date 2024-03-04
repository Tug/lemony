import { EmptyPlaceholder } from '../empty-placeholder';
import { TextLink } from '@diversifiedfinance/app/navigation/link';
import { View } from '@diversifiedfinance/design-system';
import { Button, ButtonProps } from '@diversifiedfinance/design-system/button';
import { Text } from '@diversifiedfinance/design-system/text';
import { useTranslation } from 'react-i18next';

const ContactBtn = (props: ButtonProps) => {
	const { t } = useTranslation();
	return (
		<Button variant="tertiary" {...props}>
			{t('Contact support')}
		</Button>
	);
};
const Profile404 = () => {
	const { t } = useTranslation();

	return (
		<View tw="items-center justify-center px-4 pt-8">
			<EmptyPlaceholder
				title="This user does not exist."
				text={
					<Text tw="text-center">
						{t('Try searching for another one or check the link.')}
						&nbsp;
						<TextLink href={`/`} tw="text-indigo-500">
							{t('Go Home')}
						</TextLink>
					</Text>
				}
				hideLoginBtn
			/>
		</View>
	);
};
