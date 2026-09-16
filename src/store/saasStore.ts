import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
	AuditLog,
	Blocker,
	DailyUpdate,
	Invitation,
	OrgMembership,
	OrgRole,
	Organization,
	PlanTier,
	Product,
	Project,
	SaaSUser,
	Task,
	TaskStatus,
	Team,
} from "@/types/saas";

// Seed Users
export const SEED_USERS: SaaSUser[] = [
	{
		id: "usr-tanaka",
		name: "Tanaka Hiroshi",
		email: "tanaka@acme.com",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tanaka",
		title: "VP of Engineering & Founder",
		bio: "Founder & Technology Leader.",
	},
	{
		id: "usr-yuki",
		name: "Yuki Sato",
		email: "yuki@acme.com",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki",
		title: "Engineering Operations Admin",
		bio: "Operations, sprint planning & release management.",
	},
	{
		id: "usr-priya",
		name: "Priya Sharma",
		email: "priya@acme.in",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
		title: "Senior Backend Engineer & Team Lead",
		bio: "Distributed systems specialist & Backend Team Lead.",
	},
	{
		id: "usr-ken",
		name: "Ken Takahashi",
		email: "ken@startup.jp",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ken",
		title: "Fullstack Software Engineer",
		bio: "React, Node.js and cloud infrastructure.",
	},
	{
		id: "usr-superadmin",
		name: "Alex Chen (Platform Admin)",
		email: "alex.platform@slashsaas.com",
		avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AlexPlatform",
		platformRole: "SUPER_ADMIN",
		title: "SaaS Platform Super Administrator",
		bio: "Internal SaaS Platform Operator.",
	},
];

// Seed Organizations
export const SEED_ORGS: Organization[] = [
	{
		id: "org-india",
		name: "Acme India",
		slug: "acme-india",
		logo: "https://api.dicebear.com/7.x/identicon/svg?seed=AcmeIndia",
		country: "India",
		countryCode: "IN",
		timezone: "Asia/Kolkata",
		locale: "en-IN",
		currency: "INR",
		currencySymbol: "₹",
		dateFormat: "DD/MM/YYYY",
		timeFormat: "hh:mm A",
		weekStartDay: "MONDAY",
		plan: "professional",
		planStatus: "active",
		ownerId: "usr-tanaka",
		createdAt: "2026-01-10T08:00:00.000Z",
	},
	{
		id: "org-japan",
		name: "Startup Japan",
		slug: "startup-japan",
		logo: "https://api.dicebear.com/7.x/identicon/svg?seed=StartupJapan",
		country: "Japan",
		countryCode: "JP",
		timezone: "Asia/Tokyo",
		locale: "ja-JP",
		currency: "JPY",
		currencySymbol: "¥",
		dateFormat: "YYYY/MM/DD",
		timeFormat: "HH:mm",
		weekStartDay: "MONDAY",
		plan: "starter",
		planStatus: "active",
		ownerId: "usr-tanaka",
		createdAt: "2026-02-01T09:30:00.000Z",
	},
	{
		id: "org-uk",
		name: "Acme UK Ltd",
		slug: "acme-uk",
		logo: "https://api.dicebear.com/7.x/identicon/svg?seed=AcmeUK",
		country: "United Kingdom",
		countryCode: "GB",
		timezone: "Europe/London",
		locale: "en-GB",
		currency: "GBP",
		currencySymbol: "£",
		dateFormat: "DD/MM/YYYY",
		timeFormat: "HH:mm",
		weekStartDay: "MONDAY",
		plan: "enterprise",
		planStatus: "active",
		ownerId: "usr-tanaka",
		createdAt: "2025-11-15T11:00:00.000Z",
	},
	{
		id: "org-us",
		name: "Tech Global US",
		slug: "tech-global-us",
		logo: "https://api.dicebear.com/7.x/identicon/svg?seed=TechGlobalUS",
		country: "United States",
		countryCode: "US",
		timezone: "America/New_York",
		locale: "en-US",
		currency: "USD",
		currencySymbol: "$",
		dateFormat: "MM/DD/YYYY",
		timeFormat: "hh:mm A",
		weekStartDay: "SUNDAY",
		plan: "professional",
		planStatus: "active",
		ownerId: "usr-yuki",
		createdAt: "2026-03-01T14:00:00.000Z",
	},
];

