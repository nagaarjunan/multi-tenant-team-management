import { makeAutoObservable, runInAction } from 'mobx';
import organizationService, {
	type CreateOrganizationReq,
	type UpdateOrganizationReq,
} from '@/api/services/organizationService';
import type { BackendOrganization } from '@/types/backend';
import type { RootStore } from '../RootStore';
import { toast } from 'sonner';

export class OrganizationStore {
	rootStore: RootStore;
	organizations: BackendOrganization[] = [];
	currentOrgId: string | null = null;
	isLoading = false;
	error: string | null = null;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this, { rootStore: false });
		const savedOrgId = localStorage.getItem('active_org_id');
		if (savedOrgId) {
			this.currentOrgId = savedOrgId;
		}
	}

	get currentOrganization(): BackendOrganization | null {
		if (!this.currentOrgId) return this.organizations[0] || null;
		return this.organizations.find((o) => (o._id || o.id) === this.currentOrgId) || this.organizations[0] || null;
	}

	get hasOrganizations(): boolean {
		return this.organizations.length > 0;
	}

	get orgCount(): number {
		return this.organizations.length;
	}

	selectOrganization(orgId: string) {
		this.currentOrgId = orgId;
		localStorage.setItem('active_org_id', orgId);

		// Synchronize downstream stores with the newly selected organization
		this.rootStore.membershipStore.fetchOrgMembers(orgId);
		this.rootStore.teamStore.fetchOrgTeams(orgId);
		this.rootStore.projectStore.fetchOrgProjects(orgId);
	}

	async fetchMyOrganizations() {
		this.isLoading = true;
		this.error = null;
		try {
			const orgs = await organizationService.getMyOrganizations();
			runInAction(() => {
				this.organizations = Array.isArray(orgs) ? orgs : [];
				this.isLoading = false;

				// Default to first organization if none selected
				if (!this.currentOrgId && this.organizations.length > 0) {
					const firstId = this.organizations[0]._id || this.organizations[0].id;
					if (firstId) {
						this.selectOrganization(firstId);
					}
				} else if (this.currentOrgId) {
					// Verify selected organization still exists
					const exists = this.organizations.some((o) => (o._id || o.id) === this.currentOrgId);
					if (exists) {
						this.selectOrganization(this.currentOrgId);
					} else if (this.organizations.length > 0) {
						const firstId = this.organizations[0]._id || this.organizations[0].id;
						if (firstId) this.selectOrganization(firstId);
					}
				}
			});
			return this.organizations;
		} catch (err: any) {
			runInAction(() => {
				this.error = err.message || 'Failed to fetch organizations';
				this.isLoading = false;
			});
			return [];
		}
	}

	async createOrganization(data: CreateOrganizationReq) {
		this.isLoading = true;
		try {
			const newOrg = await organizationService.createOrganization(data);
			runInAction(() => {
				this.organizations.push(newOrg);
				const newId = newOrg._id || newOrg.id;
				if (newId) {
					this.selectOrganization(newId);
				}
				this.isLoading = false;
			});
			toast.success(`Organization "${newOrg.name}" created successfully!`);
			return newOrg;
		} catch (err: any) {
			runInAction(() => {
				this.isLoading = false;
			});
			toast.error(err.message || 'Failed to create organization');
			throw err;
		}
	}

	async updateOrganization(id: string, data: UpdateOrganizationReq) {
		try {
			const updated = await organizationService.updateOrganization(id, data);
			runInAction(() => {
				const idx = this.organizations.findIndex((o) => (o._id || o.id) === id);
				if (idx !== -1) {
					this.organizations[idx] = updated;
				}
			});
			toast.success('Organization updated successfully.');
			return updated;
		} catch (err: any) {
			toast.error(err.message || 'Failed to update organization');
			throw err;
		}
	}

	async deleteOrganization(id: string) {
		try {
			await organizationService.deleteOrganization(id);
			runInAction(() => {
				this.organizations = this.organizations.filter((o) => (o._id || o.id) !== id);
				if (this.currentOrgId === id) {
					this.currentOrgId = this.organizations[0]?._id || this.organizations[0]?.id || null;
					if (this.currentOrgId) {
						this.selectOrganization(this.currentOrgId);
					}
				}
			});
			toast.success('Organization deleted.');
		} catch (err: any) {
			toast.error(err.message || 'Failed to delete organization');
			throw err;
		}
	}

	reset() {
		this.organizations = [];
		this.currentOrgId = null;
		localStorage.removeItem('active_org_id');
	}
}
