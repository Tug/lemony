import { EmptyPlaceholder } from '../empty-placeholder';
import { useScrollToTop } from '@diversifiedfinance/app/lib/react-navigation/native';
import { renderBlocks } from './render-blocks';
import { View } from '@diversifiedfinance/design-system';
import { TabScrollView } from '@diversifiedfinance/design-system/tab-view';
import { Project } from '@diversifiedfinance/types';
import React, { forwardRef, useRef } from 'react';

type TabListProps = {
	project: Project;
	index: number;
};

export type ProjectTabListRef = {
	refresh: () => void;
};

export const ProjectTabList = forwardRef<ProjectTabListRef, TabListProps>(
	({ project, index }, ref) => {
		const listRef = useRef(null);
		useScrollToTop(listRef);

		const tabsBlock = project.content.find(
			({ blockName }) => blockName === 'plethoraplugins/tabs'
		);

		const tabBlock = tabsBlock?.innerBlocks?.[index];

		if (!tabsBlock || !tabBlock) {
			return (
				<EmptyPlaceholder title="No information found" hideLoginBtn />
			);
		}

		return (
			<TabScrollView
				contentContainerStyle={{
					marginTop: 4,
					alignItems: 'stretch',
				}}
				index={index}
				ref={listRef}
			>
				<View tw="mx-4 mb-32 mt-4">
					{renderBlocks(tabBlock.innerBlocks)}
				</View>
			</TabScrollView>
		);
	}
);