// Seed Memberships
export const SEED_MEMBERSHIPS: OrgMembership[] = [
	// Acme India Members
	{ id: "mem-1", orgId: "org-india", userId: "usr-tanaka", role: "OWNER", joinedAt: "2026-01-10T08:00:00Z", status: "ACTIVE" },
	{ id: "mem-2", orgId: "org-india", userId: "usr-yuki", role: "ADMIN", joinedAt: "2026-01-12T09:00:00Z", status: "ACTIVE" },
	{ id: "mem-3", orgId: "org-india", userId: "usr-priya", role: "MEMBER", joinedAt: "2026-01-15T10:00:00Z", status: "ACTIVE" },
	{ id: "mem-4", orgId: "org-india", userId: "usr-ken", role: "MEMBER", joinedAt: "2026-02-01T11:00:00Z", status: "ACTIVE" },

	// Startup Japan Members
	{ id: "mem-5", orgId: "org-japan", userId: "usr-tanaka", role: "OWNER", joinedAt: "2026-02-01T09:30:00Z", status: "ACTIVE" },
	{ id: "mem-6", orgId: "org-japan", userId: "usr-yuki", role: "ADMIN", joinedAt: "2026-02-02T10:00:00Z", status: "ACTIVE" },
	{ id: "mem-7", orgId: "org-japan", userId: "usr-ken", role: "MEMBER", joinedAt: "2026-02-05T12:00:00Z", status: "ACTIVE" },

	// Acme UK Members
	{ id: "mem-8", orgId: "org-uk", userId: "usr-tanaka", role: "OWNER", joinedAt: "2025-11-15T11:00:00Z", status: "ACTIVE" },
	{ id: "mem-9", orgId: "org-uk", userId: "usr-priya", role: "MEMBER", joinedAt: "2026-01-20T14:00:00Z", status: "ACTIVE" },

	// Tech Global US Members
	{ id: "mem-10", orgId: "org-us", userId: "usr-yuki", role: "OWNER", joinedAt: "2026-03-01T14:00:00Z", status: "ACTIVE" },
	{ id: "mem-11", orgId: "org-us", userId: "usr-tanaka", role: "ADMIN", joinedAt: "2026-03-02T15:00:00Z", status: "ACTIVE" },
	{ id: "mem-12", orgId: "org-us", userId: "usr-ken", role: "MEMBER", joinedAt: "2026-03-03T16:00:00Z", status: "ACTIVE" },
];

// Seed Teams
export const SEED_TEAMS: Team[] = [
	{
		id: "team-backend",
		orgId: "org-india",
		name: "Backend Engineering",
		description: "High-performance microservices, Postgres, Kafka and payment gateways.",
		leadId: "usr-priya", // Priya is Team Lead
		memberIds: ["usr-priya", "usr-yuki", "usr-ken"],
		createdAt: "2026-01-15T10:00:00Z",
	},
	{
		id: "team-frontend",
		orgId: "org-india",
		name: "Frontend Core",
		description: "Web application, design system & UI architecture.",
		leadId: "usr-yuki",
		memberIds: ["usr-yuki", "usr-tanaka", "usr-ken"],
		createdAt: "2026-01-16T11:00:00Z",
	},
	{
		id: "team-qa",
		orgId: "org-india",
		name: "QA & Reliability",
		description: "End-to-end automation, regression testing and release readiness.",
		memberIds: ["usr-priya", "usr-ken"],
		createdAt: "2026-01-20T12:00:00Z",
	},
	{
		id: "team-jp-dev",
		orgId: "org-japan",
		name: "Japan Product Team",
		description: "Localization and regional payment integrations.",
		leadId: "usr-yuki",
		memberIds: ["usr-yuki", "usr-ken", "usr-tanaka"],
		createdAt: "2026-02-05T09:00:00Z",
	},
];

// Seed Products
export const SEED_PRODUCTS: Product[] = [
	{
		id: "prod-ecom",
		orgId: "org-india",
		name: "E-Commerce Cloud Platform",
		description: "Next-gen multi-tenant storefront, inventory sync & checkout flow.",
		memberIds: ["usr-tanaka", "usr-yuki", "usr-priya", "usr-ken"],
		createdAt: "2026-01-15T10:00:00Z",
	},
	{
		id: "prod-mobile",
		orgId: "org-india",
		name: "Mobile App Suite",
		description: "iOS and Android apps for retail customers.",
		memberIds: ["usr-yuki", "usr-ken"],
		createdAt: "2026-02-01T10:00:00Z",
	},
	{
		id: "prod-jp-market",
		orgId: "org-japan",
		name: "Tokyo Marketplace",
		description: "Regional marketplace for local retailers.",
		memberIds: ["usr-tanaka", "usr-yuki", "usr-ken"],
		createdAt: "2026-02-05T10:00:00Z",
	},
];

