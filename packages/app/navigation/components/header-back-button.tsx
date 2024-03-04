import { useRouter } from '@diversifiedfinance/design-system/router';
import {
	HeaderBackButton as ReactNavigationHeaderBackButton,
	HeaderBackButtonProps,
} from '@react-navigation/elements';

export function HeaderBackButton(props: HeaderBackButtonProps) {
	const router = useRouter();

	if (!props.canGoBack) {
		return null;
	}

	return <ReactNavigationHeaderBackButton {...props} onPress={router.pop} />;
}
