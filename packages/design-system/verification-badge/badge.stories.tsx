import { VerificationBadge } from './index';
import { Meta } from '@storybook/react';

export default {
	component: VerificationBadge,
	title: 'Components/VerificationBadge',
} as Meta;

export const Basic: React.VFC<{}> = () => {
	return <VerificationBadge />;
};
