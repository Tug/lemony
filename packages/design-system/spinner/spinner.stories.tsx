import { Spinner } from './index';
import { Meta } from '@storybook/react';

export default {
	component: Spinner,
	title: 'Components/Spinner',
} as Meta;

export const Basic: React.VFC<{}> = () => <Spinner />;
