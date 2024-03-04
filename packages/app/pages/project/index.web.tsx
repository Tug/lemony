import { ProjectScreen } from '@diversifiedfinance/app/screens/project';
import { SWRConfig } from 'swr';

const ProjectRouter = ({ fallback = {} }: { fallback?: object }) => {
	return (
		<SWRConfig value={{ fallback }}>
			<ProjectScreen />
		</SWRConfig>
	);
};

export default ProjectRouter;
