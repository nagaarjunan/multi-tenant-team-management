import { makeAutoObservable } from "mobx";
import userService, { type SignInReq } from "@/api/services/userService";
import type { UserInfo, UserToken } from "#/entity";

class UserStore {
	userInfo: Partial<UserInfo> = {};
	userToken: UserToken = {};

	constructor() {
		makeAutoObservable(this);
		// Clean up any legacy userStore keys from localStorage
		try {
			localStorage.removeItem("userStore");
		} catch (e) {
			console.error("Failed to clean up legacy userStore from localStorage", e);
		}
	}

	setUserInfo = (userInfo: UserInfo) => {
		this.userInfo = userInfo;
	};

	setUserToken = (token: UserToken) => {
		this.userToken = token;
	};

	clearUserInfoAndToken = () => {
		this.userInfo = {};
		this.userToken = {};
		try {
			localStorage.removeItem("userStore");
			localStorage.removeItem("slash_saas_multi_tenant_store_v2");
		} catch (e) {
			console.error("Failed to clear userStore from localStorage", e);
		}
	};

	signIn = async (data: SignInReq) => {
		const res = await userService.signin(data);
		const { user } = res;
		const token = (res as any)?.accessToken || (res as any)?.token;
		if (token) {
			this.setUserToken({ accessToken: token, refreshToken: token });
		}
		if (user) {
			this.setUserInfo(user);
		}
		return res;
	};

	private checkAuthPromise: Promise<UserInfo | null> | null = null;

	checkAuth = async (forceRefresh = false) => {
		if (!forceRefresh && this.userInfo?.id) {
			return this.userInfo as UserInfo;
		}

		if (this.checkAuthPromise) {
			return this.checkAuthPromise;
		}

		this.checkAuthPromise = (async () => {
			try {
				const user = await userService.getMe();
				if (user && user.id) {
					this.setUserInfo(user);
					return user;
				}
				this.clearUserInfoAndToken();
				return null;
			} catch {
				this.clearUserInfoAndToken();
				return null;
			} finally {
				this.checkAuthPromise = null;
			}
		})();

		return this.checkAuthPromise;
	};

	logout = async () => {
		try {
			await userService.logout();
		} catch {
			// ignore logout errors
		} finally {
			this.clearUserInfoAndToken();
		}
	};

	// Compatibility method for non-React contexts (such as apiClient.ts)
	getState = () => ({
		userInfo: this.userInfo,
		userToken: this.userToken,
		actions: {
			setUserInfo: this.setUserInfo,
			setUserToken: this.setUserToken,
			clearUserInfoAndToken: this.clearUserInfoAndToken,
		},
	});
}

export const userStore = new UserStore();

// React hooks for accessing MobX userStore state and actions
export const useUserInfo = () => userStore.userInfo;
export const useUserToken = () => userStore.userToken;
export const useUserPermissions = () => userStore.userInfo.permissions || [];
export const useUserRoles = () => userStore.userInfo.roles || [];
export const useUserActions = () => ({
	setUserInfo: userStore.setUserInfo,
	setUserToken: userStore.setUserToken,
	clearUserInfoAndToken: userStore.clearUserInfoAndToken,
	logout: userStore.logout,
	checkAuth: userStore.checkAuth,
});
export const useSignIn = () => userStore.signIn;

export default userStore;
