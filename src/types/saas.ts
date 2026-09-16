export type PlatformRole = "SUPER_ADMIN";

export type OrgRole = "OWNER" | "ADMIN" | "MEMBER";

export type PlanTier = "starter" | "professional" | "enterprise";

export type PlanStatus = "active" | "trialing" | "past_due" | "canceled";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type BlockerSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type BlockerStatus = "OPEN" | "INVESTIGATING" | "RESOLVED";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

export type DailyUpdateStatus = "DRAFT" | "PUBLISHED";

export interface Organization {
	id: string;
	name: string;
	slug: string;
	logo?: string;
	country: string;
	countryCode: string;
	timezone: string;
	locale: string;
	currency: string;
	currencySymbol: string;
	dateFormat: string;
	timeFormat: string;
	weekStartDay: "MONDAY" | "SUNDAY";
	plan: PlanTier;
	planStatus: PlanStatus;
	ownerId: string;
	createdAt: string;
	updatedAt?: string;
}

export interface SaaSUser {
	id: string;
	name: string;
	email: string;
	avatar: string;
	platformRole?: PlatformRole;
	title?: string;
	bio?: string;
}

export interface OrgMembership {
	id: string;
	orgId: string;
	userId: string;
	role: OrgRole;
	joinedAt: string;
	status: "ACTIVE" | "INVITED" | "SUSPENDED";
}

export interface Team {
	id: string;
	orgId: string;
	name: string;
	description: string;
	leadId?: string; // Team Lead responsibility (must be a team member)
	memberIds: string[];
	createdAt: string;
}

export interface Product {
	id: string;
	orgId: string;
	name: string;
	description: string;
	memberIds: string[];
	createdAt: string;
}

export interface Project {
	id: string;
	orgId: string;
	productId: string;
	name: string;
	description: string;
	status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED";
	startDate: string;
	targetDate: string;
	memberIds: string[];
	createdAt: string;
}

export interface TaskComment {
	id: string;
	userId: string;
	content: string;
	createdAt: string;
}

export interface TaskAttachment {
	id: string;
	name: string;
	url: string;
	size: string;
	uploadedBy: string;
	uploadedAt: string;
}

export interface Task {
	id: string;
	orgId: string;
	projectId: string;
	teamId?: string;
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	assigneeId?: string;
	reporterId: string;
	dueDate?: string;
	labels: string[];
	comments: TaskComment[];
	attachments: TaskAttachment[];
	createdAt: string;
	updatedAt: string;
}

export interface DailyUpdate {
	id: string;
	orgId: string;
	userId: string;
	date: string; // YYYY-MM-DD in tenant timezone
	yesterday: string;
	today: string;
	blockers: string;
	status: DailyUpdateStatus;
	createdAt: string;
	updatedAt?: string;
}

export interface Blocker {
	id: string;
	orgId: string;
	title: string;
	description: string;
	taskId?: string;
	teamId?: string;
	reporterId: string;
	assigneeId?: string;
	severity: BlockerSeverity;
	status: BlockerStatus;
	resolution?: string;
	resolvedAt?: string;
	createdAt: string;
	updatedAt?: string;
}

export interface Invitation {
	id: string;
	orgId: string;
	email: string;
	role: "ADMIN" | "MEMBER";
	status: InvitationStatus;
	invitedBy: string;
	createdAt: string;
	expiresAt: string;
}

export interface AuditLog {
	id: string;
	orgId?: string; // empty for platform level
	actorId: string;
	actorName: string;
	action: string;
	resourceType: string;
	resourceId: string;
	details?: string;
	timestamp: string;
}

export type PermissionCode =
	| "dashboard.view"
	| "my_work.view"
	| "team.view"
	| "team.create"
	| "team.update"
	| "team.delete"
	| "team.lead.assign"
	| "team.member.manage"
	| "product.view"
	| "product.create"
	| "product.update"
	| "product.delete"
	| "product.member.manage"
	| "project.view"
	| "project.create"
	| "project.update"
	| "project.delete"
	| "project.member.manage"
	| "task.view"
	| "task.create"
	| "task.update"
	| "task.delete"
	| "task.status.change"
	| "daily_update.view"
	| "daily_update.create"
	| "daily_update.update"
	| "blocker.view"
	| "blocker.create"
	| "blocker.resolve"
	| "blocker.escalate"
	| "report.view"
	| "report.export"
	| "member.view"
	| "member.invite"
	| "member.remove"
	| "role.assign"
	| "org.settings.view"
	| "org.settings.update"
	| "org.security.view"
	| "org.billing.view"
	| "org.billing.manage"
	| "org.transfer"
	| "org.delete"
	| "super_admin.access";
