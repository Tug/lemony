import { Switch } from './index';
import { Meta } from '@storybook/react';
import { useState } from 'react';

export default {
	component: Switch,
	title: 'Components/Switch',
} as Meta;

export const Basic: React.VFC<{}> = () => {
	const [selected, setSelected] = useState(false);
	return <Switch checked={selected} onChange={setSelected} />;
};
