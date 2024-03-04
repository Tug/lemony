import Twitter from '@diversifiedfinance/design-system/icon/Twitter';
import Mail from '@diversifiedfinance/design-system/icon/Mail';
import Instagram from '@diversifiedfinance/design-system/icon/Instagram';

const links = [
	{
		link: 'https://diversified.fi/terms',
		title: 'Terms & Conditions',
	},
];

const social = [
	{
		icon: Twitter,
		link: 'https://twitter.com/diversified_app',
		title: 'Twitter',
	},
	{
		icon: Instagram,
		link: 'https://www.instagram.com/diversified.finance/',
		title: 'Instagram',
	},
	{
		icon: Mail,
		link: 'mailto:hello@diversified.fi',
		title: 'Contact',
	},
];

export const useFooter = () => {
	return { links, social };
};