// Seed Projects
export const SEED_PROJECTS: Project[] = [
	{
		id: "proj-auth",
		orgId: "org-india",
		productId: "prod-ecom",
		name: "Authentication & RBAC V2",
		description: "Multi-tenant tenant isolation, OAuth2 and permission matrix.",
		status: "ACTIVE",
		startDate: "2026-01-20",
		targetDate: "2026-03-30",
		memberIds: ["usr-priya", "usr-yuki", "usr-tanaka"],
		createdAt: "2026-01-20T10:00:00Z",
	},
	{
		id: "proj-payment",
		orgId: "org-india",
		productId: "prod-ecom",
		name: "Payment Gateway Integration",
		description: "Stripe, Razorpay, and PayPay checkout APIs with webhooks.",
		status: "ACTIVE",
		startDate: "2026-02-01",
		targetDate: "2026-04-15",
		memberIds: ["usr-priya", "usr-ken"],
		createdAt: "2026-02-01T10:00:00Z",
	},
	{
		id: "proj-dash",
		orgId: "org-india",
		productId: "prod-ecom",
		name: "Real-time Analytics Dashboard",
		description: "Live merchant metrics, revenue streams, and daily workload summary.",
		status: "ACTIVE",
		startDate: "2026-02-10",
		targetDate: "2026-05-01",
		memberIds: ["usr-yuki", "usr-tanaka", "usr-ken"],
		createdAt: "2026-02-10T10:00:00Z",
	},
];

// Seed Tasks
export const SEED_TASKS: Task[] = [
	{
		id: "tsk-101",
		orgId: "org-india",
		projectId: "proj-payment",
		teamId: "team-backend",
		title: "Implement Stripe Webhook Signature Verification",
		description: "Verify cryptographic signatures on incoming webhook payloads to prevent spoofing.",
		status: "IN_PROGRESS",
		priority: "HIGH",
		assigneeId: "usr-priya",
		reporterId: "usr-yuki",
		dueDate: "2026-09-20",
		labels: ["security", "backend", "stripe"],
		comments: [
			{
				id: "cm-1",
				userId: "usr-yuki",
				content: "Please ensure test coverage includes invalid signatures.",
				createdAt: "2026-09-15T10:00:00Z",
			},
		],
		attachments: [],
		createdAt: "2026-09-14T09:00:00Z",
		updatedAt: "2026-09-16T14:30:00Z",
	},
	{
		id: "tsk-102",
		orgId: "org-india",
		projectId: "proj-auth",
		teamId: "team-frontend",
		title: "Build Multi-Tenant Organization Switcher Component",
		description: "Support tenant switching in global app shell without leaking tenant cache.",
		status: "DONE",
		priority: "URGENT",
		assigneeId: "usr-ken",
		reporterId: "usr-tanaka",
		dueDate: "2026-09-16",
		labels: ["frontend", "rbac", "ui"],
		comments: [],
		attachments: [],
		createdAt: "2026-09-12T08:00:00Z",
		updatedAt: "2026-09-16T16:00:00Z",
	},
	{
		id: "tsk-103",
		orgId: "org-india",
		projectId: "proj-auth",
		teamId: "team-backend",
		title: "Enforce Server-Side Tenant Isolation Policies",
		description: "Ensure all database queries enforce WHERE org_id = :activeTenantId.",
		status: "IN_PROGRESS",
		priority: "HIGH",
		assigneeId: "usr-priya",
		reporterId: "usr-tanaka",
		dueDate: "2026-09-22",
		labels: ["backend", "security", "database"],
		comments: [],
		attachments: [],
		createdAt: "2026-09-13T10:00:00Z",
		updatedAt: "2026-09-16T11:00:00Z",
	},
	{
		id: "tsk-104",
		orgId: "org-india",
		projectId: "proj-dash",
		teamId: "team-frontend",
		title: "Design Daily Execution Summary Widget",
		description: "Display aggregated daily updates, blockers, and team velocity metrics.",
		status: "TODO",
		priority: "MEDIUM",
		assigneeId: "usr-ken",
		reporterId: "usr-yuki",
		dueDate: "2026-09-25",
		labels: ["ui", "analytics"],
		comments: [],
		attachments: [],
		createdAt: "2026-09-15T11:00:00Z",
		updatedAt: "2026-09-15T11:00:00Z",
	},
	{
		id: "tsk-105",
		orgId: "org-india",
		projectId: "proj-payment",
		teamId: "team-backend",
		title: "Razorpay INR Currency Settlement Reconciliation",
		description: "Process daily settlement ledger and match with internal ledger.",
		status: "BLOCKED",
		priority: "HIGH",
		assigneeId: "usr-priya",
		reporterId: "usr-tanaka",
		dueDate: "2026-09-18",
		labels: ["payments", "india", "finance"],
		comments: [],
		attachments: [],
		createdAt: "2026-09-14T14:00:00Z",
		updatedAt: "2026-09-16T09:00:00Z",
	},
];

// Seed Daily Updates
export const SEED_DAILY_UPDATES: DailyUpdate[] = [
	{
		id: "upd-1",
		orgId: "org-india",
		userId: "usr-priya",
		date: "2026-09-16",
		yesterday: "Completed webhook signature validation handlers and unit test suite.",
		today: "Investigating Razorpay test environment rate limits & writing settlement tests.",
		blockers: "Waiting on sandbox API keys update from payment gateway provider.",
		status: "PUBLISHED",
		createdAt: "2026-09-16T09:30:00Z",
	},
	{
		id: "upd-2",
		orgId: "org-india",
		userId: "usr-ken",
		date: "2026-09-16",
		yesterday: "Wired up organization selector dropdown in header with Shadcn Popover.",
		today: "Working on Kanban drag-and-drop task status board.",
		blockers: "None",
		status: "PUBLISHED",
		createdAt: "2026-09-16T10:00:00Z",
	},
	{
		id: "upd-3",
		orgId: "org-india",
		userId: "usr-yuki",
		date: "2026-09-16",
		yesterday: "Reviewed PR for RBAC permission guard and audit logging hooks.",
		today: "Team sprint review and QA release candidate preparation.",
		blockers: "None",
		status: "PUBLISHED",
		createdAt: "2026-09-16T08:45:00Z",
	},
];

