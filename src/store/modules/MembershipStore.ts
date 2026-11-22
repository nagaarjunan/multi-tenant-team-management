import { makeAutoObservable, runInAction } from 'mobx';
import membershipService, { type AddMemberReq } from '@/api/services/membershipService';
import type { BackendMembership, BackendOrgRole } from '@/types/backend';
import type { RootStore } from '../RootStore';
import { toast } from 'sonner';

export class MembershipStore {
	rootStore: RootStore;
	members: BackendMembership[] = [];
	myMemberships: BackendMembership[] = [];
	isLoading = false;
	error: string | null = null;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this, { rootStore: false });
	}

	get owners(): BackendMembership[] {
		return this.members.filter((m) => m.role === 'owner');
	}

	get admins(): BackendMembership[] {
		return this.members.filter((m) => m.role === 'admin');
	}

	get regularMembers(): BackendMembership[] {
		return this.members.filter((m) => m.role === 'member');
	}

	get memberCount(): number {
		return this.members.length;
	}

	get currentOrgUserRole(): BackendOrgRole | null {
		const currentUserId = this.rootStore.authStore.currentUser?._id || this.rootStore.authStore.currentUser?.id;
		if (!currentUserId) return null;
		const found = this.members.find((m) => {
			const uId = typeof m.userId === 'object' ? (m.userId as any)?._id || (m.userId as any)?.id : m.userId;
			return uId === currentUserId;
		});
		return found?.role || null;
	}

	get isCurrentUserOwnerOrAdmin(): boolean {
		if (this.rootStore.authStore.isSuperAdmin) return true;
		const role = this.currentOrgUserRole;
		return role === 'owner' || role === 'admin';
	}

	async fetchOrgMembers(orgId: string) {
		if (!orgId) return [];
		this.isLoading = true;
		try {
			const members = await membershipService.getOrganizationMembers(orgId);
			runInAction(() => {
				this.members = Array.isArray(members) ? members : [];
				this.isLoading = false;
			});
			return this.members;
		} catch (err: any) {
			runInAction(() => {
				this.error = err.message || 'Failed to fetch members';
				this.isLoading = false;
			});
			return [];
		}
	}

	async fetchMyMemberships() {
		try {
			const res = await membershipService.getMyMemberships();
			runInAction(() => {
				this.myMemberships = Array.isArray(res) ? res : [];
			});
			return this.myMemberships;
		} catch {
			return [];
		}
	}

	async addMember(data: AddMemberReq) {
		try {
			const newMember = await membershipService.addMember(data);
			runInAction(() => {
				this.members.push(newMember);
			});
			toast.success('Member added to organization.');
			return newMember;
		} catch (err: any) {
			toast.error(err.message || 'Failed to add member');
			throw err;
		}
	}

	async updateMemberRole(membershipId: string, role: BackendOrgRole) {
		try {
			const updated = await membershipService.updateMemberRole(membershipId, role);
			runInAction(() => {
				const idx = this.members.findIndex((m) => (m._id || m.id) === membershipId);
				if (idx !== -1) {
					this.members[idx] = updated;
				}
			});
			toast.success('Member role updated.');
			return updated;
		} catch (err: any) {
			toast.error(err.message || 'Failed to update member role');
			throw err;
		}
	}

	async removeMember(membershipId: string) {
		try {
			await membershipService.removeMember(membershipId);
			runInAction(() => {
				this.members = this.members.filter((m) => (m._id || m.id) !== membershipId);
			});
			toast.success('Member removed from organization.');
		} catch (err: any) {
			toast.error(err.message || 'Failed to remove member');
			throw err;
		}
	}
}
