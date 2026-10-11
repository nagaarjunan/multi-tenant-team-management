import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
	ActiveTimer,
	AuditLog,
	Blocker,
	BlockerSeverity,
	ChatMessage,
	DailyUpdate,
	Invitation,
	NotificationItem,
	OrgMembership,
	OrgRole,
	Organization,
	PlanTier,
	Product,
	Project,
	ProjectFile,
	SaaSUser,
	Task,
	TaskPriority,
	TaskStatus,
	Team,
	TimeEntry,
	WorkspaceType,
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
		email: "alex.platform@nexusworkos.com",
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
	{
		id: "mem-1",
		orgId: "org-india",
		userId: "usr-tanaka",
		role: "OWNER",
		joinedAt: "2026-01-10T08:00:00Z",
		status: "ACTIVE",
	},
	{
		id: "mem-2",
		orgId: "org-india",
		userId: "usr-yuki",
		role: "ADMIN",
		joinedAt: "2026-01-12T09:00:00Z",
		status: "ACTIVE",
	},
	{
		id: "mem-3",
		orgId: "org-india",
		userId: "usr-priya",
		role: "MEMBER",
		joinedAt: "2026-01-15T10:00:00Z",
		status: "ACTIVE",
	},
	{
		id: "mem-4",
		orgId: "org-india",
		userId: "usr-ken",
		role: "MEMBER",
		joinedAt: "2026-02-01T11:00:00Z",
		status: "ACTIVE",
	},

	{
		id: "mem-5",
		orgId: "org-japan",
		userId: "usr-tanaka",
		role: "OWNER",
		joinedAt: "2026-02-01T09:30:00Z",
		status: "ACTIVE",
	},
	{
		id: "mem-6",
		orgId: "org-japan",
		userId: "usr-yuki",
		role: "ADMIN",
		joinedAt: "2026-02-02T10:00:00Z",
		status: "ACTIVE",
	},
	{
		id: "mem-7",
		orgId: "org-japan",
		userId: "usr-ken",
		role: "MEMBER",
		joinedAt: "2026-02-05T12:00:00Z",
		status: "ACTIVE",
	},

	{
		id: "mem-8",
		orgId: "org-uk",
		userId: "usr-tanaka",
		role: "OWNER",
		joinedAt: "2025-11-15T11:00:00Z",
		status: "ACTIVE",
	},
	{
		id: "mem-9",
		orgId: "org-uk",
		userId: "usr-priya",
		role: "MEMBER",
		joinedAt: "2026-01-20T14:00:00Z",
		status: "ACTIVE",
	},

	{
		id: "mem-10",
		orgId: "org-us",
		userId: "usr-yuki",
		role: "OWNER",
		joinedAt: "2026-03-01T14:00:00Z",
		status: "ACTIVE",
	},
	{
		id: "mem-11",
		orgId: "org-us",
		userId: "usr-tanaka",
		role: "ADMIN",
		joinedAt: "2026-03-02T15:00:00Z",
		status: "ACTIVE",
	},
	{
		id: "mem-12",
		orgId: "org-us",
		userId: "usr-ken",
		role: "MEMBER",
		joinedAt: "2026-03-03T16:00:00Z",
		status: "ACTIVE",
	},
];

