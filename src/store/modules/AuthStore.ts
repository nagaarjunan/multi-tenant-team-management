import { makeAutoObservable, runInAction } from 'mobx';
import userService, { type SignInReq, type SignUpReq } from '@/api/services/userService';
import type { BackendUser } from '@/types/backend';
import type { RootStore } from '../RootStore';
import { toast } from 'sonner';

export class AuthStore {
	rootStore: RootStore;
	currentUser: BackendUser | null = null;
	token: string | null = null;
	isLoading = false;
	error: string | null = null;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this, { rootStore: false });
		this.loadInitialToken();
	}

	private loadInitialToken() {
		const storedToken = localStorage.getItem('access_token');
		if (storedToken) {
			this.token = storedToken;
		}
	}

	get isAuthenticated(): boolean {
		return !!this.token || !!this.currentUser;
	}

	get isSuperAdmin(): boolean {
		return this.currentUser?.role === 'superadmin';
	}

	get userDisplayName(): string {
		return this.currentUser?.name || 'Workspace User';
	}

	get userEmail(): string {
		return this.currentUser?.email || '';
	}

	setToken(token: string | null) {
		this.token = token;
		if (token) {
			localStorage.setItem('access_token', token);
		} else {
			localStorage.removeItem('access_token');
		}
	}

	async login(credentials: SignInReq) {
		this.isLoading = true;
		this.error = null;
		try {
			const res = await userService.signin(credentials);
			runInAction(() => {
				const receivedToken = (res as any)?.accessToken || (res as any)?.token;
				this.setToken(receivedToken);
				const u = (res as any)?.user;
				if (u) {
					this.currentUser = {
						_id: u._id || u.id,
						id: u.id || u._id,
						name: u.name || u.username,
						email: u.email,
						role: u.role || 'member',
					};
				}
				this.isLoading = false;
			});
			// Automatically load user's organizations
			this.rootStore.organizationStore.fetchMyOrganizations();
			return res;
		} catch (err: any) {
			runInAction(() => {
				this.error = err.message || 'Login failed';
				this.isLoading = false;
			});
			throw err;
		}
	}

	async register(data: SignUpReq) {
		this.isLoading = true;
		this.error = null;
		try {
			const res = await userService.signup(data);
			runInAction(() => {
				const receivedToken = (res as any)?.accessToken || (res as any)?.token;
				this.setToken(receivedToken);
				const u = (res as any)?.user;
				if (u) {
					this.currentUser = {
						_id: u._id || u.id,
						id: u.id || u._id,
						name: u.name || u.username,
						email: u.email,
						role: u.role || 'member',
					};
				}
				this.isLoading = false;
			});
			return res;
		} catch (err: any) {
			runInAction(() => {
				this.error = err.message || 'Registration failed';
				this.isLoading = false;
			});
			throw err;
		}
	}

	async fetchMe() {
		if (!this.token && !document.cookie.includes('token=')) return null;
		try {
			const u = (await userService.getMe()) as any;
			runInAction(() => {
				if (u) {
					this.currentUser = {
						_id: u._id || u.id,
						id: u.id || u._id,
						name: u.name || u.username,
						email: u.email,
						role: u.role || 'member',
					};
				}
			});
			return this.currentUser;
		} catch {
			runInAction(() => {
				this.currentUser = null;
			});
			return null;
		}
	}

	async logout() {
		try {
			await userService.logout();
		} catch {
			// Ignore network failure on logout
		} finally {
			runInAction(() => {
				this.currentUser = null;
				this.setToken(null);
				this.rootStore.organizationStore.reset();
			});
			toast.info('You have been logged out.');
		}
	}
}
