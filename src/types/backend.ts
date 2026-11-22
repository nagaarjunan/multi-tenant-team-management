export type BackendUserRole = 'superadmin' | 'admin' | 'manager' | 'member';

export interface BackendUser {
	_id: string;
	id?: string;
	name: string;
	email: string;
	role: BackendUserRole;
	createdAt?: string;
	updatedAt?: string;
}

export interface BackendOrganization {
	_id: string;
	id?: string;
	name: string;
	slug: string;
	description?: string;
	ownerId: string;
	createdAt?: string;
	updatedAt?: string;
}

export type BackendOrgRole = 'owner' | 'admin' | 'member';

export interface BackendMembership {
	_id: string;
	id?: string;
	userId: string | BackendUser;
	organizationId: string | BackendOrganization;
	role: BackendOrgRole;
	createdAt?: string;
	updatedAt?: string;
}

export interface BackendTeam {
	_id: string;
	id?: string;
	name: string;
	description?: string;
	organizationId: string;
	leaderId?: string | BackendUser;
	members: Array<string | BackendUser>;
	createdAt?: string;
	updatedAt?: string;
}

export type BackendProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold';

export interface BackendProject {
	_id: string;
	id?: string;
	name: string;
	description?: string;
	organizationId: string | BackendOrganization;
	teamId: string | BackendTeam;
	leadId: string | BackendUser;
	members: Array<string | BackendUser>;
	status: BackendProjectStatus;
	startDate?: string;
	endDate?: string;
	createdAt?: string;
	updatedAt?: string;
}

export type BackendTaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';
export type BackendTaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type BackendTaskType = 'feature' | 'bug' | 'task';

export interface BackendTask {
	_id: string;
	id?: string;
	title: string;
	description?: string;
	projectId: string | BackendProject;
	organizationId: string;
	assigneeId?: string | BackendUser | null;
	reporterId: string | BackendUser;
	type: BackendTaskType;
	priority: BackendTaskPriority;
	status: BackendTaskStatus;
	dueDate?: string;
	createdAt?: string;
	updatedAt?: string;
}
