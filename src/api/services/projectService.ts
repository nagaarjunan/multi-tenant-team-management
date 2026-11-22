import apiClient from '../apiClient';
import type { BackendProject, BackendProjectStatus } from '@/types/backend';

export interface CreateProjectReq {
	name: string;
	description?: string;
	organizationId: string;
	teamId: string;
	leadId: string;
	members?: string[];
	status?: BackendProjectStatus;
	startDate?: string;
	endDate?: string;
}

export interface UpdateProjectReq {
	name?: string;
	description?: string;
	status?: BackendProjectStatus;
	startDate?: string;
	endDate?: string;
}

const getOrganizationProjects = (orgId: string) =>
	apiClient.get<BackendProject[]>({ url: `/projects/organization/${orgId}` });
const getTeamProjects = (teamId: string) =>
	apiClient.get<BackendProject[]>({ url: `/projects/team/${teamId}` });
const getProjectById = (id: string) => apiClient.get<BackendProject>({ url: `/projects/${id}` });
const createProject = (data: CreateProjectReq) =>
	apiClient.post<BackendProject>({ url: '/projects', data });
const updateProject = (id: string, data: UpdateProjectReq) =>
	apiClient.put<BackendProject>({ url: `/projects/${id}`, data });
const allocateMembers = (projectId: string, memberIds: string[]) =>
	apiClient.post<BackendProject>({ url: `/projects/${projectId}/members`, data: { memberIds } });
const assignProjectLead = (projectId: string, leadId: string) =>
	apiClient.put<BackendProject>({ url: `/projects/${projectId}/lead`, data: { leadId } });
const removeMember = (projectId: string, userId: string) =>
	apiClient.delete<BackendProject>({ url: `/projects/${projectId}/members/${userId}` });
const deleteProject = (id: string) => apiClient.delete({ url: `/projects/${id}` });

export default {
	getOrganizationProjects,
	getTeamProjects,
	getProjectById,
	createProject,
	updateProject,
	allocateMembers,
	assignProjectLead,
	removeMember,
	deleteProject,
};
