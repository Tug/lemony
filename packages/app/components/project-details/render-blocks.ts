import { renderBlocks as renderWPBlocks } from '@diversifiedfinance/blocks';
import ProjectChart from './custom-blocks/project-chart';
import RelatedProjects from './custom-blocks/related-projects';
import { WP_Block_Parsed } from 'wp-types';

export const renderBlocks = (blocks: WP_Block_Parsed[]) =>
	renderWPBlocks(blocks, {
		'oik-sb/chart': ProjectChart,
		'b-chart/chart': ProjectChart,
		'core/post-terms': RelatedProjects,
	});