// Seed Blockers
export const SEED_BLOCKERS: Blocker[] = [
	{
		id: "blk-1",
		orgId: "org-india",
		title: "Razorpay Test Sandbox Rate Limit 429",
		description: "Automated integration test pipeline hitting sandbox rate limit during concurrent runs.",
		taskId: "tsk-105",
		teamId: "team-backend",
		reporterId: "usr-priya",
		assigneeId: "usr-yuki",
		severity: "HIGH",
		status: "OPEN",
		createdAt: "2026-09-16T09:15:00Z",
	},
	{
		id: "blk-2",
		orgId: "org-india",
		title: "Tokyo Data Center VPC Peering Latency Spike",
		description: "Inter-region database replication latency spiked to 450ms.",
		teamId: "team-backend",
		reporterId: "usr-tanaka",
		assigneeId: "usr-priya",
		severity: "CRITICAL",
		status: "INVESTIGATING",
		createdAt: "2026-09-15T16:00:00Z",
	},
];

// Seed Invitations
export const SEED_INVITATIONS: Invitation[] = [
	{
		id: "inv-1",
		orgId: "org-india",
		email: "devops.lead@acme.in",
		role: "MEMBER",
		status: "PENDING",
		invitedBy: "usr-yuki",
		createdAt: "2026-09-14T11:00:00Z",
		expiresAt: "2026-09-21T11:00:00Z",
	},
	{
		id: "inv-2",
		orgId: "org-india",
		email: "qa.specialist@acme.in",
		role: "MEMBER",
		status: "PENDING",
		invitedBy: "usr-tanaka",
		createdAt: "2026-09-15T15:00:00Z",
		expiresAt: "2026-09-22T15:00:00Z",
	},
];

// Seed Audit Logs
export const SEED_AUDIT_LOGS: AuditLog[] = [
	{
		id: "aud-1",
		orgId: "org-india",
		actorId: "usr-tanaka",
		actorName: "Tanaka Hiroshi",
		action: "ROLE_CHANGED",
		resourceType: "MEMBER",
		resourceId: "usr-yuki",
		details: "Changed Yuki Sato role: MEMBER → ADMIN",
		timestamp: "2026-09-14T09:41:00Z",
	},
	{
		id: "aud-2",
		orgId: "org-india",
		actorId: "usr-yuki",
		actorName: "Yuki Sato",
		action: "TEAM_CREATED",
		resourceType: "TEAM",
		resourceId: "team-backend",
		details: "Created 'Backend Engineering' team",
		timestamp: "2026-09-14T09:35:00Z",
	},
	{
		id: "aud-3",
		orgId: "org-india",
		actorId: "usr-yuki",
		actorName: "Yuki Sato",
		action: "TEAM_LEAD_ASSIGNED",
		resourceType: "TEAM",
		resourceId: "team-backend",
		details: "Assigned Priya Sharma as Team Lead for 'Backend Engineering'",
		timestamp: "2026-09-14T09:40:00Z",
	},
	{
		id: "aud-4",
		orgId: "org-india",
		actorId: "usr-tanaka",
		actorName: "Tanaka Hiroshi",
		action: "INVITATION_SENT",
		resourceType: "INVITATION",
		resourceId: "inv-1",
		details: "Invited devops.lead@acme.in with role MEMBER",
		timestamp: "2026-09-14T11:00:00Z",
	},
];

export interface SaaSStoreState {
	// Active Context
	currentUserId: string;
	activeOrgId: string;
	supportAccessReason?: string;
	supportAccessExpiry?: string;

	// Collections
	users: SaaSUser[];
	organizations: Organization[];
	memberships: OrgMembership[];
	teams: Team[];
	products: Product[];
	projects: Project[];
	tasks: Task[];
	dailyUpdates: DailyUpdate[];
	blockers: Blocker[];
	invitations: Invitation[];
	auditLogs: AuditLog[];

	// Actions
	setCurrentUserId: (userId: string) => void;
	setActiveOrgId: (orgId: string) => void;
	startSuperAdminSupportSession: (orgId: string, reason: string) => void;
	endSuperAdminSupportSession: () => void;