// Seed Teams
export const SEED_TEAMS: Team[] = [
	{
		id: "team-backend",
		orgId: "org-india",
		name: "Backend Engineering",
		description: "High-performance microservices, Postgres, Kafka and payment gateways.",
		leadId: "usr-priya",
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
];

// Seed Projects (Both Personal & Organization)
export const SEED_PROJECTS: Project[] = [
	// Personal Projects
	{
		id: "proj-personal-tanaka",
		workspaceType: "personal",
		name: "Architecture & Learning Notes",
		description: "Personal exploration, distributed database design notes, and reading targets.",
		status: "ACTIVE",
		startDate: "2026-09-01",
		targetDate: "2026-12-31",
		dueDate: "2026-12-31",
		memberIds: ["usr-tanaka"],
		createdAt: "2026-09-01T08:00:00Z",
	},
	{
		id: "proj-personal-yuki",
		workspaceType: "personal",
		name: "Quarterly Goal Planning",
		description: "Personal sprint preparation, OKR draft, and professional development.",
		status: "ACTIVE",
		startDate: "2026-09-01",
		targetDate: "2026-11-30",
		dueDate: "2026-11-30",
		memberIds: ["usr-yuki"],
		createdAt: "2026-09-01T09:00:00Z",
	},

	// Organization Projects
	{
		id: "proj-auth",
		workspaceType: "organization",
		orgId: "org-india",
		productId: "prod-ecom",
		name: "Authentication & RBAC V2",
		description: "Multi-tenant tenant isolation, OAuth2 and permission matrix.",
		status: "ACTIVE",
		leadId: "usr-priya", // Priya is Project Lead
		startDate: "2026-01-20",
		targetDate: "2026-03-30",
		dueDate: "2026-03-30",
		memberIds: ["usr-priya", "usr-yuki", "usr-tanaka"],
		createdAt: "2026-01-20T10:00:00Z",
	},
	{
		id: "proj-payment",
		workspaceType: "organization",
		orgId: "org-india",
		productId: "prod-ecom",
		name: "Payment Gateway Integration",
		description: "Stripe, Razorpay, and PayPay checkout APIs with webhooks.",
		status: "ACTIVE",
		leadId: "usr-priya",
		startDate: "2026-02-01",
		targetDate: "2026-04-15",
		dueDate: "2026-04-15",
		memberIds: ["usr-priya", "usr-ken"],
		createdAt: "2026-02-01T10:00:00Z",
	},
	{
		id: "proj-dash",
		workspaceType: "organization",
		orgId: "org-india",
		productId: "prod-ecom",
		name: "Real-time Analytics Dashboard",
		description: "Live merchant metrics, revenue streams, and daily workload summary.",
		status: "ACTIVE",
		leadId: "usr-yuki",
		startDate: "2026-02-10",
		targetDate: "2026-05-01",
		dueDate: "2026-05-01",
		memberIds: ["usr-yuki", "usr-tanaka", "usr-ken"],
		createdAt: "2026-02-10T10:00:00Z",
	},
];

// Seed Tasks
export const SEED_TASKS: Task[] = [
	// Personal Tasks
	{
		id: "tsk-p1",
		workspaceType: "personal",
		projectId: "proj-personal-tanaka",
		title: "Review Raft Consensus Whitepaper",
		description: "Study leader election algorithms and log replication guarantees for upcoming system upgrade.",
		status: "IN_PROGRESS",
		priority: "HIGH",
		assigneeId: "usr-tanaka",
		reporterId: "usr-tanaka",
		startDate: "2026-09-18",
		dueDate: "2026-09-24",
		labels: ["research", "systems"],
		trackedSeconds: 3600,
		comments: [],
		attachments: [],
		createdAt: "2026-09-18T09:00:00Z",
		updatedAt: "2026-09-18T09:00:00Z",
	},
	{
		id: "tsk-p2",
		workspaceType: "personal",
		projectId: "proj-personal-tanaka",
		title: "Draft Phase 2 Roadmap & Milestones",
		description: "Outline timeline for external webhook subscriptions and enterprise SSO.",
		status: "TODO",
		priority: "MEDIUM",
		assigneeId: "usr-tanaka",
		reporterId: "usr-tanaka",
		startDate: "2026-09-20",
		dueDate: "2026-09-28",
		labels: ["planning"],
		comments: [],
		attachments: [],
		createdAt: "2026-09-18T10:00:00Z",
		updatedAt: "2026-09-18T10:00:00Z",
	},

	// Org Tasks
	{
		id: "tsk-101",
		workspaceType: "organization",
		orgId: "org-india",
		projectId: "proj-payment",
		teamId: "team-backend",
		title: "Implement Stripe Webhook Signature Verification",
		description: "Verify cryptographic signatures on incoming webhook payloads to prevent spoofing.",
		status: "IN_PROGRESS",
		priority: "HIGH",
		assigneeId: "usr-priya",
		reporterId: "usr-yuki",
		startDate: "2026-09-14",
		dueDate: "2026-09-20",
		labels: ["security", "backend", "stripe"],
		trackedSeconds: 5400,
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
		workspaceType: "organization",
		orgId: "org-india",
		projectId: "proj-auth",
		teamId: "team-frontend",
		title: "Build Multi-Tenant Organization Switcher Component",
		description: "Support tenant switching in global app shell without leaking tenant cache.",
		status: "DONE",
		priority: "URGENT",
		assigneeId: "usr-ken",
		reporterId: "usr-tanaka",
		startDate: "2026-09-12",
		dueDate: "2026-09-16",
		labels: ["frontend", "rbac", "ui"],
		trackedSeconds: 7200,
		comments: [],
		attachments: [],
		createdAt: "2026-09-12T08:00:00Z",
		updatedAt: "2026-09-16T16:00:00Z",
	},
	{
		id: "tsk-103",
		workspaceType: "organization",
		orgId: "org-india",
		projectId: "proj-auth",
		teamId: "team-backend",
		title: "Enforce Server-Side Tenant Isolation Policies",
		description: "Ensure all database queries enforce WHERE org_id = :activeTenantId.",
		status: "IN_PROGRESS",
		priority: "HIGH",
		assigneeId: "usr-priya",
		reporterId: "usr-tanaka",
		startDate: "2026-09-13",
		dueDate: "2026-09-22",
		labels: ["backend", "security", "database"],
		trackedSeconds: 3600,
		comments: [],
		attachments: [],
		createdAt: "2026-09-13T10:00:00Z",
		updatedAt: "2026-09-16T11:00:00Z",
	},
	{
		id: "tsk-104",
		workspaceType: "organization",
		orgId: "org-india",
		projectId: "proj-dash",
		teamId: "team-frontend",
		title: "Design Daily Execution Summary Widget",
		description: "Display aggregated daily updates, blockers, and team velocity metrics.",
		status: "TODO",
		priority: "MEDIUM",
		assigneeId: "usr-ken",
		reporterId: "usr-yuki",
		startDate: "2026-09-15",
		dueDate: "2026-09-25",
		labels: ["ui", "analytics"],
		comments: [],
		attachments: [],
		createdAt: "2026-09-15T11:00:00Z",
		updatedAt: "2026-09-15T11:00:00Z",
	},
	{
		id: "tsk-105",
		workspaceType: "organization",
		orgId: "org-india",
		projectId: "proj-payment",
		teamId: "team-backend",
		title: "Razorpay INR Currency Settlement Reconciliation",
		description: "Process daily settlement ledger and match with internal ledger.",
		status: "BLOCKED",
		priority: "HIGH",
		assigneeId: "usr-priya",
		reporterId: "usr-tanaka",
		startDate: "2026-09-14",
		dueDate: "2026-09-18",
		labels: ["payments", "india", "finance"],
		trackedSeconds: 2400,
		comments: [],
		attachments: [],
		blockerId: "blk-1",
		createdAt: "2026-09-14T14:00:00Z",
		updatedAt: "2026-09-16T09:00:00Z",
	},
];

// Seed Daily Updates (Yesterday, Today, Blockers, Progress)
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
];

