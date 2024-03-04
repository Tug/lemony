import { Text, View } from '@diversifiedfinance/design-system';
import SimpleMetricCard, { SimpleMetricCardProps } from './index';
import React, { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

const MS_IN_A_DAY = 24 * 60 * 60 * 1000;
const MS_IN_AN_HOUR = 60 * 60 * 1000;
const MS_IN_A_MINUTE = 60 * 1000;

export interface ProjectTrackingCardProps
	extends Partial<SimpleMetricCardProps> {
	isPresale?: boolean;
	startDate: Date | string;
	endDate: Date | string;
}

export default function ProjectTrackingCard({
	isPresale = true,
	startDate,
	endDate,
	...smCardProps
}: ProjectTrackingCardProps) {
	const { t, i18n } = useTranslation();
	const rtf = useMemo(
		() =>
			new Intl.RelativeTimeFormat(i18n.language, {
				// style: 'short',
				numeric: 'auto',
			}),
		[i18n.language]
	);
	const hasStarted = Date.now() > new Date(startDate).getTime();
	const [timeLeftMs, setTimeLeftMs] = useState(
		new Date(hasStarted ? endDate : startDate).getTime() - Date.now()
	);
	useEffect(() => {
		const intervalId = setInterval(() => {
			const isStarted = Date.now() > new Date(startDate).getTime();
			setTimeLeftMs(
				new Date(isStarted ? endDate : startDate).getTime() - Date.now()
			);
		}, 1000);

		return () => clearInterval(intervalId);
	}, []);

	const hasEnded = timeLeftMs < 0;
	let label;
	if (!hasStarted) {
		label = isPresale ? t('Presale starts') : t('Sale starts');
	} else if (!hasEnded) {
		label = isPresale ? t('Presale ends') : t('Sale ends');
	} else {
		label = isPresale ? t('Presale ended') : t('Sale ended');
	}
	const sign = hasEnded ? -1 : 1;
	const absTimeDiff = Math.abs(timeLeftMs);
	const timeDiffDays = Math.floor(absTimeDiff / MS_IN_A_DAY);
	const timeDiffHours = Math.floor(
		(absTimeDiff - timeDiffDays * MS_IN_A_DAY) / MS_IN_AN_HOUR
	);
	const timeDiffMinutes = Math.min(
		59,
		Math.ceil(
			(absTimeDiff -
				timeDiffDays * MS_IN_A_DAY -
				timeDiffHours * MS_IN_AN_HOUR) /
				MS_IN_A_MINUTE
		)
	);
	let timeDiffString = '';
	if (timeDiffDays > 0) {
		timeDiffString = rtf.format(sign * timeDiffDays, 'days');
	} else if (timeDiffHours > 0) {
		timeDiffString = rtf.format(sign * timeDiffHours, 'hours');
	} else if (timeDiffMinutes > 0) {
		timeDiffString = rtf.format(sign * timeDiffMinutes, 'minutes');
	}

	return (
		<SimpleMetricCard
			{...smCardProps}
			label={label}
			helpMessage={t(
				'Time remaining until the end of the pre-sale, when the asset will be financed or refunded.'
			)}
		>
			<View tw="my-1 flex-col gap-y-1">
				<Text tw="text-diversifiedBlue dark:text-themeYellow text-sm font-semibold">
					{timeDiffString}
				</Text>
			</View>
		</SimpleMetricCard>
	);
}
