import { makeAutoObservable, runInAction } from 'mobx';
import projectService, {
	type CreateProjectReq,
	type UpdateProjectReq,
} from '@/api/services/projectService';
import type { BackendProject } from '@/types/backend';
import type { RootStore } from '../RootStore';
import { toast } from 'sonner';

export class ProjectStore {
	rootStore: RootStore;
	projects: BackendProject[] = [];
	currentProjectId: string | null = null;
	filterTeamId: string = 'ALL';
	filterStatus: string = 'ALL';
	isLoading = false;
	error: string | null = null;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this, { rootStore: false });
	}

	get currentProject(): BackendProject | null {
		if (!this.currentProjectId) return this.projects[0] || null;
		return this.projects.find((p) => (p._id || p.id) === this.currentProjectId) || null;
	}

	get filteredProjects(): BackendProject[] {
		return this.projects.filter((p) => {
			if (this.filterTeamId !== 'ALL') {
				const tId = typeof p.teamId === 'object' ? (p.teamId as any)?._id || (p.teamId as any)?.id : p.teamId;
				if (tId !== this.filterTeamId) return false;
			}
			if (this.filterStatus !== 'ALL' && p.status !== this.filterStatus) {
				return false;
			}
			return true;
		});
	}

	get activeProjectsCount(): number {
		return this.projects.filter((p) => p.status === 'in-progress' || p.status === 'planning').length;
	}

	setFilterTeamId(teamId: string) {
		this.filterTeamId = teamId;
	}

	setFilterStatus(status: string) {
		this.filterStatus = status;
	}

	selectProject(projectId: string | null) {
		this.currentProjectId = projectId;
		if (projectId) {
			this.rootStore.taskStore.fetchProjectTasks(projectId);
		}
	}

	async fetchOrgProjects(orgId: string) {
		if (!orgId) return [];
		this.isLoading = true;
		try {
			const projects = await projectService.getOrganizationProjects(orgId);
			runInAction(() => {
				this.projects = Array.isArray(projects) ? projects : [];
				this.isLoading = false;
				if (!this.currentProjectId && this.projects.length > 0) {
					const firstId = this.projects[0]._id || this.projects[0].id;
					if (firstId) this.selectProject(firstId);
				}
			});
			return this.projects;
		} catch (err: any) {
			runInAction(() => {
				this.error = err.message || 'Failed to fetch projects';
				this.isLoading = false;
			});
			return [];
		}
	}

	async createProject(data: CreateProjectReq) {
		try {
			const created = await projectService.createProject(data);
			runInAction(() => {
				this.projects.push(created);
				const createdId = created._id || created.id;
				if (createdId) this.selectProject(createdId);
			});
			toast.success(`Project "${created.name}" created!`);
			return created;
		} catch (err: any) {
			toast.error(err.message || 'Failed to create project');
			throw err;
		}
	}

	async updateProject(id: string, data: UpdateProjectReq) {
		try {
			const updated = await projectService.updateProject(id, data);
			runInAction(() => {
				const idx = this.projects.findIndex((p) => (p._id || p.id) === id);
				if (idx !== -1) {
					this.projects[idx] = updated;
				}
			});
			toast.success('Project updated.');
			return updated;
		} catch (err: any) {
			toast.error(err.message || 'Failed to update project');
			throw err;
		}
	}

	async allocateMembers(projectId: string, memberIds: string[]) {
		try {
			const updated = await projectService.allocateMembers(projectId, memberIds);
			runInAction(() => {
				const idx = this.projects.findIndex((p) => (p._id || p.id) === projectId);
				if (idx !== -1) {
					this.projects[idx] = updated;
				}
			});
			toast.success('Members allocated to project.');
			return updated;
		} catch (err: any) {
			toast.error(err.message || 'Failed to allocate members');
			throw err;
		}
	}

	async assignLead(projectId: string, leadId: string) {
		try {
			const updated = await projectService.assignProjectLead(projectId, leadId);
			runInAction(() => {
				const idx = this.projects.findIndex((p) => (p._id || p.id) === projectId);
				if (idx !== -1) {
					this.projects[idx] = updated;
				}
			});
			toast.success('Project lead assigned.');
			return updated;
		} catch (err: any) {
			toast.error(err.message || 'Failed to assign project lead');
			throw err;
		}
	}

	async removeMember(projectId: string, userId: string) {
		try {
			const updated = await projectService.removeMember(projectId, userId);
			runInAction(() => {
				const idx = this.projects.findIndex((p) => (p._id || p.id) === projectId);
				if (idx !== -1) {
					this.projects[idx] = updated;
				}
			});
			toast.success('Member removed from project.');
			return updated;
		} catch (err: any) {
			toast.error(err.message || 'Failed to remove member from project');
			throw err;
		}
	}

	async deleteProject(id: string) {
		try {
			await projectService.deleteProject(id);
			runInAction(() => {
				this.projects = this.projects.filter((p) => (p._id || p.id) !== id);
				if (this.currentProjectId === id) this.currentProjectId = null;
			});
			toast.success('Project deleted.');
		} catch (err: any) {
			toast.error(err.message || 'Failed to delete project');
			throw err;
		}
	}
}
