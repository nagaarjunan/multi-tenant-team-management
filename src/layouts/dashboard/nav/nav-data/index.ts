import type { NavItemDataProps } from "@/components/nav/types";
import { GLOBAL_CONFIG } from "@/global-config";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useMemo } from "react";
import { backendNavData } from "./nav-data-backend";
import { frontendNavData } from "./nav-data-frontend";
import type { PermissionCode } from "@/types/saas";

const navData = GLOBAL_CONFIG.routerMode === "backend" ? backendNavData : frontendNavData;

/**
 * Filter navigation items recursively using the authorization hook
 */
const filterItems = (items: NavItemDataProps[], can: (p: PermissionCode) => boolean): NavItemDataProps[] => {
	const result: NavItemDataProps[] = [];

	for (const item of items) {
		const hasPermission = item.auth
			? (Array.isArray(item.auth) ? item.auth : [item.auth]).some((code) => can(code as PermissionCode))
			: true;

		if (!hasPermission) continue;

		let filteredChildren: NavItemDataProps[] | undefined = undefined;
		if (item.children?.length) {
			filteredChildren = filterItems(item.children, can);
			if (filteredChildren.length === 0) continue;
		}

		result.push({
			...item,
			children: filteredChildren,
		});
	}

	return result;
};

const filterNavData = (can: (p: PermissionCode) => boolean) => {
	return navData
		.map((group) => {
			const filteredItems = filterItems(group.items, can);
			if (filteredItems.length === 0) {
				return null;
			}
			return {
				...group,
				items: filteredItems,
			};
		})
		.filter((group): group is NonNullable<typeof group> => group !== null);
};

/**
 * Hook to get filtered navigation data based on user permissions
 */
export const useFilteredNavData = () => {
	const { can, user, role, organization } = useAuthorization();

	const filteredNavData = useMemo(() => {
		return filterNavData(can);
	}, [can, user?.id, user?.platformRole, role, organization?.id]);

	return filteredNavData;
};