	// Organization Actions
	createOrganization: (orgData: Omit<Organization, "id" | "createdAt" | "ownerId">) => Organization;
	updateOrganization: (orgId: string, updates: Partial<Organization>) => void;
	transferOwnership: (orgId: string, newOwnerId: string) => void;
	deleteOrganization: (orgId: string) => void;

	// Membership & Role Actions
	changeMemberRole: (orgId: string, userId: string, newRole: OrgRole) => void;
	removeMember: (orgId: string, userId: string) => void;
	sendInvitation: (orgId: string, email: string, role: "ADMIN" | "MEMBER") => void;
	revokeInvitation: (invitationId: string) => void;
	resendInvitation: (invitationId: string) => void;
	acceptInvitation: (invitationId: string, userId: string) => void;

	// Team Actions
	createTeam: (teamData: Omit<Team, "id" | "createdAt">) => void;
	updateTeam: (teamId: string, updates: Partial<Team>) => void;
	deleteTeam: (teamId: string) => void;
	assignTeamLead: (teamId: string, leadId?: string) => void;

	// Product Actions
	createProduct: (productData: Omit<Product, "id" | "createdAt">) => void;
	updateProduct: (productId: string, updates: Partial<Product>) => void;
	deleteProduct: (productId: string) => void;

	// Project Actions
	createProject: (projectData: Omit<Project, "id" | "createdAt">) => void;
	updateProject: (projectId: string, updates: Partial<Project>) => void;
	deleteProject: (projectId: string) => void;

	// Task Actions
	createTask: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments" | "attachments">) => void;
	updateTask: (taskId: string, updates: Partial<Task>) => void;
	updateTaskStatus: (taskId: string, status: TaskStatus) => void;
	deleteTask: (taskId: string) => void;
	addTaskComment: (taskId: string, content: string) => void;

	// Daily Updates Actions
	saveDailyUpdate: (updateData: Omit<DailyUpdate, "id" | "createdAt">) => void;

	// Blocker Actions
	createBlocker: (blockerData: Omit<Blocker, "id" | "createdAt">) => void;
	resolveBlocker: (blockerId: string, resolution?: string) => void;
	escalateBlocker: (blockerId: string) => void;

	// Upgrade Plan Action
	upgradePlan: (orgId: string, newPlan: PlanTier) => void;

	// Reset Data Helper
	resetToSeedData: () => void;
}