// Seed Project Files
export const SEED_PROJECT_FILES: ProjectFile[] = [
	{
		id: "file-1",
		projectId: "proj-auth",
		name: "Architecture_RBAC_V2_Spec.pdf",
		size: "2.4 MB",
		type: "pdf",
		url: "https://example.com/spec.pdf",
		uploadedBy: "usr-priya",
		uploadedAt: "2026-09-10T11:00:00Z",
	},
	{
		id: "file-2",
		projectId: "proj-auth",
		name: "Tenant_Isolation_DataFlow.png",
		size: "1.1 MB",
		type: "image",
		url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
		uploadedBy: "usr-tanaka",
		uploadedAt: "2026-09-12T14:30:00Z",
	},
	{
		id: "file-3",
		projectId: "proj-payment",
		name: "Stripe_Webhook_Payload_Schemas.json",
		size: "45 KB",
		type: "code",
		url: "https://example.com/schemas.json",
		uploadedBy: "usr-priya",
		uploadedAt: "2026-09-14T09:15:00Z",
	},
	{
		id: "file-4",
		projectId: "proj-dash",
		name: "Q3_Analytics_KPI_Matrix.xlsx",
		size: "820 KB",
		type: "spreadsheet",
		url: "https://example.com/matrix.xlsx",
		uploadedBy: "usr-yuki",
		uploadedAt: "2026-09-15T15:00:00Z",
	},
];

// Seed Chat Messages
export const SEED_CHAT_MESSAGES: ChatMessage[] = [
	{
		id: "msg-1",
		projectId: "proj-auth",
		userId: "usr-priya",
		content:
			"Good morning team! The RBAC permission matrix PR is up for review. Please check the tenant filter clauses.",
		createdAt: "2026-09-16T08:30:00Z",
		reactions: { "👍": ["usr-tanaka", "usr-yuki"] },
	},
	{
		id: "msg-2",
		projectId: "proj-auth",
		userId: "usr-tanaka",
		content: "Looks solid. Make sure we also test cache invalidation when changing org roles.",
		createdAt: "2026-09-16T08:45:00Z",
		replyToId: "msg-1",
	},
	{
		id: "msg-3",
		projectId: "proj-auth",
		userId: "usr-yuki",
		content: "We should create an automated audit test for cross-tenant leakage before staging deploy.",
		createdAt: "2026-09-16T09:10:00Z",
		reactions: { "🚀": ["usr-priya"] },
	},
	{
		id: "msg-4",
		projectId: "proj-payment",
		userId: "usr-priya",
		content: "Razorpay sandbox webhook endpoint is timing out intermittently. Reporting blocker blk-1.",
		createdAt: "2026-09-16T09:12:00Z",
	},
];

// Seed Notifications
export const SEED_NOTIFICATIONS: NotificationItem[] = [
	{
		id: "notif-1",
		userId: "usr-tanaka",
		type: "assignment",
		title: "New Task Assigned",
		message: "You have been assigned to 'Draft Phase 2 Roadmap & Milestones'",
		read: false,
		createdAt: "2026-09-18T10:00:00Z",
	},
	{
		id: "notif-2",
		userId: "usr-tanaka",
		type: "blocker",
		title: "Blocker Alert",
		message: "Priya reported high severity blocker: 'Razorpay Test Sandbox Rate Limit 429'",
		read: false,
		createdAt: "2026-09-16T09:15:00Z",
	},
	{
		id: "notif-3",
		userId: "usr-tanaka",
		type: "mention",
		title: "Mentioned in Project Chat",
		message: "Yuki mentioned you in 'Authentication & RBAC V2' chat",
		read: true,
		createdAt: "2026-09-16T08:45:00Z",
	},
];

