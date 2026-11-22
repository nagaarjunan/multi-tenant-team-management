import apiClient from '../apiClient';
import type { BackendMembership, BackendOrgRole } from '@/types/backend';

export interface AddMemberReq {
	userId: string;
	organizationId: string;
	role?: BackendOrgRole;
}

const getMyMemberships = () => apiClient.get<BackendMembership[]>({ url: '/memberships/my' });
const getOrganizationMembers = (orgId: string) =>
	apiClient.get<BackendMembership[]>({ url: `/memberships/organization/${orgId}` });
const addMember = (data: AddMemberReq) => apiClient.post<BackendMembership>({ url: '/memberships', data });
const updateMemberRole = (membershipId: string, role: BackendOrgRole) =>
	apiClient.put<BackendMembership>({ url: `/memberships/${membershipId}`, data: { role } });
const removeMember = (membershipId: string) => apiClient.delete({ url: `/memberships/${membershipId}` });

export default {
	getMyMemberships,
	getOrganizationMembers,
	addMember,
	updateMemberRole,
	removeMember,
};
