import { useMemo, useCallback } from "react";
import { useSaaSStore } from "@/store/saasStore";
import { checkResourcePermission } from "@/auth/authorization";
import type { OrgRole, PermissionCode, SaaSUser } from "@/types/saas";

export function useAuthorization() {
	const currentUserId = useSaaSStore((s) => s.currentUserId);
	const activeOrgId = useSaaSStore((s) => s.activeOrgId);
	const users = useSaaSStore((s) => s.users);
	const organizations = useSaaSStore((s) => s.organizations);
	const memberships = useSaaSStore((s) => s.memberships);
	const setCurrentUserId = useSaaSStore((s) => s.setCurrentUserId);
	const setActiveOrgId = useSaaSStore((s) => s.setActiveOrgId);
	const supportAccessReason = useSaaSStore((s) => s.supportAccessReason);

	// Current User
	const user = useMemo(() => users.find((u) => u.id === currentUserId) || users[0], [users, currentUserId]);

	// Active Organization
	const organization = useMemo(() => organizations.find((o) => o.id === activeOrgId) || organizations[0], [organizations, activeOrgId]);

	// Active Membership
	const activeMembership = useMemo(() => {
		return memberships.find((m) => m.orgId === organization?.id && m.userId === user?.id && m.status === "ACTIVE");
	}, [memberships, organization?.id, user?.id]);

	// User's available organizations
	const userOrganizations = useMemo(() => {
		if (user?.platformRole === "SUPER_ADMIN") {
			return organizations;
		}
		const userOrgIds = new Set(memberships.filter((m) => m.userId === user?.id && m.status === "ACTIVE").map((m) => m.orgId));
		return organizations.filter((o) => userOrgIds.has(o.id));
	}, [user, organizations, memberships]);

	// Effective Role in Active Org
	const role: OrgRole | undefined = useMemo(() => {
		if (user?.platformRole === "SUPER_ADMIN" && !activeMembership) {
			// Super admin in support mode acts with OWNER permissions
			return "OWNER";
		}
		return activeMembership?.role;
	}, [user?.platformRole, activeMembership]);

	const isSuperAdmin = user?.platformRole === "SUPER_ADMIN";
	const isOwner = role === "OWNER" || isSuperAdmin;
	const isAdmin = role === "ADMIN";
	const isMember = role === "MEMBER";

	// Members of the active organization with user info
	const activeOrgMembers = useMemo(() => {
		if (!organization) return [];
		return memberships
			.filter((m) => m.orgId === organization.id && m.status === "ACTIVE")
			.map((m) => ({
				membership: m,
				user: users.find((u) => u.id === m.userId) as SaaSUser,
			}))
			.filter((item) => !!item.user);
	}, [organization, memberships, users]);

	// Central permission check function
	const can = useCallback(
		(permission: PermissionCode, resource?: any): boolean => {
			if (!user) return false;
			return checkResourcePermission(user, role, permission, resource);
		},
		[user, role]
	);

	// Safe Organization Switcher (clears tenant cache and updates context)
	const switchOrganization = useCallback(
		(orgId: string) => {
			setActiveOrgId(orgId);
		},
		[setActiveOrgId]
	);

	// Impersonate / switch user for quick persona & RBAC testing
	const impersonateUser = useCallback(
		(userId: string) => {
			setCurrentUserId(userId);
		},
		[setCurrentUserId]
	);

	return {
		user,
		organization,
		activeMembership,
		role,
		isOwner,
		isAdmin,
		isMember,
		isSuperAdmin,
		userOrganizations,
		activeOrgMembers,
		can,
		switchOrganization,
		impersonateUser,
		supportAccessReason,
	};
}