export const useSaaSStore = create<SaaSStoreState>()(
	persist(
		(set, get) => ({
			currentUserId: "usr-tanaka",
			activeOrgId: "org-india",
			supportAccessReason: undefined,
			supportAccessExpiry: undefined,

			users: SEED_USERS,
			organizations: SEED_ORGS,
			memberships: SEED_MEMBERSHIPS,
			teams: SEED_TEAMS,
			products: SEED_PRODUCTS,
			projects: SEED_PROJECTS,
			tasks: SEED_TASKS,
			dailyUpdates: SEED_DAILY_UPDATES,
			blockers: SEED_BLOCKERS,
			invitations: SEED_INVITATIONS,
			auditLogs: SEED_AUDIT_LOGS,

			setCurrentUserId: (userId) => {
				const state = get();
				const user = state.users.find((u) => u.id === userId);
				if (!user) return;

				// If Super Admin, keep current org or allow switching
				if (user.platformRole === "SUPER_ADMIN") {
					set({ currentUserId: userId });
					return;
				}

				// Find user's memberships
				const userMemberships = state.memberships.filter((m) => m.userId === userId && m.status === "ACTIVE");
				const isCurrentOrgValid = userMemberships.some((m) => m.orgId === state.activeOrgId);

				if (!isCurrentOrgValid && userMemberships.length > 0) {
					set({ currentUserId: userId, activeOrgId: userMemberships[0].orgId });
				} else {
					set({ currentUserId: userId });
				}
			},

			setActiveOrgId: (orgId) => {
				set({ activeOrgId: orgId });
			},

			startSuperAdminSupportSession: (orgId, reason) => {
				const state = get();
				const actor = state.users.find((u) => u.id === state.currentUserId);
				const org = state.organizations.find((o) => o.id === orgId);

				const log: AuditLog = {
					id: `aud-${Date.now()}`,
					orgId,
					actorId: state.currentUserId,
					actorName: actor?.name || "Super Admin",
					action: "SUPER_ADMIN_SUPPORT_ACCESS",
					resourceType: "ORGANIZATION",
					resourceId: orgId,
					details: `Super Admin accessed ${org?.name || orgId}. Reason: ${reason}`,
					timestamp: new Date().toISOString(),
				};

				set({
					activeOrgId: orgId,
					supportAccessReason: reason,
					supportAccessExpiry: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
					auditLogs: [log, ...state.auditLogs],
				});
			},

			endSuperAdminSupportSession: () => {
				set({
					supportAccessReason: undefined,
					supportAccessExpiry: undefined,
				});
			},

			createOrganization: (orgData) => {
				const state = get();
				const orgId = `org-${Date.now()}`;
				const newOrg: Organization = {
					...orgData,
					id: orgId,
					ownerId: state.currentUserId,
					createdAt: new Date().toISOString(),
				};

				const newMembership: OrgMembership = {
					id: `mem-${Date.now()}`,
					orgId,
					userId: state.currentUserId,
					role: "OWNER",
					joinedAt: new Date().toISOString(),
					status: "ACTIVE",
				};

				const log: AuditLog = {
					id: `aud-${Date.now()}`,
					orgId,
					actorId: state.currentUserId,
					actorName: state.users.find((u) => u.id === state.currentUserId)?.name || "Owner",
					action: "ORGANIZATION_CREATED",
					resourceType: "ORGANIZATION",
					resourceId: orgId,
					details: `Created organization ${newOrg.name} on plan ${newOrg.plan}`,
					timestamp: new Date().toISOString(),
				};

				set({
					organizations: [...state.organizations, newOrg],
					memberships: [...state.memberships, newMembership],
					activeOrgId: orgId,
					auditLogs: [log, ...state.auditLogs],
				});

				return newOrg;
			},

			updateOrganization: (orgId, updates) => {
				const state = get();
				const log: AuditLog = {
					id: `aud-${Date.now()}`,
					orgId,
					actorId: state.currentUserId,
					actorName: state.users.find((u) => u.id === state.currentUserId)?.name || "User",
					action: "ORGANIZATION_UPDATED",
					resourceType: "ORGANIZATION",
					resourceId: orgId,
					details: `Updated organization settings: ${Object.keys(updates).join(", ")}`,
					timestamp: new Date().toISOString(),
				};

				set({
					organizations: state.organizations.map((o) => (o.id === orgId ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o)),
					auditLogs: [log, ...state.auditLogs],
				});
			},

			transferOwnership: (orgId, newOwnerId) => {
				const state = get();
				const newOwner = state.users.find((u) => u.id === newOwnerId);
				const prevOwnerId = state.organizations.find((o) => o.id === orgId)?.ownerId;

				const log: AuditLog = {
					id: `aud-${Date.now()}`,
					orgId,
					actorId: state.currentUserId,
					actorName: state.users.find((u) => u.id === state.currentUserId)?.name || "Owner",
					action: "OWNERSHIP_TRANSFERRED",
					resourceType: "ORGANIZATION",
					resourceId: orgId,
					details: `Ownership transferred to ${newOwner?.name || newOwnerId}`,
					timestamp: new Date().toISOString(),
				};

				set({
					organizations: state.organizations.map((o) => (o.id === orgId ? { ...o, ownerId: newOwnerId } : o)),
					memberships: state.memberships.map((m) => {
						if (m.orgId === orgId) {
							if (m.userId === newOwnerId) return { ...m, role: "OWNER" };
							if (m.userId === prevOwnerId) return { ...m, role: "ADMIN" };
						}
						return m;
					}),
					auditLogs: [log, ...state.auditLogs],
				});
			},

			deleteOrganization: (orgId) => {
				const state = get();
				const remainingOrgs = state.organizations.filter((o) => o.id !== orgId);
				const nextOrgId = remainingOrgs[0]?.id || "";

				set({
					organizations: remainingOrgs,
					memberships: state.memberships.filter((m) => m.orgId !== orgId),
					teams: state.teams.filter((t) => t.orgId !== orgId),
					products: state.products.filter((p) => p.orgId !== orgId),
					projects: state.projects.filter((p) => p.orgId !== orgId),
					tasks: state.tasks.filter((t) => t.orgId !== orgId),
					dailyUpdates: state.dailyUpdates.filter((d) => d.orgId !== orgId),
					blockers: state.blockers.filter((b) => b.orgId !== orgId),
					invitations: state.invitations.filter((i) => i.orgId !== orgId),
					activeOrgId: nextOrgId,
				});
			},

			changeMemberRole: (orgId, userId, newRole) => {
				const state = get();
				const targetUser = state.users.find((u) => u.id === userId);
				const log: AuditLog = {
					id: `aud-${Date.now()}`,
					orgId,
					actorId: state.currentUserId,
					actorName: state.users.find((u) => u.id === state.currentUserId)?.name || "Owner",
					action: "ROLE_CHANGED",
					resourceType: "MEMBER",
					resourceId: userId,
					details: `Changed role of ${targetUser?.name || userId} to ${newRole}`,
					timestamp: new Date().toISOString(),
				};

				set({
					memberships: state.memberships.map((m) => (m.orgId === orgId && m.userId === userId ? { ...m, role: newRole } : m)),
					auditLogs: [log, ...state.auditLogs],
				});
			},

			removeMember: (orgId, userId) => {
				const state = get();
				const targetUser = state.users.find((u) => u.id === userId);
				const log: AuditLog = {
					id: `aud-${Date.now()}`,
					orgId,
					actorId: state.currentUserId,
					actorName: state.users.find((u) => u.id === state.currentUserId)?.name || "Admin",
					action: "MEMBER_REMOVED",
					resourceType: "MEMBER",
					resourceId: userId,
					details: `Removed ${targetUser?.name || userId} from organization`,
					timestamp: new Date().toISOString(),
				};

				set({
					memberships: state.memberships.filter((m) => !(m.orgId === orgId && m.userId === userId)),
					teams: state.teams.map((t) => (t.orgId === orgId ? { ...t, memberIds: t.memberIds.filter((id) => id !== userId), leadId: t.leadId === userId ? undefined : t.leadId } : t)),
					auditLogs: [log, ...state.auditLogs],
				});
			},

			sendInvitation: (orgId, email, role) => {
				const state = get();
				const newInv: Invitation = {
					id: `inv-${Date.now()}`,
					orgId,
					email,
					role,
					status: "PENDING",
					invitedBy: state.currentUserId,
					createdAt: new Date().toISOString(),
					expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
				};

				const log: AuditLog = {
					id: `aud-${Date.now()}`,
					orgId,
					actorId: state.currentUserId,
					actorName: state.users.find((u) => u.id === state.currentUserId)?.name || "Admin",
					action: "INVITATION_SENT",
					resourceType: "INVITATION",
					resourceId: newInv.id,
					details: `Invited ${email} as ${role}`,
					timestamp: new Date().toISOString(),
				};

				set({
					invitations: [newInv, ...state.invitations],
					auditLogs: [log, ...state.auditLogs],
				});
			},

			revokeInvitation: (invitationId) => {
				const state = get();
				set({
					invitations: state.invitations.map((i) => (i.id === invitationId ? { ...i, status: "REVOKED" } : i)),
				});
			},

			resendInvitation: (invitationId) => {
				const state = get();
				set({
					invitations: state.invitations.map((i) => (i.id === invitationId ? { ...i, status: "PENDING", expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() } : i)),
				});
			},

			acceptInvitation: (invitationId, userId) => {
				const state = get();
				const inv = state.invitations.find((i) => i.id === invitationId);
				if (!inv) return;

				const newMembership: OrgMembership = {
					id: `mem-${Date.now()}`,
					orgId: inv.orgId,
					userId,
					role: inv.role,
					joinedAt: new Date().toISOString(),
					status: "ACTIVE",
				};

				set({
					invitations: state.invitations.map((i) => (i.id === invitationId ? { ...i, status: "ACCEPTED" } : i)),
					memberships: [...state.memberships, newMembership],
				});
			},

			createTeam: (teamData) => {
				const state = get();
				const newTeam: Team = {
					...teamData,
					id: `team-${Date.now()}`,
					createdAt: new Date().toISOString(),
				};

				const log: AuditLog = {
					id: `aud-${Date.now()}`,
					orgId: teamData.orgId,
					actorId: state.currentUserId,
					actorName: state.users.find((u) => u.id === state.currentUserId)?.name || "User",
					action: "TEAM_CREATED",
					resourceType: "TEAM",
					resourceId: newTeam.id,
					details: `Created team '${newTeam.name}'`,
					timestamp: new Date().toISOString(),
				};

				set({
					teams: [...state.teams, newTeam],
					auditLogs: [log, ...state.auditLogs],
				});
			},

			updateTeam: (teamId, updates) => {
				const state = get();
				set({
					teams: state.teams.map((t) => (t.id === teamId ? { ...t, ...updates } : t)),
				});
			},

			deleteTeam: (teamId) => {
				const state = get();
				set({
					teams: state.teams.filter((t) => t.id !== teamId),
				});
			},

			assignTeamLead: (teamId, leadId) => {
				const state = get();
				const team = state.teams.find((t) => t.id === teamId);
				const targetUser = state.users.find((u) => u.id === leadId);

				const log: AuditLog = {
					id: `aud-${Date.now()}`,
					orgId: team?.orgId,
					actorId: state.currentUserId,
					actorName: state.users.find((u) => u.id === state.currentUserId)?.name || "User",
					action: "TEAM_LEAD_ASSIGNED",
					resourceType: "TEAM",
					resourceId: teamId,
					details: leadId ? `Assigned ${targetUser?.name} as Team Lead for '${team?.name}'` : `Cleared Team Lead for '${team?.name}'`,
					timestamp: new Date().toISOString(),
				};

				set({
					teams: state.teams.map((t) => (t.id === teamId ? { ...t, leadId } : t)),
					auditLogs: [log, ...state.auditLogs],
				});
			},

			createProduct: (productData) => {
				const state = get();
				const newProduct: Product = {
					...productData,
					id: `prod-${Date.now()}`,
					createdAt: new Date().toISOString(),
				};

				set({
					products: [...state.products, newProduct],
				});
			},

			updateProduct: (productId, updates) => {
				const state = get();
				set({
					products: state.products.map((p) => (p.id === productId ? { ...p, ...updates } : p)),
				});
			},

			deleteProduct: (productId) => {
				const state = get();
				set({
					products: state.products.filter((p) => p.id !== productId),
					projects: state.projects.filter((pr) => pr.productId !== productId),
				});
			},

			createProject: (projectData) => {
				const state = get();
				const newProject: Project = {
					...projectData,
					id: `proj-${Date.now()}`,
					createdAt: new Date().toISOString(),
				};

				set({
					projects: [...state.projects, newProject],
				});
			},

			updateProject: (projectId, updates) => {
				const state = get();
				set({
					projects: state.projects.map((p) => (p.id === projectId ? { ...p, ...updates } : p)),
				});
			},

			deleteProject: (projectId) => {
				const state = get();
				set({
					projects: state.projects.filter((p) => p.id !== projectId),
					tasks: state.tasks.filter((t) => t.projectId !== projectId),
				});
			},

			createTask: (taskData) => {
				const state = get();
				const newTask: Task = {
					...taskData,
					id: `tsk-${Date.now()}`,
					comments: [],
					attachments: [],
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};

				set({
					tasks: [newTask, ...state.tasks],
				});
			},

			updateTask: (taskId, updates) => {
				const state = get();
				set({
					tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)),
				});
			},

			updateTaskStatus: (taskId, status) => {
				const state = get();
				set({
					tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t)),
				});
			},

			deleteTask: (taskId) => {
				const state = get();
				set({
					tasks: state.tasks.filter((t) => t.id !== taskId),
				});
			},

			addTaskComment: (taskId, content) => {
				const state = get();
				const newComment = {
					id: `cm-${Date.now()}`,
					userId: state.currentUserId,
					content,
					createdAt: new Date().toISOString(),
				};

				set({
					tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, newComment], updatedAt: new Date().toISOString() } : t)),
				});
			},

			saveDailyUpdate: (updateData) => {
				const state = get();
				const existingIndex = state.dailyUpdates.findIndex((d) => d.orgId === updateData.orgId && d.userId === updateData.userId && d.date === updateData.date);

				if (existingIndex >= 0) {
					const updated = [...state.dailyUpdates];
					updated[existingIndex] = {
						...updated[existingIndex],
						...updateData,
						updatedAt: new Date().toISOString(),
					};
					set({ dailyUpdates: updated });
				} else {
					const newUpdate: DailyUpdate = {
						...updateData,
						id: `upd-${Date.now()}`,
						createdAt: new Date().toISOString(),
					};
					set({ dailyUpdates: [newUpdate, ...state.dailyUpdates] });
				}
			},

			createBlocker: (blockerData) => {
				const state = get();
				const newBlocker: Blocker = {
					...blockerData,
					id: `blk-${Date.now()}`,
					createdAt: new Date().toISOString(),
				};

				set({
					blockers: [newBlocker, ...state.blockers],
				});
			},

			resolveBlocker: (blockerId, resolution) => {
				const state = get();
				set({
					blockers: state.blockers.map((b) => (b.id === blockerId ? { ...b, status: "RESOLVED", resolution: resolution || "Resolved", resolvedAt: new Date().toISOString() } : b)),
				});
			},

			escalateBlocker: (blockerId) => {
				const state = get();
				set({
					blockers: state.blockers.map((b) => (b.id === blockerId ? { ...b, severity: "CRITICAL", updatedAt: new Date().toISOString() } : b)),
				});
			},

			upgradePlan: (orgId, newPlan) => {
				const state = get();
				const log: AuditLog = {
					id: `aud-${Date.now()}`,
					orgId,
					actorId: state.currentUserId,
					actorName: state.users.find((u) => u.id === state.currentUserId)?.name || "Owner",
					action: "SUBSCRIPTION_UPGRADED",
					resourceType: "ORGANIZATION",
					resourceId: orgId,
					details: `Upgraded subscription plan to ${newPlan.toUpperCase()}`,
					timestamp: new Date().toISOString(),
				};

				set({
					organizations: state.organizations.map((o) => (o.id === orgId ? { ...o, plan: newPlan, updatedAt: new Date().toISOString() } : o)),
					auditLogs: [log, ...state.auditLogs],
				});
			},

			resetToSeedData: () => {
				set({
					currentUserId: "usr-tanaka",
					activeOrgId: "org-india",
					supportAccessReason: undefined,
					supportAccessExpiry: undefined,
					users: SEED_USERS,
					organizations: SEED_ORGS,
					memberships: SEED_MEMBERSHIPS,
					teams: SEED_TEAMS,
					products: SEED_PRODUCTS,
					projects: SEED_PROJECTS,
					tasks: SEED_TASKS,
					dailyUpdates: SEED_DAILY_UPDATES,
					blockers: SEED_BLOCKERS,
					invitations: SEED_INVITATIONS,
					auditLogs: SEED_AUDIT_LOGS,
				});
			},
		}),
		{
			name: "slash_saas_multi_tenant_store_v1",
			storage: createJSONStorage(() => localStorage),
		}
	)
);
