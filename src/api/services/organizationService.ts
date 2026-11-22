import apiClient from '../apiClient';
import type { BackendOrganization } from '@/types/backend';

export interface CreateOrganizationReq {
	name: string;
	slug?: string;
	description?: string;
}

export interface UpdateOrganizationReq {
	name?: string;
	slug?: string;
	description?: string;
}

const getMyOrganizations = () => apiClient.get<BackendOrganization[]>({ url: '/organizations/my' });
const getAllOrganizations = () => apiClient.get<BackendOrganization[]>({ url: '/organizations' });
const getOrganizationById = (id: string) => apiClient.get<BackendOrganization>({ url: `/organizations/${id}` });
const createOrganization = (data: CreateOrganizationReq) =>
	apiClient.post<BackendOrganization>({ url: '/organizations', data });
const updateOrganization = (id: string, data: UpdateOrganizationReq) =>
	apiClient.put<BackendOrganization>({ url: `/organizations/${id}`, data });
const deleteOrganization = (id: string) => apiClient.delete({ url: `/organizations/${id}` });

export default {
	getMyOrganizations,
	getAllOrganizations,
	getOrganizationById,
	createOrganization,
	updateOrganization,
	deleteOrganization,
};
