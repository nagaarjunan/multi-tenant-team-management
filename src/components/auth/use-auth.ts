import { useAuthorization } from "@/hooks/useAuthorization";
import { useUserInfo, useUserToken } from "@/store/userStore";
import type { PermissionCode } from "@/types/saas";

/**
 * Universal Permission / Role check hook
 * Seamlessly integrates SaaS authorization and legacy checks
 */
export const useAuthCheck = (baseOn: "role" | "permission" = "permission") => {
	const { accessToken } = useUserToken();
	const { permissions = [], roles = [] } = useUserInfo();
	const { can, isOwner, isAdmin, isMember, isSuperAdmin, role } = useAuthorization();

	const check = (item: string): boolean => {
		// 1. Check SaaS authorization engine
		if (baseOn === "permission") {
			if (can(item as PermissionCode)) {
				return true;
			}
		} else if (baseOn === "role") {
			if (isSuperAdmin && item === "SUPER_ADMIN") return true;
			if (isOwner && item === "OWNER") return true;
			if (isAdmin && item === "ADMIN") return true;
			if (isMember && item === "MEMBER") return true;
			if (role === item) return true;
		}

		// 2. Fallback to legacy userStore permissions if accessToken exists
		if (accessToken) {
			const resourcePool = baseOn === "role" ? roles : permissions;
			return resourcePool.some((p) => p.code === item);
		}

		return false;
	};

	const checkAny = (items: string[]) => {
		if (!items || items.length === 0) {
			return true;
		}
		return items.some((item) => check(item));
	};

	const checkAll = (items: string[]) => {
		if (!items || items.length === 0) {
			return true;
		}
		return items.every((item) => check(item));
	};

	return { check, checkAny, checkAll };
};
