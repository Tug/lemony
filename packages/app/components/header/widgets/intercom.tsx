import { PressableScale, View } from '@diversifiedfinance/design-system';
import Help from '@diversifiedfinance/design-system/icon/Help';
import { useUser } from '@diversifiedfinance/app/hooks/use-user';
import { Space, useIntercom } from '@diversifiedfinance/app/lib/intercom';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { useFeature } from '@growthbook/growthbook-react';

export interface IntercomHeaderWidgetProps {
	withBackground?: boolean;
}

export function IntercomHeaderWidget({
	withBackground,
}: IntercomHeaderWidgetProps) {
	const { isLoading } = useUser();
	const intercom = useIntercom();
	const isDark = useIsDarkMode();
	const intercomOpenHome = useFeature('intercom-space-home').on;
	const iconColor =
		// eslint-disable-next-line no-nested-ternary
		withBackground ? '#FFF' : isDark ? '#FFF' : '#000';

	const openHelp = () => {
		intercom.show(intercomOpenHome ? Space.home : Space.helpCenter);
	};

	if (isLoading) {
		return null;
	}

	return (
		<View tw="flex-row items-center md:mx-2">
			<PressableScale onPress={openHelp}>
				<View tw="h-8 w-8 items-center justify-center rounded-full">
					<Help color={iconColor} width={24} height={24} />
				</View>
			</PressableScale>
		</View>
	);
}
