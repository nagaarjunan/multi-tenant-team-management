import { makeAutoObservable, runInAction } from 'mobx';
import teamService, { type CreateTeamReq, type UpdateTeamReq } from '@/api/services/teamService';
import type { BackendTeam } from '@/types/backend';
import type { RootStore } from '../RootStore';
import { toast } from 'sonner';

export class TeamStore {
	rootStore: RootStore;
	teams: BackendTeam[] = [];
	currentTeamId: string | null = null;
	isLoading = false;
	error: string | null = null;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this, { rootStore: false });
	}

	get teamCount(): number {
		return this.teams.length;
	}

	get currentTeam(): BackendTeam | null {
		if (!this.currentTeamId) return this.teams[0] || null;
		return this.teams.find((t) => (t._id || t.id) === this.currentTeamId) || null;
	}

	selectTeam(teamId: string | null) {
		this.currentTeamId = teamId;
	}

	async fetchOrgTeams(orgId: string) {
		if (!orgId) return [];
		this.isLoading = true;
		try {
			const teams = await teamService.getOrganizationTeams(orgId);
			runInAction(() => {
				this.teams = Array.isArray(teams) ? teams : [];
				this.isLoading = false;
			});
			return this.teams;
		} catch (err: any) {
			runInAction(() => {
				this.error = err.message || 'Failed to fetch teams';
				this.isLoading = false;
			});
			return [];
		}
	}

	async createTeam(data: CreateTeamReq) {
		try {
			const created = await teamService.createTeam(data);
			runInAction(() => {
				this.teams.push(created);
			});
			toast.success(`Team "${created.name}" created!`);
			return created;
		} catch (err: any) {
			toast.error(err.message || 'Failed to create team');
			throw err;
		}
	}

	async updateTeam(id: string, data: UpdateTeamReq) {
		try {
			const updated = await teamService.updateTeam(id, data);
			runInAction(() => {
				const idx = this.teams.findIndex((t) => (t._id || t.id) === id);
				if (idx !== -1) {
					this.teams[idx] = updated;
				}
			});
			toast.success('Team updated.');
			return updated;
		} catch (err: any) {
			toast.error(err.message || 'Failed to update team');
			throw err;
		}
	}

	async addMember(teamId: string, userId: string) {
		try {
			const updated = await teamService.addMemberToTeam(teamId, userId);
			runInAction(() => {
				const idx = this.teams.findIndex((t) => (t._id || t.id) === teamId);
				if (idx !== -1) {
					this.teams[idx] = updated;
				}
			});
			toast.success('Member added to team.');
			return updated;
		} catch (err: any) {
			toast.error(err.message || 'Failed to add member to team');
			throw err;
		}
	}

	async removeMember(teamId: string, userId: string) {
		try {
			const updated = await teamService.removeMemberFromTeam(teamId, userId);
			runInAction(() => {
				const idx = this.teams.findIndex((t) => (t._id || t.id) === teamId);
				if (idx !== -1) {
					this.teams[idx] = updated;
				}
			});
			toast.success('Member removed from team.');
			return updated;
		} catch (err: any) {
			toast.error(err.message || 'Failed to remove member from team');
			throw err;
		}
	}

	async deleteTeam(id: string) {
		try {
			await teamService.deleteTeam(id);
			runInAction(() => {
				this.teams = this.teams.filter((t) => (t._id || t.id) !== id);
				if (this.currentTeamId === id) this.currentTeamId = null;
			});
			toast.success('Team deleted.');
		} catch (err: any) {
			toast.error(err.message || 'Failed to delete team');
			throw err;
		}
	}
}