// Seed Audit Logs
export const SEED_AUDIT_LOGS: AuditLog[] = [
	{
		id: "aud-1",
		orgId: "org-india",
		actorId: "usr-tanaka",
		actorName: "Tanaka Hiroshi",
		action: "ORGANIZATION_INITIALIZED",
		resourceType: "ORGANIZATION",
		resourceId: "org-india",
		details: "Created Acme India tenant workspace",
		timestamp: "2026-01-10T08:00:00Z",
	},
	{
		id: "aud-2",
		orgId: "org-india",
		actorId: "usr-tanaka",
		actorName: "Tanaka Hiroshi",
		action: "ADMIN_ACCESS_GRANTED",
		resourceType: "MEMBERSHIP",
		resourceId: "mem-2",
		details: "Granted ADMIN role to Yuki Sato",
		timestamp: "2026-01-12T09:00:00Z",
	},
	{
		id: "aud-3",
		orgId: "org-india",
		actorId: "usr-tanaka",
		actorName: "Tanaka Hiroshi",
		action: "PROJECT_CREATED",
		resourceType: "PROJECT",
		resourceId: "proj-auth",
		details: "Created project Authentication & RBAC V2",
		timestamp: "2026-01-20T10:00:00Z",
	},
];

export interface SaaSStoreState {
	// Active Context
	currentUserId: string;
	activeOrgId: string;
	activeWorkspace: {
		type: WorkspaceType;
		orgId?: string;
	};
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
	projectFiles: ProjectFile[];
	chatMessages: ChatMessage[];
	notifications: NotificationItem[];
	activeTimer: ActiveTimer | null;

	// Context Actions
	setCurrentUserId: (userId: string) => void;
	setActiveOrgId: (orgId: string) => void;
	switchWorkspace: (type: WorkspaceType, orgId?: string) => void;
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
	createProject: (projectData: Omit<Project, "id" | "createdAt">) => Project;
	updateProject: (projectId: string, updates: Partial<Project>) => void;
	deleteProject: (projectId: string) => void;
	setProjectLead: (projectId: string, leadId?: string) => void;
	addProjectMember: (projectId: string, userId: string) => void;
	removeProjectMember: (projectId: string, userId: string) => void;

