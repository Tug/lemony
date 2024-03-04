import { Context, createContext } from 'react';
import { Project } from '@diversifiedfinance/types';

type ProjectContextType = {
	project?: Project;
};

const ProjectContext: Context<ProjectContextType> = createContext({});

export { ProjectContext };
