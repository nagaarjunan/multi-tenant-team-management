import apiClient from '../apiClient';
import type { BackendTeam } from '@/types/backend';

export interface CreateTeamReq {
	name: string;
	description?: string;
	organizationId: string;
	leaderId?: string;
}

export interface UpdateTeamReq {
	name?: string;
	description?: string;
	leaderId?: string;
}

const getOrganizationTeams = (orgId: string) =>
	apiClient.get<BackendTeam[]>({ url: `/teams/organization/${orgId}` });
const getTeamById = (id: string) => apiClient.get<BackendTeam>({ url: `/teams/${id}` });
const createTeam = (data: CreateTeamReq) => apiClient.post<BackendTeam>({ url: '/teams', data });
const updateTeam = (id: string, data: UpdateTeamReq) =>
	apiClient.put<BackendTeam>({ url: `/teams/${id}`, data });
const addMemberToTeam = (teamId: string, userId: string) =>
	apiClient.post<BackendTeam>({ url: `/teams/${teamId}/members`, data: { userId } });
const removeMemberFromTeam = (teamId: string, userId: string) =>
	apiClient.delete<BackendTeam>({ url: `/teams/${teamId}/members/${userId}` });
const deleteTeam = (id: string) => apiClient.delete({ url: `/teams/${id}` });

export default {
	getOrganizationTeams,
	getTeamById,
	createTeam,
	updateTeam,
	addMemberToTeam,
	removeMemberFromTeam,
	deleteTeam,
};
