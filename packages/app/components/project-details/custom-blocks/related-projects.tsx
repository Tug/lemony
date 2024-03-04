import { useProject } from '@diversifiedfinance/app/hooks/use-project';
import { Text, View } from '@diversifiedfinance/design-system';
import { useProjectFeed } from '@diversifiedfinance/app/hooks/use-project-feed';
import React, { useMemo } from 'react';
import { ProjectCarousel } from '@diversifiedfinance/app/components/project-carousel';
import { useTranslation } from 'react-i18next';
import { useIsDarkMode } from '@diversifiedfinance/design-system/hooks';
import { colors } from '@diversifiedfinance/design-system/tailwind';

function hasCommonTags(tags1: any[] = [], tags2: any[] = []) {
	return tags1.filter((value) => tags2.includes(value)).length > 0;
}

export default function RelatedProjects() {
	const { t } = useTranslation();
	const { data: project } = useProject();
	const { data: allProjects } = useProjectFeed();
	const isDark = useIsDarkMode();
	const color = isDark ? colors.gray[900] : colors.gray[100];

	const relatedProjects = useMemo(() => {
		return (
			allProjects?.filter(
				({ slug, tags }) =>
					project?.slug !== slug && hasCommonTags(tags, project?.tags)
			) ?? []
		);
	}, [allProjects.length, project?.slug, project?.tags]);

	if (relatedProjects.length === 0) {
		return (
			<View>
				<Text>{t('No related projects available.')}</Text>
			</View>
		);
	}

	return (
		<View>
			<ProjectCarousel
				cardType="small"
				projects={relatedProjects}
				color={color}
			/>
		</View>
	);
}
