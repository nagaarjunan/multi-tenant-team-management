import type { OrgRole, PermissionCode, PlanTier, SaaSUser, Team, Project, Task, Blocker, DailyUpdate } from "@/types/saas";

/**
 * Static Role-to-Permissions Mapping
 *
 * OWNER: Full access to all features, billing, settings, role promotion, org deletion, transfer.
 * ADMIN: Operational admin. Can manage members, invite, teams, products, projects, tasks,
 *        daily updates, blockers, reports, settings.
 *        Explicitly RESTRICTED from: promoting admins, ownership transfer, billing, org deletion.
 * MEMBER: Individual contributor access. My Work, assigned teams, products, projects, tasks,
 *         daily updates, blockers, basic reports.
 */
export const ROLE_PERMISSIONS: Record<OrgRole, PermissionCode[]> = {
	OWNER: [
		"dashboard.view",
		"my_work.view",
		"team.view",
		"team.create",
		"team.update",
		"team.delete",
		"team.lead.assign",
		"team.member.manage",
		"product.view",
		"product.create",
		"product.update",
		"product.delete",
		"product.member.manage",
		"project.view",
		"project.create",
		"project.update",
		"project.delete",
		"project.member.manage",
		"task.view",
		"task.create",
		"task.update",
		"task.delete",
		"task.status.change",
		"daily_update.view",
		"daily_update.create",
		"daily_update.update",
		"blocker.view",
		"blocker.create",
		"blocker.resolve",
		"blocker.escalate",
		"report.view",
		"report.export",
		"member.view",
		"member.invite",
		"member.remove",
		"role.assign",
		"org.settings.view",
		"org.settings.update",
		"org.security.view",
		"org.billing.view",
		"org.billing.manage",
		"org.transfer",
		"org.delete",
	],
	ADMIN: [
		"dashboard.view",
		"my_work.view",
		"team.view",
		"team.create",
		"team.update",
		"team.delete",
		"team.lead.assign",
		"team.member.manage",
		"product.view",
		"product.create",
		"product.update",
		"product.delete",
		"product.member.manage",
		"project.view",
		"project.create",
		"project.update",
		"project.delete",
		"project.member.manage",
		"task.view",
		"task.create",
		"task.update",
		"task.delete",
		"task.status.change",
		"daily_update.view",
		"daily_update.create",
		"daily_update.update",
		"blocker.view",
		"blocker.create",
		"blocker.resolve",
		"blocker.escalate",
		"report.view",
		"report.export",
		"member.view",
		"member.invite",
		"org.settings.view",
		"org.settings.update",
		"org.security.view",
		// Note: Admins CANNOT assign roles (role.assign), CANNOT manage billing, CANNOT transfer, CANNOT delete org
	],
	MEMBER: [
		"dashboard.view",
		"my_work.view",
		"team.view",
		"product.view",
		"project.view",
		"task.view",
		"task.create",
		"task.update",
		"task.status.change",
		"daily_update.view",
		"daily_update.create",
		"daily_update.update",
		"blocker.view",
		"blocker.create",
		"report.view",
	],
};

/**
 * Plan Feature Matrix
 */
export const PLAN_FEATURE_ACCESS: Record<PlanTier, { maxMembers: number; maxTeams: number; reportExport: boolean; auditLogs: boolean; advancedAnalytics: boolean }> = {
	starter: {
		maxMembers: 5,
		maxTeams: 2,
		reportExport: false,
		auditLogs: false,
		advancedAnalytics: false,
	},
	professional: {
		maxMembers: 25,
		maxTeams: 10,
		reportExport: true,
		auditLogs: true,
		advancedAnalytics: true,
	},
	enterprise: {
		maxMembers: 9999,
		maxTeams: 9999,
		reportExport: true,
		auditLogs: true,
		advancedAnalytics: true,
	},
};

/**
 * Checks resource-level permissions (e.g. Can this user edit this specific task, team, or blocker?)
 */
export function checkResourcePermission(
	user: SaaSUser,
	role: OrgRole | undefined,
	permission: PermissionCode,
	resource?: any
): boolean {
	// If Super Admin, allow
	if (user.platformRole === "SUPER_ADMIN") return true;

	if (!role) return false;

	// Check if the role inherently has the global permission
	const hasGlobal = ROLE_PERMISSIONS[role]?.includes(permission);
	if (!hasGlobal) return false;

	// If no specific resource context is passed, standard role check applies
	if (!resource) return true;

	// Owner & Admin have organization-wide override on operational resources
	if (role === "OWNER" || role === "ADMIN") {
		return true;
	}

	// MEMBER resource-level specific rules:
	switch (permission) {
		case "task.update":
		case "task.status.change": {
			const task = resource as Task;
			return task.assigneeId === user.id || task.reporterId === user.id;
		}
		case "task.delete": {
			const task = resource as Task;
			return task.reporterId === user.id;
		}
		case "daily_update.update": {
			const update = resource as DailyUpdate;
			return update.userId === user.id;
		}
		case "blocker.resolve": {
			const blocker = resource as Blocker;
			return blocker.reporterId === user.id || blocker.assigneeId === user.id;
		}
		case "team.member.manage":
		case "team.update": {
			const team = resource as Team;
			// Team Lead responsibility grants team-level management!
			return team.leadId === user.id;
		}
		case "project.update": {
			const project = resource as Project;
			return project.memberIds?.includes(user.id);
		}
		default:
			return true;
	}
}
