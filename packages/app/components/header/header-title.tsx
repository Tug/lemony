import { useRouter } from '@diversifiedfinance/design-system/router';
import { Text } from '@diversifiedfinance/design-system/text';
import { View } from '@diversifiedfinance/design-system/view';

const titleMap = new Map([
	['/notifications', 'Notifications'],
	['/trending', 'Trending'],
	['/settings', 'Settings'],
]);

export const HeaderTitle = () => {
	const router = useRouter();
	const pathname = router?.pathname;
	const title = titleMap.get(pathname);
	if (!title) {
		return null;
	}
	return (
		<View tw="flex-row items-center justify-center">
			<Text tw="text-base font-bold text-black dark:text-white">
				{title}
			</Text>
		</View>
	);
};
