import { makeAutoObservable, reaction } from "mobx";
import userService, { type SignInReq } from "@/api/services/userService";
import { toast } from "sonner";
import type { UserInfo, UserToken } from "#/entity";
import { StorageEnum } from "#/enum";

interface PersistedState {
	[StorageEnum.UserInfo]?: Partial<UserInfo>;
	[StorageEnum.UserToken]?: UserToken;
	state?: {
		[StorageEnum.UserInfo]?: Partial<UserInfo>;
		[StorageEnum.UserToken]?: UserToken;
	};
}

class UserStore {
	userInfo: Partial<UserInfo> = {};
	userToken: UserToken = {};

	constructor() {
		makeAutoObservable(this);
		this.loadFromStorage();

		// MobX reaction: automatically persist to localStorage whenever state changes
		reaction(
			() => ({
				userInfo: this.userInfo,
				userToken: this.userToken,
			}),
			(data) => {
				try {
					const payload = {
						[StorageEnum.UserInfo]: data.userInfo,
						[StorageEnum.UserToken]: data.userToken,
						state: {
							[StorageEnum.UserInfo]: data.userInfo,
							[StorageEnum.UserToken]: data.userToken,
						},
					};
					localStorage.setItem("userStore", JSON.stringify(payload));
				} catch (e) {
					console.error("Failed to persist userStore to localStorage", e);
				}
			},
		);
	}

	private loadFromStorage() {
		try {
			const raw = localStorage.getItem("userStore");
			if (raw) {
				const parsed: PersistedState = JSON.parse(raw);
				const state = parsed.state || parsed;
				this.userInfo = state[StorageEnum.UserInfo] || {};
				this.userToken = state[StorageEnum.UserToken] || {};
			}
		} catch (e) {
			console.error("Failed to load userStore from localStorage", e);
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
		} catch (e) {
			console.error("Failed to clear userStore from localStorage", e);
		}
	};

	signIn = async (data: SignInReq) => {
		try {
			const res = await userService.signin(data);
			const { user, accessToken, refreshToken } = res;
			this.setUserToken({ accessToken, refreshToken });
			this.setUserInfo(user);
			return res;
		} catch (err: any) {
			toast.error(err.message, {
				position: "top-center",
			});
			throw err;
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
});
export const useSignIn = () => userStore.signIn;

export default userStore;
