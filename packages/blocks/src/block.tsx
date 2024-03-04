import ChartBlock from './chart';
import ColumnsBlock from './columns';
import DetailsBlock from './details';
import EventCountdownBlock from './event-countdown';
import GroupBlock from './group';
import HeadingBlock from './heading';
import ImageBlock from './image';
import ParagraphBlock from './paragraph';
import PreformattedBlock from './preformatted';
import SlideshowBlock from './slideshow';
import SpacerBlock from './spacer';
import TabsBlock from './tabs';
import TabBlock from './tab';
import VideoBlock from './video';
import React, { ComponentType } from 'react';
import { WP_Block_Parsed } from 'wp-types';

// /!\ Help /!\
// You can visualize the raw data from blocks by querying this url:
// https://getdiversified.app/wp-json/wp/v2/project

export const blocksByBlockName = {
	'core/columns': ColumnsBlock,
	'core/details': DetailsBlock,
	'core/group': GroupBlock,
	'core/heading': HeadingBlock,
	'core/image': ImageBlock,
	'core/paragraph': ParagraphBlock,
	'core/preformatted': PreformattedBlock,
	'core/spacer': SpacerBlock,
	'core/video': VideoBlock,
	'jetpack/slideshow': SlideshowBlock,
	'jetpack/event-countdown': EventCountdownBlock,
	'plethoraplugins/tabs': TabsBlock,
	'plethoraplugins/tab': TabBlock,
};

export type BlockName = keyof typeof blocksByBlockName;
export type BlockOverrides = { [blockName in BlockName]?: ComponentType };

export default function Block({
	blockData,
	overrides,
}: {
	blockData: WP_Block_Parsed;
	overrides: BlockOverrides;
}) {
	const blockName = blockData.blockName as BlockName;
	const BlockComponent = overrides[blockName]
		? overrides[blockName]
		: blocksByBlockName[blockName];

	if (!BlockComponent) {
		return null;
	}

	return <BlockComponent {...blockData} overrides={overrides} />;
}