	// Task Actions
	createTask: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "comments" | "attachments">) => Task;
	updateTask: (taskId: string, updates: Partial<Task>) => void;
	updateTaskStatus: (taskId: string, status: TaskStatus) => void;
	deleteTask: (taskId: string) => void;
	addTaskComment: (taskId: string, content: string) => void;

	// Time Tracking Actions
	startTimer: (taskId: string) => void;
	pauseTimer: () => void;
	resumeTimer: () => void;
	stopTimer: (note?: string) => void;
	tickTimer: () => void;

	// Chat Actions
	sendChatMessage: (projectId: string, content: string, replyToId?: string, attachments?: string[]) => void;
	deleteChatMessage: (messageId: string) => void;
	convertChatMessageToTask: (
		messageId: string,
		taskTitle: string,
		assigneeId?: string,
		priority?: TaskPriority,
		dueDate?: string,
	) => Task;
	toggleChatReaction: (messageId: string, emoji: string) => void;

	// File Actions
	uploadProjectFile: (fileData: Omit<ProjectFile, "id" | "uploadedAt">) => void;
	deleteProjectFile: (fileId: string) => void;

	// Daily Updates Actions
	saveDailyUpdate: (updateData: Omit<DailyUpdate, "id" | "createdAt">) => void;

	// Blocker Actions
	createBlocker: (blockerData: Omit<Blocker, "id" | "createdAt">) => Blocker;
	reportTaskBlocker: (taskId: string, title: string, description: string, severity: BlockerSeverity) => Blocker;
	resolveBlocker: (blockerId: string, resolution?: string) => void;
	escalateBlocker: (blockerId: string) => void;

	// Notification Actions
	markNotificationRead: (notificationId: string) => void;
	markAllNotificationsRead: () => void;

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
			activeWorkspace: {
				type: "personal", // Default to Personal Workspace per PRD!
			},
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
			projectFiles: SEED_PROJECT_FILES,
			chatMessages: SEED_CHAT_MESSAGES,
			notifications: SEED_NOTIFICATIONS,
			activeTimer: null,

			setCurrentUserId: (userId) => {
				const state = get();
				const user = state.users.find((u) => u.id === userId);
				if (!user) return;

				if (user.platformRole === "SUPER_ADMIN") {
					set({ currentUserId: userId });
					return;
				}

				const userMemberships = state.memberships.filter((m) => m.userId === userId && m.status === "ACTIVE");
				const isCurrentOrgValid = userMemberships.some((m) => m.orgId === state.activeOrgId);

				if (!isCurrentOrgValid && userMemberships.length > 0) {
					set({ currentUserId: userId, activeOrgId: userMemberships[0].orgId });
				} else {
					set({ currentUserId: userId });
				}
			},

			setActiveOrgId: (orgId) => {
				set({
					activeOrgId: orgId,
					activeWorkspace: { type: "organization", orgId },
				});
			},

			switchWorkspace: (type, orgId) => {
				if (type === "personal") {
					set({ activeWorkspace: { type: "personal" } });
				} else if (orgId) {
					set({
						activeOrgId: orgId,
						activeWorkspace: { type: "organization", orgId },
					});
				}
			},

			startSuperAdminSupportSession: (orgId, reason) => {
				const state = get();
				const actor = state.users.find((u) => u.id === state.currentUserId);

				const log: AuditLog = {
					id: `aud-${Date.now()}`,
					orgId,
					actorId: state.currentUserId,
					actorName: actor?.name || "Super Admin",
					action: "SUPER_ADMIN_SUPPORT_ACCESS",
					resourceType: "ORGANIZATION",
					resourceId: orgId,
					details: `Support override initiated. Reason: "${reason}". Access expires in 4 hours.`,
					timestamp: new Date().toISOString(),
				};

				set({
					activeOrgId: orgId,
					activeWorkspace: { type: "organization", orgId },
					supportAccessReason: reason,
					supportAccessExpiry: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
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
				const newOrgId = `org-${Date.now()}`;
				const newOrg: Organization = {
					...orgData,
					id: newOrgId,
					ownerId: state.currentUserId,
					createdAt: new Date().toISOString(),
				};

				const ownerMembership: OrgMembership = {
					id: `mem-${Date.now()}`,
					orgId: newOrgId,
					userId: state.currentUserId,
					role: "OWNER",
					joinedAt: new Date().toISOString(),
					status: "ACTIVE",
				};

				const log: AuditLog = {
					id: `aud-${Date.now()}`,
					orgId: newOrgId,
					actorId: state.currentUserId,
					actorName: state.users.find((u) => u.id === state.currentUserId)?.name || "User",
					action: "ORGANIZATION_CREATED",
					resourceType: "ORGANIZATION",
					resourceId: newOrgId,
					details: `Created new organization workspace ${orgData.name}`,
					timestamp: new Date().toISOString(),
				};

				set({
					organizations: [...state.organizations, newOrg],
					memberships: [...state.memberships, ownerMembership],
					activeOrgId: newOrgId,
					activeWorkspace: { type: "organization", orgId: newOrgId },
					auditLogs: [log, ...state.auditLogs],
				});

				return newOrg;
			},

			updateOrganization: (orgId, updates) => {
				const state = get();
				set({
					organizations: state.organizations.map((o) =>
						o.id === orgId ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o,
					),
				});
			},

			transferOwnership: (orgId, newOwnerId) => {
				const state = get();
				const currentOwnerId = state.organizations.find((o) => o.id === orgId)?.ownerId;
				if (!currentOwnerId) return;

				const updatedMemberships = state.memberships.map((m) => {
					if (m.orgId === orgId && m.userId === currentOwnerId) return { ...m, role: "ADMIN" as OrgRole };
					if (m.orgId === orgId && m.userId === newOwnerId) return { ...m, role: "OWNER" as OrgRole };
					return m;
				});

				const updatedOrgs = state.organizations.map((o) =>
					o.id === orgId ? { ...o, ownerId: newOwnerId, updatedAt: new Date().toISOString() } : o,
				);

				set({
					organizations: updatedOrgs,
					memberships: updatedMemberships,
				});
			},

			deleteOrganization: (orgId) => {
				const state = get();
				set({
					organizations: state.organizations.filter((o) => o.id !== orgId),
					memberships: state.memberships.filter((m) => m.orgId !== orgId),
					teams: state.teams.filter((t) => t.orgId !== orgId),
					products: state.products.filter((p) => p.orgId !== orgId),
					projects: state.projects.filter((pr) => pr.orgId !== orgId),
					tasks: state.tasks.filter((tk) => tk.orgId !== orgId),
					dailyUpdates: state.dailyUpdates.filter((d) => d.orgId !== orgId),
					blockers: state.blockers.filter((b) => b.orgId !== orgId),
					activeOrgId: state.organizations.find((o) => o.id !== orgId)?.id || "",
					activeWorkspace: { type: "personal" },
				});
			},

			changeMemberRole: (orgId, userId, newRole) => {
				const state = get();
				set({
					memberships: state.memberships.map((m) =>
						m.orgId === orgId && m.userId === userId ? { ...m, role: newRole } : m,
					),
				});
			},

			removeMember: (orgId, userId) => {
				const state = get();
				set({
					memberships: state.memberships.filter((m) => !(m.orgId === orgId && m.userId === userId)),
					teams: state.teams.map((t) =>
						t.orgId === orgId ? { ...t, memberIds: t.memberIds.filter((id) => id !== userId) } : t,
					),
					projects: state.projects.map((p) =>
						p.orgId === orgId ? { ...p, memberIds: p.memberIds.filter((id) => id !== userId) } : p,
					),
				});
			},

			sendInvitation: (orgId, email, role) => {
				const state = get();
				const newInvitation: Invitation = {
					id: `inv-${Date.now()}`,
					orgId,
					email,
					role,
					status: "PENDING",
					invitedBy: state.currentUserId,
					createdAt: new Date().toISOString(),
					expiresAt: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
				};

				set({
					invitations: [...state.invitations, newInvitation],
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
					invitations: state.invitations.map((i) =>
						i.id === invitationId
							? {
									...i,
									status: "PENDING",
									expiresAt: new Date(Date.now() + 7 * 86400 * 1000).toISOString(),
								}
							: i,
					),
				});
			},

			acceptInvitation: (invitationId, userId) => {
				const state = get();
				const inv = state.invitations.find((i) => i.id === invitationId);
				if (!inv || inv.status !== "PENDING") return;

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

				set({
					teams: [...state.teams, newTeam],
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
				set({
					teams: state.teams.map((t) => (t.id === teamId ? { ...t, leadId } : t)),
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

				const log: AuditLog = {
					id: `aud-${Date.now()}`,
					orgId: projectData.orgId,
					actorId: state.currentUserId,
					actorName: state.users.find((u) => u.id === state.currentUserId)?.name || "User",
					action: "PROJECT_CREATED",
					resourceType: "PROJECT",
					resourceId: newProject.id,
					details: `Created project ${newProject.name}`,
					timestamp: new Date().toISOString(),
				};

				set({
					projects: [...state.projects, newProject],
					auditLogs: [log, ...state.auditLogs],
				});

				return newProject;
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
					chatMessages: state.chatMessages.filter((m) => m.projectId !== projectId),
					projectFiles: state.projectFiles.filter((f) => f.projectId !== projectId),
				});
			},

			setProjectLead: (projectId, leadId) => {
				const state = get();
				set({
					projects: state.projects.map((p) => (p.id === projectId ? { ...p, leadId } : p)),
				});
			},

			addProjectMember: (projectId, userId) => {
				const state = get();
				set({
					projects: state.projects.map((p) =>
						p.id === projectId && !p.memberIds.includes(userId) ? { ...p, memberIds: [...p.memberIds, userId] } : p,
					),
				});
			},

			removeProjectMember: (projectId, userId) => {
				const state = get();
				set({
					projects: state.projects.map((p) =>
						p.id === projectId
							? {
									...p,
									memberIds: p.memberIds.filter((id) => id !== userId),
									leadId: p.leadId === userId ? undefined : p.leadId,
								}
							: p,
					),
				});
			},

			createTask: (taskData) => {
				const state = get();

				// Enforce Core Principle: "No Project -> No Task"
				const project = state.projects.find((p) => p.id === taskData.projectId);
				if (!project) {
					throw new Error("Cannot create task without an existing project. (No Project -> No Task)");
				}

				const newTask: Task = {
					...taskData,
					workspaceType: project.workspaceType,
					orgId: project.orgId,
					id: `tsk-${Date.now()}`,
					comments: [],
					attachments: [],
					trackedSeconds: 0,
					timeEntries: [],
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};

				const log: AuditLog = {
					id: `aud-${Date.now()}`,
					orgId: newTask.orgId,
					actorId: state.currentUserId,
					actorName: state.users.find((u) => u.id === state.currentUserId)?.name || "User",
					action: "TASK_CREATED",
					resourceType: "TASK",
					resourceId: newTask.id,
					details: `Created task "${newTask.title}" in project "${project.name}"`,
					timestamp: new Date().toISOString(),
				};

				// Create notification if assigned
				let newNotifications = state.notifications;
				if (newTask.assigneeId && newTask.assigneeId !== state.currentUserId) {
					const notif: NotificationItem = {
						id: `notif-${Date.now()}`,
						userId: newTask.assigneeId,
						type: "assignment",
						title: "New Task Assigned",
						message: `You were assigned to "${newTask.title}" in ${project.name}`,
						read: false,
						createdAt: new Date().toISOString(),
					};
					newNotifications = [notif, ...state.notifications];
				}

				set({
					tasks: [newTask, ...state.tasks],
					auditLogs: [log, ...state.auditLogs],
					notifications: newNotifications,
				});

				return newTask;
			},

			updateTask: (taskId, updates) => {
				const state = get();
				set({
					tasks: state.tasks.map((t) =>
						t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t,
					),
				});
			},

			updateTaskStatus: (taskId, status) => {
				const state = get();
				const task = state.tasks.find((t) => t.id === taskId);
				if (!task) return;

				const log: AuditLog = {
					id: `aud-${Date.now()}`,
					orgId: task.orgId,
					actorId: state.currentUserId,
					actorName: state.users.find((u) => u.id === state.currentUserId)?.name || "User",
					action: "TASK_STATUS_CHANGED",
					resourceType: "TASK",
					resourceId: taskId,
					details: `Status changed from ${task.status} to ${status}`,
					timestamp: new Date().toISOString(),
				};

				set({
					tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t)),
					auditLogs: [log, ...state.auditLogs],
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
					tasks: state.tasks.map((t) =>
						t.id === taskId ? { ...t, comments: [...t.comments, newComment], updatedAt: new Date().toISOString() } : t,
					),
				});
			},

			// Time Tracking Engine
			startTimer: (taskId) => {
				const state = get();
				const task = state.tasks.find((t) => t.id === taskId);
				if (!task) return;

				// If timer already running for another task, stop it first
				if (state.activeTimer && state.activeTimer.taskId !== taskId) {
					state.stopTimer("Auto-saved when switching tasks");
				}

				set({
					activeTimer: {
						taskId,
						taskTitle: task.title,
						projectId: task.projectId,
						startedAt: Date.now(),
						elapsedSeconds: 0,
						isRunning: true,
					},
				});
			},

			pauseTimer: () => {
				const state = get();
				if (!state.activeTimer) return;
				set({
					activeTimer: {
						...state.activeTimer,
						isRunning: false,
					},
				});
			},

			resumeTimer: () => {
				const state = get();
				if (!state.activeTimer) return;
				set({
					activeTimer: {
						...state.activeTimer,
						isRunning: true,
						startedAt: Date.now(),
					},
				});
			},

			stopTimer: (note) => {
				const state = get();
				if (!state.activeTimer) return;

				const { taskId, projectId, elapsedSeconds } = state.activeTimer;
				const durationToAdd = Math.max(elapsedSeconds, 1);

				const timeEntry: TimeEntry = {
					id: `te-${Date.now()}`,
					taskId,
					projectId,
					userId: state.currentUserId,
					seconds: durationToAdd,
					date: new Date().toISOString().split("T")[0],
					note: note || "Tracked work session",
					createdAt: new Date().toISOString(),
				};

				set({
					activeTimer: null,
					tasks: state.tasks.map((t) =>
						t.id === taskId
							? {
									...t,
									trackedSeconds: (t.trackedSeconds || 0) + durationToAdd,
									timeEntries: [...(t.timeEntries || []), timeEntry],
								}
							: t,
					),
				});
			},

			tickTimer: () => {
				const state = get();
				if (!state.activeTimer || !state.activeTimer.isRunning) return;
				set({
					activeTimer: {
						...state.activeTimer,
						elapsedSeconds: state.activeTimer.elapsedSeconds + 1,
					},
				});
			},

			// Project Chat
			sendChatMessage: (projectId, content, replyToId, attachments) => {
				const state = get();
				const newMsg: ChatMessage = {
					id: `msg-${Date.now()}`,
					projectId,
					userId: state.currentUserId,
					content,
					createdAt: new Date().toISOString(),
					replyToId,
					attachments,
				};

				set({
					chatMessages: [...state.chatMessages, newMsg],
				});
			},

			deleteChatMessage: (messageId) => {
				const state = get();
				set({
					chatMessages: state.chatMessages.filter((m) => m.id !== messageId),
				});
			},

			convertChatMessageToTask: (messageId, taskTitle, assigneeId, priority = "MEDIUM", dueDate) => {
				const state = get();
				const msg = state.chatMessages.find((m) => m.id === messageId);
				if (!msg) throw new Error("Chat message not found");

				const project = state.projects.find((p) => p.id === msg.projectId);
				if (!project) throw new Error("Parent project not found");

				const newTask = state.createTask({
					projectId: msg.projectId,
					workspaceType: project.workspaceType,
					orgId: project.orgId,
					title: taskTitle.trim() || msg.content.slice(0, 60),
					description: `Converted from project chat message:\n"${msg.content}"`,
					status: "TODO",
					priority,
					assigneeId: assigneeId || state.currentUserId,
					reporterId: state.currentUserId,
					dueDate: dueDate || new Date(Date.now() + 7 * 86400 * 1000).toISOString().split("T")[0],
					labels: ["from-chat"],
				});

				set({
					chatMessages: state.chatMessages.map((m) =>
						m.id === messageId ? { ...m, isConvertedToTask: true, convertedTaskId: newTask.id } : m,
					),
				});

				return newTask;
			},

			toggleChatReaction: (messageId, emoji) => {
				const state = get();
				const msg = state.chatMessages.find((m) => m.id === messageId);
				if (!msg) return;

				const currentReactions = { ...(msg.reactions || {}) };
				const usersForEmoji = currentReactions[emoji] || [];

				if (usersForEmoji.includes(state.currentUserId)) {
					currentReactions[emoji] = usersForEmoji.filter((id) => id !== state.currentUserId);
					if (currentReactions[emoji].length === 0) delete currentReactions[emoji];
				} else {
					currentReactions[emoji] = [...usersForEmoji, state.currentUserId];
				}

				set({
					chatMessages: state.chatMessages.map((m) => (m.id === messageId ? { ...m, reactions: currentReactions } : m)),
				});
			},

			// Project Files
			uploadProjectFile: (fileData) => {
				const state = get();
				const newFile: ProjectFile = {
					...fileData,
					id: `file-${Date.now()}`,
					uploadedAt: new Date().toISOString(),
				};

				set({
					projectFiles: [newFile, ...state.projectFiles],
				});
			},

			deleteProjectFile: (fileId) => {
				const state = get();
				set({
					projectFiles: state.projectFiles.filter((f) => f.id !== fileId),
				});
			},

			saveDailyUpdate: (updateData) => {
				const state = get();
				const existingIndex = state.dailyUpdates.findIndex(
					(d) => d.userId === updateData.userId && d.date === updateData.date && d.orgId === updateData.orgId,
				);

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

			// Blocker Actions
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
				return newBlocker;
			},

			reportTaskBlocker: (taskId, title, description, severity) => {
				const state = get();
				const task = state.tasks.find((t) => t.id === taskId);
				if (!task) throw new Error("Task not found");

				const newBlocker: Blocker = {
					id: `blk-${Date.now()}`,
					orgId: task.orgId || "",
					taskId,
					teamId: task.teamId,
					title,
					description,
					severity,
					status: "OPEN",
					reporterId: state.currentUserId,
					assigneeId: task.assigneeId,
					createdAt: new Date().toISOString(),
				};

				// Transition task status to BLOCKED per PRD §24
				const updatedTasks = state.tasks.map((t) =>
					t.id === taskId
						? {
								...t,
								status: "BLOCKED" as TaskStatus,
								blockerId: newBlocker.id,
								updatedAt: new Date().toISOString(),
							}
						: t,
				);

				const notif: NotificationItem = {
					id: `notif-${Date.now()}`,
					userId: task.reporterId,
					type: "blocker",
					title: "Task Blocked",
					message: `Task "${task.title}" is now BLOCKED: ${title}`,
					read: false,
					createdAt: new Date().toISOString(),
				};

				set({
					blockers: [newBlocker, ...state.blockers],
					tasks: updatedTasks,
					notifications: [notif, ...state.notifications],
				});

				return newBlocker;
			},

			resolveBlocker: (blockerId, resolution) => {
				const state = get();
				const blocker = state.blockers.find((b) => b.id === blockerId);
				if (!blocker) return;

				// Return associated task back to IN_PROGRESS per PRD §24
				let updatedTasks = state.tasks;
				if (blocker.taskId) {
					updatedTasks = state.tasks.map((t) =>
						t.id === blocker.taskId
							? {
									...t,
									status: "IN_PROGRESS" as TaskStatus,
									blockerId: undefined,
									updatedAt: new Date().toISOString(),
								}
							: t,
					);
				}

				set({
					blockers: state.blockers.map((b) =>
						b.id === blockerId
							? {
									...b,
									status: "RESOLVED",
									resolution: resolution || "Resolved",
									resolvedAt: new Date().toISOString(),
								}
							: b,
					),
					tasks: updatedTasks,
				});
			},

			escalateBlocker: (blockerId) => {
				const state = get();
				set({
					blockers: state.blockers.map((b) =>
						b.id === blockerId ? { ...b, severity: "CRITICAL", updatedAt: new Date().toISOString() } : b,
					),
				});
			},

			// Notification Actions
			markNotificationRead: (notificationId) => {
				const state = get();
				set({
					notifications: state.notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
				});
			},

			markAllNotificationsRead: () => {
				const state = get();
				set({
					notifications: state.notifications.map((n) => ({ ...n, read: true })),
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
					organizations: state.organizations.map((o) =>
						o.id === orgId ? { ...o, plan: newPlan, updatedAt: new Date().toISOString() } : o,
					),
					auditLogs: [log, ...state.auditLogs],
				});
			},

			resetToSeedData: () => {
				set({
					currentUserId: "usr-tanaka",
					activeOrgId: "org-india",
					activeWorkspace: { type: "personal" },
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
					projectFiles: SEED_PROJECT_FILES,
					chatMessages: SEED_CHAT_MESSAGES,
					notifications: SEED_NOTIFICATIONS,
					activeTimer: null,
				});
			},
		}),
		{
			name: "slash_saas_multi_tenant_store_v2",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
