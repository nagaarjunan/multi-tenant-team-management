import apiClient from '../apiClient';
import type { BackendTask, BackendTaskPriority, BackendTaskStatus, BackendTaskType } from '@/types/backend';

export interface CreateTaskReq {
	title: string;
	description?: string;
	projectId: string;
	assigneeId?: string | null;
	type?: BackendTaskType;
	priority?: BackendTaskPriority;
	dueDate?: string;
}

export interface UpdateTaskReq {
	title?: string;
	description?: string;
	assigneeId?: string | null;
	type?: BackendTaskType;
	priority?: BackendTaskPriority;
	status?: BackendTaskStatus;
	dueDate?: string;
}

export interface TaskFilterParams {
	status?: string;
	priority?: string;
	type?: string;
	assigneeId?: string;
}

const getProjectTasks = (projectId: string, params?: TaskFilterParams) =>
	apiClient.get<BackendTask[]>({ url: `/tasks/project/${projectId}`, params });
const getMyAssignedTasks = (status?: string) =>
	apiClient.get<BackendTask[]>({ url: '/tasks/my', params: status ? { status } : undefined });
const getTaskById = (id: string) => apiClient.get<BackendTask>({ url: `/tasks/${id}` });
const createTask = (data: CreateTaskReq) => apiClient.post<BackendTask>({ url: '/tasks', data });
const updateTask = (id: string, data: UpdateTaskReq) =>
	apiClient.put<BackendTask>({ url: `/tasks/${id}`, data });
const updateTaskStatus = (id: string, status: BackendTaskStatus) =>
	apiClient.patch<BackendTask>({ url: `/tasks/${id}/status`, data: { status } });
const assignTask = (id: string, assigneeId: string | null) =>
	apiClient.patch<BackendTask>({ url: `/tasks/${id}/assign`, data: { assigneeId } });
const deleteTask = (id: string) => apiClient.delete({ url: `/tasks/${id}` });

export default {
	getProjectTasks,
	getMyAssignedTasks,
	getTaskById,
	createTask,
	updateTask,
	updateTaskStatus,
	assignTask,
	deleteTask,
};
