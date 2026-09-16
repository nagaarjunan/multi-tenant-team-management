import React, { useState, useMemo } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useSaaSStore } from "@/store/saasStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Progress } from "@/ui/progress";
import { Separator } from "@/ui/separator";
import {
	Building2,
	Globe,
	Clock,
	DollarSign,
	Calendar,
	Users,
	UserPlus,
	Shield,
	ShieldCheck,
	KeyRound,
	CreditCard,
	Receipt,
	Download,
	Copy,
	Check,
	Search,
	AlertTriangle,
	Trash2,
	Sparkles,
	Flame,
	CheckCircle2,
	ChevronRight,
	RefreshCw,
	SlidersHorizontal,
	Mail,
} from "lucide-react";
import { toast } from "sonner";
import type { OrgRole } from "@/types/saas";

type SettingsSection =
	| "general"
	| "localization"
	| "members"
	| "invitations"
	| "rbac-matrix"
	| "audit-logs"
	| "billing"
	| "invoices"
	| "danger-zone";

export default function OrganizationSettingsPage() {
	const { organization, activeOrgMembers, user, isOwner, can } = useAuthorization();
	const users = useSaaSStore((s) => s.users);
	const teams = useSaaSStore((s) => s.teams);
	const projects = useSaaSStore((s) => s.projects);
	const invitations = useSaaSStore((s) => s.invitations);
	const auditLogs = useSaaSStore((s) => s.auditLogs);
	const updateOrganization = useSaaSStore((s) => s.updateOrganization);
	const changeMemberRole = useSaaSStore((s) => s.changeMemberRole);
	const removeMember = useSaaSStore((s) => s.removeMember);
	const sendInvitation = useSaaSStore((s) => s.sendInvitation);
	const revokeInvitation = useSaaSStore((s) => s.revokeInvitation);
	const resendInvitation = useSaaSStore((s) => s.resendInvitation);
	const upgradePlan = useSaaSStore((s) => s.upgradePlan);
	const transferOwnership = useSaaSStore((s) => s.transferOwnership);
	const deleteOrganization = useSaaSStore((s) => s.deleteOrganization);

	// Navigation State
	const [activeSection, setActiveSection] = useState<SettingsSection>("general");

	// General Form State
	const [orgName, setOrgName] = useState(organization?.name || "");
	const [orgSlug, setOrgSlug] = useState(organization?.slug || "");
	const [country, setCountry] = useState(organization?.country || "India");
	const [countryCode, setCountryCode] = useState(organization?.countryCode || "IN");
	const [timezone, setTimezone] = useState(organization?.timezone || "Asia/Kolkata");
	const [currency, setCurrency] = useState(organization?.currency || "INR");
	const [currencySymbol, setCurrencySymbol] = useState(organization?.currencySymbol || "₹");
	const [dateFormat, setDateFormat] = useState(organization?.dateFormat || "DD/MM/YYYY");
	const [timeFormat, setTimeFormat] = useState(organization?.timeFormat || "hh:mm A");
	const [weekStart, setWeekStart] = useState<"MONDAY" | "SUNDAY">(organization?.weekStartDay || "MONDAY");

	// Member Filter & Search
	const [memberSearch, setMemberSearch] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("ALL");

	// Invitation Modal & Search
	const [inviteModalOpen, setInviteModalOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
	const [invitationSearch, setInvitationSearch] = useState("");

	// Transfer Ownership Modal & Challenge
	const [transferModalOpen, setTransferModalOpen] = useState(false);
	const [transferTargetId, setTransferTargetId] = useState("");
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deleteConfirmText, setDeleteConfirmText] = useState("");

	// Billing billing cycle toggle
	const [annualBilling, setAnnualBilling] = useState(false);

	// Audit log filter
	const [auditActionFilter, setAuditActionFilter] = useState("ALL");
	const [auditSearch, setAuditSearch] = useState("");

	// Clipboard state
	const [copiedOrgId, setCopiedOrgId] = useState(false);
	const [copiedInviteLink, setCopiedInviteLink] = useState(false);

	// Sync state when organization switches
	React.useEffect(() => {
		if (organization) {
			setOrgName(organization.name);
			setOrgSlug(organization.slug);
			setCountry(organization.country || "India");
			setCountryCode(organization.countryCode || "IN");
			setTimezone(organization.timezone);
			setCurrency(organization.currency);
			setCurrencySymbol(organization.currencySymbol);
			setDateFormat(organization.dateFormat || "DD/MM/YYYY");
			setTimeFormat(organization.timeFormat || "hh:mm A");
			setWeekStart(organization.weekStartDay);
		}
	}, [organization?.id]);

	// Filter invitations & logs for current org
	const orgInvitations = useMemo(
		() => invitations.filter((i) => i.orgId === organization?.id),
		[invitations, organization?.id]
	);

	const orgLogs = useMemo(
		() => auditLogs.filter((l) => l.orgId === organization?.id),
		[auditLogs, organization?.id]
	);

	const filteredMembers = useMemo(() => {
		return activeOrgMembers.filter(({ user: u, membership: m }) => {
			const matchesSearch =
				u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
				u.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
				(u.title && u.title.toLowerCase().includes(memberSearch.toLowerCase()));
			const matchesRole = roleFilter === "ALL" || m.role === roleFilter;
			return matchesSearch && matchesRole;
		});
	}, [activeOrgMembers, memberSearch, roleFilter]);

	const filteredInvitations = useMemo(() => {
		return orgInvitations.filter((i) =>
			i.email.toLowerCase().includes(invitationSearch.toLowerCase())
		);
	}, [orgInvitations, invitationSearch]);

	const filteredAuditLogs = useMemo(() => {
		return orgLogs.filter((l) => {
			const matchesFilter = auditActionFilter === "ALL" || l.action.includes(auditActionFilter);
			const matchesSearch =
				l.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
				(l.details && l.details.toLowerCase().includes(auditSearch.toLowerCase())) ||
				l.action.toLowerCase().includes(auditSearch.toLowerCase());
			return matchesFilter && matchesSearch;
		});
	}, [orgLogs, auditActionFilter, auditSearch]);

	// Calculate organization quotas & usage
	const orgTeams = useMemo(() => teams.filter((t) => t.orgId === organization?.id), [teams, organization?.id]);
	const orgProjects = useMemo(() => projects.filter((p) => p.orgId === organization?.id), [projects, organization?.id]);

	const memberLimit = organization?.plan === "starter" ? 5 : organization?.plan === "professional" ? 25 : 500;
	const teamLimit = organization?.plan === "starter" ? 2 : organization?.plan === "professional" ? 10 : 100;
	const projectLimit = organization?.plan === "starter" ? 5 : organization?.plan === "professional" ? 20 : 200;

	const memberUsagePercent = Math.min(100, Math.round((activeOrgMembers.length / memberLimit) * 100));
	const teamUsagePercent = Math.min(100, Math.round((orgTeams.length / teamLimit) * 100));
	const projectUsagePercent = Math.min(100, Math.round((orgProjects.length / projectLimit) * 100));

	const handleSaveGeneral = (e: React.FormEvent) => {
		e.preventDefault();
		if (!organization) return;
		updateOrganization(organization.id, {
			name: orgName.trim(),
			slug: orgSlug.trim().toLowerCase().replace(/\s+/g, "-"),
			country,
			countryCode,
			timezone,
			currency,
			currencySymbol,
			dateFormat,
			timeFormat,
			weekStartDay: weekStart,
		});
		toast.success("Organization profile updated successfully!");
	};

	const handleCurrencyChange = (curr: string) => {
		setCurrency(curr);
		if (curr === "INR") setCurrencySymbol("₹");
		else if (curr === "JPY") setCurrencySymbol("¥");
		else if (curr === "GBP") setCurrencySymbol("£");
		else if (curr === "USD") setCurrencySymbol("$");
		else if (curr === "EUR") setCurrencySymbol("€");
	};

	const handleRoleChange = (memberUserId: string, newRole: OrgRole) => {
		if (!isOwner) {
			toast.error("Permission Denied: Only the Organization Owner can modify member roles.");
			return;
		}
		if (!organization) return;

		changeMemberRole(organization.id, memberUserId, newRole);
		toast.success("Role updated successfully.");
	};

	const handleRemoveMember = (memberUserId: string, memberName: string) => {
		if (!organization) return;
		if (memberUserId === organization.ownerId) {
			toast.error("Cannot remove the organization owner.");
			return;
		}

		if (confirm(`Are you sure you want to remove ${memberName} from this organization?`)) {
			removeMember(organization.id, memberUserId);
			toast.success(`${memberName} removed.`);
		}
	};

	const handleSendInvite = (e: React.FormEvent) => {
		e.preventDefault();
		if (!inviteEmail.trim()) {
			toast.error("Please enter an email address");
			return;
		}
		if (!organization) return;

		sendInvitation(organization.id, inviteEmail.trim(), inviteRole);
		toast.success(`Invitation sent to ${inviteEmail}`);
		setInviteModalOpen(false);
		setInviteEmail("");
	};

	const handleCopyOrgId = () => {
		if (organization) {
			navigator.clipboard.writeText(organization.id);
			setCopiedOrgId(true);
			toast.info(`Organization ID copied: ${organization.id}`);
			setTimeout(() => setCopiedOrgId(false), 2000);
		}
	};

	const handleCopyInviteLink = () => {
		if (organization) {
			navigator.clipboard.writeText(`https://app.slashsaas.com/invite/${organization.slug}?token=demo_${Date.now()}`);
			setCopiedInviteLink(true);
			toast.success("Shareable invitation link copied to clipboard!");
			setTimeout(() => setCopiedInviteLink(false), 2000);
		}
	};

	const handleTransferOwnership = () => {
		if (!transferTargetId || !organization) return;
		const targetUser = users.find((u) => u.id === transferTargetId);
		transferOwnership(organization.id, transferTargetId);
		toast.success(`Ownership transferred to ${targetUser?.name}! You are now an ADMIN.`);
		setTransferModalOpen(false);
	};

	const handleDeleteOrg = () => {
		if (!organization) return;
		if (deleteConfirmText.trim() === organization.name) {
			deleteOrganization(organization.id);
			toast.success(`Organization '${organization.name}' has been permanently deleted.`);
			setDeleteModalOpen(false);
		} else {
			toast.error("Confirmation name did not match.");
		}
	};

	const handleExportLogsJson = () => {
		if (!organization) return;
		const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orgLogs, null, 2));
		const downloadAnchor = document.createElement("a");
		downloadAnchor.setAttribute("href", dataStr);
		downloadAnchor.setAttribute("download", `audit-logs-${organization.slug}-${new Date().toISOString().slice(0, 10)}.json`);
		document.body.appendChild(downloadAnchor);
		downloadAnchor.click();
		downloadAnchor.remove();
		toast.success("Audit logs exported to JSON.");
	};

	// Mock Invoices
	const mockInvoices = [
		{ id: "INV-2026-009", date: "Sep 01, 2026", amount: organization?.currencySymbol + (organization?.plan === "enterprise" ? "19,999" : organization?.plan === "professional" ? "4,999" : "0"), status: "PAID", tier: organization?.plan },
		{ id: "INV-2026-008", date: "Aug 01, 2026", amount: organization?.currencySymbol + (organization?.plan === "enterprise" ? "19,999" : organization?.plan === "professional" ? "4,999" : "0"), status: "PAID", tier: organization?.plan },
		{ id: "INV-2026-007", date: "Jul 01, 2026", amount: organization?.currencySymbol + (organization?.plan === "enterprise" ? "19,999" : organization?.plan === "professional" ? "4,999" : "0"), status: "PAID", tier: organization?.plan },
	];

	return (
		<div className="space-y-6 pb-16">
			{/* Top Hero Organization Banner */}
			<div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
					<div className="flex items-center gap-4">
						<div className="relative group">
							<Avatar className="h-16 w-16 rounded-2xl border-2 border-primary/20 shadow-md">
								<AvatarImage src={organization?.logo} alt={organization?.name} />
								<AvatarFallback className="rounded-2xl text-lg font-bold bg-primary/10 text-primary">
									{organization?.name?.slice(0, 2).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background shadow-xs border border-border">
								<span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
							</span>
						</div>

						<div className="space-y-1">
							<div className="flex flex-wrap items-center gap-2.5">
								<h1 className="text-2xl font-extrabold tracking-tight text-foreground">{organization?.name}</h1>
								<Badge
									variant={organization?.plan === "enterprise" ? "default" : organization?.plan === "professional" ? "info" : "secondary"}
									className="uppercase font-bold text-[10px] tracking-wider px-2 py-0.5"
								>
									{organization?.plan} PLAN
								</Badge>
								<Badge variant="outline" className="text-[11px] gap-1 px-2 py-0.5 font-normal">
									<Globe className="w-3 h-3 text-muted-foreground" />
									{organization?.country} ({organization?.countryCode})
								</Badge>
							</div>

							<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
								<button
									onClick={handleCopyOrgId}
									className="flex items-center gap-1 font-mono text-[11px] hover:text-foreground transition-colors p-0.5 rounded bg-muted/40 hover:bg-muted px-1.5"
									title="Click to copy Org ID"
								>
									<span>{organization?.id}</span>
									{copiedOrgId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 opacity-60" />}
								</button>
								<span>•</span>
								<span>Timezone: <strong>{organization?.timezone}</strong></span>
								<span>•</span>
								<span>Currency: <strong>{organization?.currency} ({organization?.currencySymbol})</strong></span>
							</div>
						</div>
					</div>

					{/* Quick Metric Badges */}
					<div className="flex items-center gap-3 self-start md:self-auto shrink-0">
						<div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-xl bg-card border border-border/80 shadow-xs">
							<span className="text-[10px] uppercase font-bold text-muted-foreground">Members</span>
							<span className="text-base font-extrabold text-foreground">{activeOrgMembers.length} / {memberLimit}</span>
						</div>
						<div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-xl bg-card border border-border/80 shadow-xs">
							<span className="text-[10px] uppercase font-bold text-muted-foreground">Teams</span>
							<span className="text-base font-extrabold text-foreground">{orgTeams.length} / {teamLimit}</span>
						</div>
						<div className="flex flex-col items-center justify-center px-3.5 py-2 rounded-xl bg-card border border-border/80 shadow-xs">
							<span className="text-[10px] uppercase font-bold text-muted-foreground">Projects</span>
							<span className="text-base font-extrabold text-foreground">{orgProjects.length} / {projectLimit}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Main Settings Grid: Modern Vertical Rail + Detail View */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
				{/* Sidebar Rail */}
				<div className="lg:col-span-3 space-y-4">
					<Card className="p-2 border-border/70 shadow-xs bg-card/60 backdrop-blur-xs">
						<div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							Organization
						</div>
						<div className="space-y-0.5">
							<button
								onClick={() => setActiveSection("general")}
								className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
									activeSection === "general"
										? "bg-primary text-primary-foreground shadow-xs font-semibold"
										: "text-muted-foreground hover:bg-accent hover:text-foreground"
								}`}
							>
								<div className="flex items-center gap-2.5">
									<Building2 className="w-4 h-4" />
									<span>General Profile</span>
								</div>
								<ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeSection === "general" ? "text-primary-foreground" : ""}`} />
							</button>

							<button
								onClick={() => setActiveSection("localization")}
								className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
									activeSection === "localization"
										? "bg-primary text-primary-foreground shadow-xs font-semibold"
										: "text-muted-foreground hover:bg-accent hover:text-foreground"
								}`}
							>
								<div className="flex items-center gap-2.5">
									<Globe className="w-4 h-4" />
									<span>Localization & Formats</span>
								</div>
								<ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeSection === "localization" ? "text-primary-foreground" : ""}`} />
							</button>
						</div>

						<Separator className="my-2" />

						<div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							Access & Security
						</div>
						<div className="space-y-0.5">
							<button
								onClick={() => setActiveSection("members")}
								className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
									activeSection === "members"
										? "bg-primary text-primary-foreground shadow-xs font-semibold"
										: "text-muted-foreground hover:bg-accent hover:text-foreground"
								}`}
							>
								<div className="flex items-center gap-2.5">
									<Users className="w-4 h-4" />
									<span>Members Directory</span>
								</div>
								<Badge variant="secondary" className="text-[10px] h-4 px-1.5 py-0 font-bold">
									{activeOrgMembers.length}
								</Badge>
							</button>

							<button
								onClick={() => setActiveSection("invitations")}
								className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
									activeSection === "invitations"
										? "bg-primary text-primary-foreground shadow-xs font-semibold"
										: "text-muted-foreground hover:bg-accent hover:text-foreground"
								}`}
							>
								<div className="flex items-center gap-2.5">
									<UserPlus className="w-4 h-4" />
									<span>Invitations Hub</span>
								</div>
								{orgInvitations.filter((i) => i.status === "PENDING").length > 0 && (
									<Badge variant="warning" className="text-[9px] h-4 px-1 py-0 font-bold">
										{orgInvitations.filter((i) => i.status === "PENDING").length}
									</Badge>
								)}
							</button>

							<button
								onClick={() => setActiveSection("rbac-matrix")}
								className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
									activeSection === "rbac-matrix"
										? "bg-primary text-primary-foreground shadow-xs font-semibold"
										: "text-muted-foreground hover:bg-accent hover:text-foreground"
								}`}
							>
								<div className="flex items-center gap-2.5">
									<KeyRound className="w-4 h-4" />
									<span>Roles & RBAC Matrix</span>
								</div>
								<ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeSection === "rbac-matrix" ? "text-primary-foreground" : ""}`} />
							</button>

							<button
								onClick={() => setActiveSection("audit-logs")}
								className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
									activeSection === "audit-logs"
										? "bg-primary text-primary-foreground shadow-xs font-semibold"
										: "text-muted-foreground hover:bg-accent hover:text-foreground"
								}`}
							>
								<div className="flex items-center gap-2.5">
									<ShieldCheck className="w-4 h-4" />
									<span>Security & Audit Trails</span>
								</div>
								<ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeSection === "audit-logs" ? "text-primary-foreground" : ""}`} />
							</button>
						</div>

						<Separator className="my-2" />

						<div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							Plans & Invoices
						</div>
						<div className="space-y-0.5">
							<button
								onClick={() => setActiveSection("billing")}
								className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
									activeSection === "billing"
										? "bg-primary text-primary-foreground shadow-xs font-semibold"
										: "text-muted-foreground hover:bg-accent hover:text-foreground"
								}`}
							>
								<div className="flex items-center gap-2.5">
									<CreditCard className="w-4 h-4" />
									<span>Subscription & Plans</span>
								</div>
								<ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeSection === "billing" ? "text-primary-foreground" : ""}`} />
							</button>

							<button
								onClick={() => setActiveSection("invoices")}
								className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
									activeSection === "invoices"
										? "bg-primary text-primary-foreground shadow-xs font-semibold"
										: "text-muted-foreground hover:bg-accent hover:text-foreground"
								}`}
							>
								<div className="flex items-center gap-2.5">
									<Receipt className="w-4 h-4" />
									<span>Invoices & Receipts</span>
								</div>
								<ChevronRight className={`w-3.5 h-3.5 opacity-60 ${activeSection === "invoices" ? "text-primary-foreground" : ""}`} />
							</button>
						</div>

						{isOwner && (
							<>
								<Separator className="my-2" />
								<div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-destructive">
									Danger Zone
								</div>
								<button
									onClick={() => setActiveSection("danger-zone")}
									className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
										activeSection === "danger-zone"
											? "bg-destructive text-destructive-foreground shadow-xs font-bold"
											: "text-destructive hover:bg-destructive/10"
									}`}
								>
									<div className="flex items-center gap-2.5">
										<Flame className="w-4 h-4" />
										<span>Ownership & Deletion</span>
									</div>
									<ChevronRight className="w-3.5 h-3.5 opacity-60" />
								</button>
							</>
						)}
					</Card>

					{/* Quota Usage Widget */}
					<Card className="p-4 border-border/70 bg-card/60 shadow-xs space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold text-foreground">Quota Utilization</span>
							<Badge variant="outline" className="text-[10px] uppercase">{organization?.plan}</Badge>
						</div>

						<div className="space-y-2.5">
							<div className="space-y-1">
								<div className="flex justify-between text-[11px]">
									<span className="text-muted-foreground">Members</span>
									<span className="font-semibold text-foreground">{activeOrgMembers.length} / {memberLimit}</span>
								</div>
								<Progress value={memberUsagePercent} className="h-1.5" />
							</div>

							<div className="space-y-1">
								<div className="flex justify-between text-[11px]">
									<span className="text-muted-foreground">Teams</span>
									<span className="font-semibold text-foreground">{orgTeams.length} / {teamLimit}</span>
								</div>
								<Progress value={teamUsagePercent} className="h-1.5" />
							</div>

							<div className="space-y-1">
								<div className="flex justify-between text-[11px]">
									<span className="text-muted-foreground">Projects</span>
									<span className="font-semibold text-foreground">{orgProjects.length} / {projectLimit}</span>
								</div>
								<Progress value={projectUsagePercent} className="h-1.5" />
							</div>
						</div>

						{isOwner && organization?.plan !== "enterprise" && (
							<Button
								variant="outline"
								size="sm"
								className="w-full text-xs h-7.5 border-primary/40 text-primary hover:bg-primary/10 gap-1.5 mt-2"
								onClick={() => setActiveSection("billing")}
							>
								<Sparkles className="w-3 h-3" /> Upgrade Quotas
							</Button>
						)}
					</Card>
				</div>

				{/* Detail Content Area */}
				<div className="lg:col-span-9 space-y-6">
					{/* SECTION 1: GENERAL PROFILE */}
					{activeSection === "general" && (
						<Card className="border-border/80 shadow-xs">
							<CardHeader className="border-b border-border/50 pb-4">
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-lg font-bold flex items-center gap-2">
											<Building2 className="w-5 h-5 text-primary" /> General Organization Profile
										</CardTitle>
										<CardDescription className="text-xs mt-0.5">
											Manage organization identity, slug, and core metadata.
										</CardDescription>
									</div>
									<Badge variant={can("org.settings.update") ? "default" : "secondary"} className="text-[10px]">
										{can("org.settings.update") ? "Editable" : "Read-Only"}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className="p-6">
								<form onSubmit={handleSaveGeneral} className="space-y-6 max-w-2xl">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-1.5">
											<Label className="text-xs font-semibold">Organization Name *</Label>
											<Input
												value={orgName}
												onChange={(e) => setOrgName(e.target.value)}
												disabled={!can("org.settings.update")}
												placeholder="e.g. Acme Corp"
												className="h-9.5 text-xs"
											/>
										</div>

										<div className="space-y-1.5">
											<Label className="text-xs font-semibold">Organization URL Slug *</Label>
											<div className="flex items-center">
												<span className="inline-flex items-center h-9.5 px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-xs font-mono">
													app.slashsaas.com/
												</span>
												<Input
													value={orgSlug}
													onChange={(e) => setOrgSlug(e.target.value)}
													disabled={!can("org.settings.update")}
													placeholder="acme-corp"
													className="rounded-l-none h-9.5 text-xs font-mono"
												/>
											</div>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-1.5">
											<Label className="text-xs font-semibold">Country / Territory</Label>
											<Select value={country} onValueChange={(val) => {
												setCountry(val);
												if (val === "India") setCountryCode("IN");
												else if (val === "Japan") setCountryCode("JP");
												else if (val === "United Kingdom") setCountryCode("GB");
												else if (val === "United States") setCountryCode("US");
												else if (val === "Germany") setCountryCode("DE");
											}} disabled={!can("org.settings.update")}>
												<SelectTrigger className="h-9.5 text-xs">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="India">India (IN)</SelectItem>
													<SelectItem value="Japan">Japan (JP)</SelectItem>
													<SelectItem value="United Kingdom">United Kingdom (GB)</SelectItem>
													<SelectItem value="United States">United States (US)</SelectItem>
													<SelectItem value="Germany">Germany (DE)</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-1.5">
											<Label className="text-xs font-semibold">Country Code</Label>
											<Input value={countryCode} readOnly className="h-9.5 text-xs bg-muted/40 font-mono" />
										</div>
									</div>

									{/* Organization Logo Card */}
									<div className="p-4 rounded-xl border border-border/70 bg-card/60 flex items-center justify-between gap-4">
										<div className="flex items-center gap-3">
											<Avatar className="w-12 h-12 rounded-xl border border-border">
												<AvatarImage src={organization?.logo} />
												<AvatarFallback className="text-sm font-bold">{organization?.name.slice(0, 2)}</AvatarFallback>
											</Avatar>
											<div>
												<h4 className="text-xs font-semibold text-foreground">Organization Avatar / Logo</h4>
												<p className="text-[11px] text-muted-foreground">Auto-generated SVG avatar or custom tenant branding.</p>
											</div>
										</div>
										<Button
											type="button"
											variant="outline"
											size="sm"
											disabled={!can("org.settings.update")}
											onClick={() => {
												const newLogo = `https://api.dicebear.com/7.x/identicon/svg?seed=${orgName}_${Date.now()}`;
												updateOrganization(organization!.id, { logo: newLogo });
												toast.success("Regenerated organization logo identifier!");
											}}
											className="text-xs h-8 gap-1.5"
										>
											<RefreshCw className="w-3.5 h-3.5" /> Regenerate Logo
										</Button>
									</div>

									{can("org.settings.update") && (
										<div className="flex justify-end pt-2">
											<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-xs px-5 h-9">
												Save General Settings
											</Button>
										</div>
									)}
								</form>
							</CardContent>
						</Card>
					)}

					{/* SECTION 2: LOCALIZATION & REGIONAL */}
					{activeSection === "localization" && (
						<div className="space-y-6">
							<Card className="border-border/80 shadow-xs">
								<CardHeader className="border-b border-border/50 pb-4">
									<CardTitle className="text-lg font-bold flex items-center gap-2">
										<Globe className="w-5 h-5 text-primary" /> Regional & Internationalization Settings
									</CardTitle>
									<CardDescription className="text-xs mt-0.5">
										Configure timezone calculation, multi-currency reporting, and date-time formats for all team members.
									</CardDescription>
								</CardHeader>
								<CardContent className="p-6">
									<form onSubmit={handleSaveGeneral} className="space-y-6 max-w-2xl">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-1.5">
												<Label className="text-xs font-semibold flex items-center gap-1.5">
													<Clock className="w-3.5 h-3.5 text-muted-foreground" /> Timezone
												</Label>
												<Select value={timezone} onValueChange={setTimezone} disabled={!can("org.settings.update")}>
													<SelectTrigger className="h-9.5 text-xs">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="Asia/Kolkata">Asia/Kolkata (IST +5:30) — India</SelectItem>
														<SelectItem value="Asia/Tokyo">Asia/Tokyo (JST +9:00) — Japan</SelectItem>
														<SelectItem value="Europe/London">Europe/London (GMT/BST) — UK</SelectItem>
														<SelectItem value="America/New_York">America/New_York (EST/EDT) — US East</SelectItem>
														<SelectItem value="America/Los_Angeles">America/Los_Angeles (PST/PDT) — US West</SelectItem>
														<SelectItem value="Europe/Berlin">Europe/Berlin (CET +1:00) — Germany</SelectItem>
													</SelectContent>
												</Select>
											</div>

											<div className="space-y-1.5">
												<Label className="text-xs font-semibold flex items-center gap-1.5">
													<DollarSign className="w-3.5 h-3.5 text-muted-foreground" /> Primary Currency
												</Label>
												<Select value={currency} onValueChange={handleCurrencyChange} disabled={!can("org.settings.update")}>
													<SelectTrigger className="h-9.5 text-xs">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="INR">INR (₹) — Indian Rupee</SelectItem>
														<SelectItem value="JPY">JPY (¥) — Japanese Yen</SelectItem>
														<SelectItem value="GBP">GBP (£) — British Pound</SelectItem>
														<SelectItem value="USD">USD ($) — US Dollar</SelectItem>
														<SelectItem value="EUR">EUR (€) — Euro</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div className="space-y-1.5">
												<Label className="text-xs font-semibold flex items-center gap-1.5">
													<Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Date Format
												</Label>
												<Select value={dateFormat} onValueChange={setDateFormat} disabled={!can("org.settings.update")}>
													<SelectTrigger className="h-9.5 text-xs">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="DD/MM/YYYY">DD/MM/YYYY (e.g. 16/09/2026)</SelectItem>
														<SelectItem value="YYYY/MM/DD">YYYY/MM/DD (e.g. 2026/09/16)</SelectItem>
														<SelectItem value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/16/2026)</SelectItem>
														<SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</SelectItem>
													</SelectContent>
												</Select>
											</div>

											<div className="space-y-1.5">
												<Label className="text-xs font-semibold flex items-center gap-1.5">
													<Clock className="w-3.5 h-3.5 text-muted-foreground" /> Time Format
												</Label>
												<Select value={timeFormat} onValueChange={setTimeFormat} disabled={!can("org.settings.update")}>
													<SelectTrigger className="h-9.5 text-xs">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="hh:mm A">12-Hour (e.g. 09:45 PM)</SelectItem>
														<SelectItem value="HH:mm">24-Hour (e.g. 21:45)</SelectItem>
													</SelectContent>
												</Select>
											</div>

											<div className="space-y-1.5">
												<Label className="text-xs font-semibold flex items-center gap-1.5">
													<SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" /> Week Starts On
												</Label>
												<Select value={weekStart} onValueChange={(v) => setWeekStart(v as "MONDAY" | "SUNDAY")} disabled={!can("org.settings.update")}>
													<SelectTrigger className="h-9.5 text-xs">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="MONDAY">Monday (Standard)</SelectItem>
														<SelectItem value="SUNDAY">Sunday</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										{/* Live Simulator Preview Card */}
										<div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
											<div className="flex items-center gap-2">
												<Sparkles className="w-4 h-4 text-primary" />
												<span className="text-xs font-bold text-foreground">Live Internationalization Preview</span>
											</div>
											<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
												<div className="p-2.5 rounded-lg bg-card border border-border/80">
													<span className="text-[10px] text-muted-foreground uppercase font-semibold">Active Timezone</span>
													<div className="font-bold text-foreground mt-0.5">{timezone}</div>
												</div>
												<div className="p-2.5 rounded-lg bg-card border border-border/80">
													<span className="text-[10px] text-muted-foreground uppercase font-semibold">Formatted Price Sample</span>
													<div className="font-bold text-foreground mt-0.5">{currencySymbol} 4,999.00 {currency}</div>
												</div>
												<div className="p-2.5 rounded-lg bg-card border border-border/80">
													<span className="text-[10px] text-muted-foreground uppercase font-semibold">Sprint Calendar Start</span>
													<div className="font-bold text-foreground mt-0.5">{weekStart === "MONDAY" ? "Monday" : "Sunday"}</div>
												</div>
											</div>
										</div>

										{can("org.settings.update") && (
											<div className="flex justify-end pt-2">
												<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-xs px-5 h-9">
													Save Localization Settings
												</Button>
											</div>
										)}
									</form>
								</CardContent>
							</Card>
						</div>
					)}

					{/* SECTION 3: MEMBERS DIRECTORY */}
					{activeSection === "members" && (
						<Card className="border-border/80 shadow-xs">
							<CardHeader className="border-b border-border/50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
								<div>
									<CardTitle className="text-lg font-bold flex items-center gap-2">
										<Users className="w-5 h-5 text-primary" /> Organization Members ({activeOrgMembers.length})
									</CardTitle>
									<CardDescription className="text-xs mt-0.5">
										Users with active tenant membership in {organization?.name}.
									</CardDescription>
								</div>

								{can("member.invite") && (
									<Button size="sm" onClick={() => setInviteModalOpen(true)} className="gap-1.5 text-xs bg-primary hover:bg-primary/90 h-8.5">
										<UserPlus className="w-3.5 h-3.5" /> Invite Member
									</Button>
								)}
							</CardHeader>

							<CardContent className="p-4 space-y-4">
								{/* Search and Filters Bar */}
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
									<div className="relative flex-1 max-w-sm">
										<Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
										<Input
											placeholder="Search members by name, email or title..."
											value={memberSearch}
											onChange={(e) => setMemberSearch(e.target.value)}
											className="pl-8.5 h-8.5 text-xs"
										/>
									</div>

									<div className="flex items-center gap-2">
										<span className="text-xs text-muted-foreground">Filter:</span>
										<Select value={roleFilter} onValueChange={setRoleFilter}>
											<SelectTrigger className="h-8.5 text-xs w-32">
												<SelectValue placeholder="All Roles" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="ALL">All Roles</SelectItem>
												<SelectItem value="OWNER">OWNER</SelectItem>
												<SelectItem value="ADMIN">ADMIN</SelectItem>
												<SelectItem value="MEMBER">MEMBER</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								{/* Members Table */}
								<div className="rounded-xl border border-border/70 overflow-hidden">
									<table className="w-full text-xs text-left">
										<thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-semibold">
											<tr>
												<th className="p-3">User & Title</th>
												<th className="p-3">Email Address</th>
												<th className="p-3">Org Role</th>
												<th className="p-3">Team Roles</th>
												<th className="p-3">Joined Date</th>
												<th className="p-3 text-right">Actions</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-border/40">
											{filteredMembers.map(({ membership, user: memberUser }) => {
												const isTargetOwner = membership.role === "OWNER";
												const isSelf = memberUser.id === user?.id;
												const userLedTeams = orgTeams.filter((t) => t.leadId === memberUser.id);

												return (
													<tr key={membership.id} className="hover:bg-accent/40 transition-colors">
														<td className="p-3">
															<div className="flex items-center gap-3">
																<Avatar className="w-8 h-8 rounded-full border border-border/80">
																	<AvatarImage src={memberUser.avatar} />
																	<AvatarFallback>{memberUser.name.charAt(0)}</AvatarFallback>
																</Avatar>
																<div>
																	<div className="font-semibold text-foreground flex items-center gap-1.5">
																		<span>{memberUser.name}</span>
																		{isSelf && (
																			<Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5">
																				You
																			</Badge>
																		)}
																	</div>
																	<div className="text-[10px] text-muted-foreground">{memberUser.title || "Team Member"}</div>
																</div>
															</div>
														</td>

														<td className="p-3 text-muted-foreground font-mono text-[11px]">{memberUser.email}</td>

														<td className="p-3">
															<Badge
																variant={
																	membership.role === "OWNER"
																		? "default"
																		: membership.role === "ADMIN"
																		? "info"
																		: "secondary"
																}
																className="text-[10px] uppercase font-bold px-2 py-0.5"
															>
																{membership.role}
															</Badge>
														</td>

														<td className="p-3">
															{userLedTeams.length > 0 ? (
																<div className="flex flex-wrap gap-1">
																	{userLedTeams.map((t) => (
																		<Badge key={t.id} variant="warning" className="text-[9px] px-1.5 py-0 h-4 font-semibold">
																			★ Lead: {t.name}
																		</Badge>
																	))}
																</div>
															) : (
																<span className="text-[10px] text-muted-foreground italic">Contributor</span>
															)}
														</td>

														<td className="p-3 text-muted-foreground">
															{new Date(membership.joinedAt).toLocaleDateString()}
														</td>

														<td className="p-3 text-right">
															{!isTargetOwner && (
																<div className="flex items-center justify-end gap-2">
																	{/* Role Selector (Owner Only!) */}
																	{isOwner ? (
																		<Select
																			value={membership.role}
																			onValueChange={(newR) => handleRoleChange(memberUser.id, newR as OrgRole)}
																		>
																			<SelectTrigger className="h-7 text-[11px] w-28">
																				<SelectValue />
																			</SelectTrigger>
																			<SelectContent>
																				<SelectItem value="ADMIN">ADMIN</SelectItem>
																				<SelectItem value="MEMBER">MEMBER</SelectItem>
																			</SelectContent>
																		</Select>
																	) : null}

																	{can("member.remove") && !isSelf && (
																		<Button
																			variant="ghost"
																			size="sm"
																			onClick={() => handleRemoveMember(memberUser.id, memberUser.name)}
																			className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
																			title="Remove member"
																		>
																			<Trash2 className="w-3.5 h-3.5" />
																		</Button>
																	)}
																</div>
															)}
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>
					)}

					{/* SECTION 4: INVITATIONS HUB */}
					{activeSection === "invitations" && (
						<div className="space-y-6">
							<Card className="border-border/80 shadow-xs">
								<CardHeader className="border-b border-border/50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div>
										<CardTitle className="text-lg font-bold flex items-center gap-2">
											<UserPlus className="w-5 h-5 text-primary" /> Invitations Hub
										</CardTitle>
										<CardDescription className="text-xs mt-0.5">
											Pending invitations, historical invites, and shareable onboarding links.
										</CardDescription>
									</div>

									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={handleCopyInviteLink}
											className="gap-1.5 text-xs h-8.5"
										>
											{copiedInviteLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
											Copy Magic Invite Link
										</Button>

										{can("member.invite") && (
											<Button size="sm" onClick={() => setInviteModalOpen(true)} className="gap-1.5 text-xs bg-primary hover:bg-primary/90 h-8.5">
												<Mail className="w-3.5 h-3.5" /> Send Invite
											</Button>
										)}
									</div>
								</CardHeader>

								<CardContent className="p-4 space-y-4">
									<div className="relative max-w-sm">
										<Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
										<Input
											placeholder="Search invited email..."
											value={invitationSearch}
											onChange={(e) => setInvitationSearch(e.target.value)}
											className="pl-8.5 h-8.5 text-xs"
										/>
									</div>

									{filteredInvitations.length === 0 ? (
										<div className="p-12 text-center rounded-xl border border-dashed border-border/80 space-y-2">
											<UserPlus className="w-8 h-8 text-muted-foreground/50 mx-auto" />
											<div className="font-semibold text-xs text-foreground">No Invitations Found</div>
											<p className="text-[11px] text-muted-foreground">Send an invite or copy the magic link above to add teammates.</p>
										</div>
									) : (
										<div className="rounded-xl border border-border/70 overflow-hidden">
											<table className="w-full text-xs text-left">
												<thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-semibold">
													<tr>
														<th className="p-3">Invited Email</th>
														<th className="p-3">Assigned Role</th>
														<th className="p-3">Status</th>
														<th className="p-3">Expires On</th>
														<th className="p-3 text-right">Actions</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-border/40">
													{filteredInvitations.map((inv) => (
														<tr key={inv.id} className="hover:bg-accent/40 transition-colors">
															<td className="p-3 font-semibold text-foreground flex items-center gap-2">
																<Mail className="w-3.5 h-3.5 text-muted-foreground" />
																<span>{inv.email}</span>
															</td>
															<td className="p-3">
																<Badge variant="outline" className="text-[10px] uppercase font-bold">
																	{inv.role}
																</Badge>
															</td>
															<td className="p-3">
																<Badge
																	variant={
																		inv.status === "ACCEPTED"
																			? "success"
																			: inv.status === "PENDING"
																			? "warning"
																			: "destructive"
																	}
																	className="text-[10px] font-semibold"
																>
																	{inv.status}
																</Badge>
															</td>
															<td className="p-3 text-muted-foreground">
																{new Date(inv.expiresAt).toLocaleDateString()}
															</td>
															<td className="p-3 text-right">
																{inv.status === "PENDING" && can("member.invite") && (
																	<div className="flex items-center justify-end gap-2">
																		<Button
																			variant="outline"
																			size="sm"
																			onClick={() => {
																				resendInvitation(inv.id);
																				toast.success(`Invitation resent to ${inv.email}`);
																			}}
																			className="h-7 text-[11px]"
																		>
																			Resend
																		</Button>
																		<Button
																			variant="ghost"
																			size="sm"
																			onClick={() => {
																				revokeInvitation(inv.id);
																				toast.warning(`Invitation revoked for ${inv.email}`);
																			}}
																			className="h-7 text-[11px] text-destructive hover:bg-destructive/10"
																		>
																			Revoke
																		</Button>
																	</div>
																)}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					)}

					{/* SECTION 5: RBAC PERMISSIONS MATRIX */}
					{activeSection === "rbac-matrix" && (
						<div className="space-y-6">
							<Card className="border-border/80 shadow-xs">
								<CardHeader className="border-b border-border/50 pb-4">
									<CardTitle className="text-lg font-bold flex items-center gap-2">
										<KeyRound className="w-5 h-5 text-primary" /> Built-in Role vs Responsibility Matrix
									</CardTitle>
									<CardDescription className="text-xs mt-0.5">
										Architecture specification comparison: Customer Roles (OWNER, ADMIN, MEMBER), Platform Role (SUPER_ADMIN), and Team Responsibilities.
									</CardDescription>
								</CardHeader>
								<CardContent className="p-6 space-y-6">
									{/* Role Explanations */}
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
											<div className="flex items-center gap-2">
												<Badge variant="default" className="text-xs font-bold">OWNER</Badge>
												<span className="font-semibold text-xs text-foreground">Highest Customer Authority</span>
											</div>
											<p className="text-muted-foreground text-[11px]">
												Full control over organization ownership, billing plans, promoting Admins, danger zone operations, and ownership transfer.
											</p>
										</div>

										<div className="p-4 rounded-xl border border-info/30 bg-info/5 space-y-2">
											<div className="flex items-center gap-2">
												<Badge variant="info" className="text-xs font-bold">ADMIN</Badge>
												<span className="font-semibold text-xs text-foreground">Operations Administrator</span>
											</div>
											<p className="text-muted-foreground text-[11px]">
												Full operational authority over members, invitations, teams, products, projects, and task boards. Explicitly restricted from billing, promoting admins, and deletion.
											</p>
										</div>

										<div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
											<div className="flex items-center gap-2">
												<Badge variant="secondary" className="text-xs font-bold">MEMBER</Badge>
												<span className="font-semibold text-xs text-foreground">Individual Contributor</span>
											</div>
											<p className="text-muted-foreground text-[11px]">
												Assigned work execution, daily standup submissions, blocker reporting, and assigned team execution.
											</p>
										</div>
									</div>

									{/* Comparison Matrix Table */}
									<div className="rounded-xl border border-border/70 overflow-hidden">
										<table className="w-full text-xs text-left">
											<thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-semibold">
												<tr>
													<th className="p-3">Capability / Permission</th>
													<th className="p-3 text-center">Super Admin</th>
													<th className="p-3 text-center">Owner</th>
													<th className="p-3 text-center">Admin</th>
													<th className="p-3 text-center">Member</th>
													<th className="p-3 text-center">Team Lead</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-border/40 text-[11px]">
												<tr>
													<td className="p-3 font-semibold text-foreground">Cross-Tenant Super Console & Audited Impersonation</td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center text-muted-foreground">—</td>
													<td className="p-3 text-center text-muted-foreground">—</td>
													<td className="p-3 text-center text-muted-foreground">—</td>
													<td className="p-3 text-center text-muted-foreground">—</td>
												</tr>
												<tr>
													<td className="p-3 font-semibold text-foreground">Modify Billing & Subscription Plans</td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center text-muted-foreground">—</td>
													<td className="p-3 text-center text-muted-foreground">—</td>
													<td className="p-3 text-center text-muted-foreground">—</td>
												</tr>
												<tr>
													<td className="p-3 font-semibold text-foreground">Promote / Demote Members to ADMIN</td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center text-muted-foreground">—</td>
													<td className="p-3 text-center text-muted-foreground">—</td>
													<td className="p-3 text-center text-muted-foreground">—</td>
												</tr>
												<tr>
													<td className="p-3 font-semibold text-foreground">Invite New Teammates (MEMBER role)</td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center text-muted-foreground">—</td>
													<td className="p-3 text-center text-muted-foreground">—</td>
												</tr>
												<tr>
													<td className="p-3 font-semibold text-foreground">Create & Manage Teams / Products / Projects</td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center text-muted-foreground">—</td>
													<td className="p-3 text-center text-muted-foreground">—</td>
												</tr>
												<tr>
													<td className="p-3 font-semibold text-foreground">Assign Team Tasks & Manage Team Sprint Board</td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center text-muted-foreground">Self/Team</td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
												</tr>
												<tr>
													<td className="p-3 font-semibold text-foreground">Submit Daily Standup & Report Blockers</td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
													<td className="p-3 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /></td>
												</tr>
											</tbody>
										</table>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* SECTION 6: AUDIT LOGS */}
					{activeSection === "audit-logs" && (
						<div className="space-y-6">
							<Card className="border-border/80 shadow-xs">
								<CardHeader className="border-b border-border/50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div>
										<CardTitle className="text-lg font-bold flex items-center gap-2">
											<ShieldCheck className="w-5 h-5 text-primary" /> Security & Audit Stream ({orgLogs.length})
										</CardTitle>
										<CardDescription className="text-xs mt-0.5">
											Immutable log of administrative events, membership changes, and tenant updates.
										</CardDescription>
									</div>

									<Button
										variant="outline"
										size="sm"
										onClick={handleExportLogsJson}
										className="gap-1.5 text-xs h-8.5"
									>
										<Download className="w-3.5 h-3.5" /> Export Audit Log JSON
									</Button>
								</CardHeader>

								<CardContent className="p-4 space-y-4">
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
										<div className="relative flex-1 max-w-sm">
											<Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
											<Input
												placeholder="Search logs by actor, action or detail..."
												value={auditSearch}
												onChange={(e) => setAuditSearch(e.target.value)}
												className="pl-8.5 h-8.5 text-xs"
											/>
										</div>

										<div className="flex items-center gap-2">
											<span className="text-xs text-muted-foreground">Action Type:</span>
											<Select value={auditActionFilter} onValueChange={setAuditActionFilter}>
												<SelectTrigger className="h-8.5 text-xs w-40">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="ALL">All Actions</SelectItem>
													<SelectItem value="ROLE">Role Changes</SelectItem>
													<SelectItem value="TEAM">Team Events</SelectItem>
													<SelectItem value="INVITATION">Invitations</SelectItem>
													<SelectItem value="ORGANIZATION">Tenant Updates</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className="rounded-xl border border-border/70 overflow-hidden">
										<table className="w-full text-xs text-left">
											<thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-semibold">
												<tr>
													<th className="p-3">Timestamp</th>
													<th className="p-3">Actor</th>
													<th className="p-3">Action</th>
													<th className="p-3">Target Resource</th>
													<th className="p-3">Details</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-border/40">
												{filteredAuditLogs.map((log) => (
													<tr key={log.id} className="hover:bg-accent/40 transition-colors">
														<td className="p-3 text-muted-foreground font-mono text-[11px] whitespace-nowrap">
															{new Date(log.timestamp).toLocaleString()}
														</td>
														<td className="p-3 font-semibold text-foreground whitespace-nowrap">
															{log.actorName}
														</td>
														<td className="p-3">
															<Badge variant="outline" className="text-[10px] font-mono">
																{log.action}
															</Badge>
														</td>
														<td className="p-3 text-muted-foreground font-semibold">
															{log.resourceType}
														</td>
														<td className="p-3 text-foreground">{log.details}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* SECTION 7: BILLING & SUBSCRIPTION */}
					{activeSection === "billing" && (
						<div className="space-y-6">
							<Card className="border-border/80 shadow-xs">
								<CardHeader className="border-b border-border/50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div>
										<CardTitle className="text-lg font-bold flex items-center gap-2">
											<CreditCard className="w-5 h-5 text-primary" /> Subscription & Plan Tier
										</CardTitle>
										<CardDescription className="text-xs mt-0.5">
											Current Active Tier: <strong className="uppercase">{organization?.plan}</strong> ({organization?.currency})
										</CardDescription>
									</div>

									{/* Billing Cycle Switch */}
									<div className="flex items-center gap-2 p-1 rounded-lg bg-muted/60 border border-border/70 text-xs">
										<button
											onClick={() => setAnnualBilling(false)}
											className={`px-3 py-1 rounded-md transition-all ${!annualBilling ? "bg-card text-foreground font-bold shadow-xs" : "text-muted-foreground"}`}
										>
											Monthly
										</button>
										<button
											onClick={() => setAnnualBilling(true)}
											className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${annualBilling ? "bg-card text-foreground font-bold shadow-xs" : "text-muted-foreground"}`}
										>
											<span>Annual</span>
											<Badge variant="success" className="text-[9px] px-1 py-0 h-3.5 font-bold uppercase">
												Save 20%
											</Badge>
										</button>
									</div>
								</CardHeader>

								<CardContent className="p-6 space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										{/* Starter Tier */}
										<div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${organization?.plan === "starter" ? "border-primary/80 bg-primary/5 ring-2 ring-primary/20" : "border-border/70 bg-card hover:border-border"}`}>
											<div className="space-y-4">
												<div className="flex items-center justify-between">
													<h4 className="font-bold text-base text-foreground">Starter</h4>
													{organization?.plan === "starter" && <Badge variant="default">Current Plan</Badge>}
												</div>
												<div className="text-3xl font-extrabold text-foreground">
													{organization?.currencySymbol}0
													<span className="text-xs font-normal text-muted-foreground"> / month</span>
												</div>
												<p className="text-xs text-muted-foreground">Ideal for small early-stage teams getting started.</p>
												<Separator />
												<ul className="text-xs text-muted-foreground space-y-2">
													<li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Up to 5 team members</li>
													<li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> 2 Active Teams</li>
													<li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> 5 Products & Projects</li>
													<li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Basic Kanban Board</li>
												</ul>
											</div>

											<div className="pt-6">
												{isOwner && organization?.plan !== "starter" && (
													<Button size="sm" variant="outline" className="w-full text-xs" onClick={() => {
														upgradePlan(organization!.id, "starter");
														toast.success("Downgraded to Starter tier.");
													}}>
														Downgrade to Starter
													</Button>
												)}
											</div>
										</div>

										{/* Professional Tier */}
										<div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between relative ${organization?.plan === "professional" ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md" : "border-border/70 bg-card hover:border-border"}`}>
											<div className="space-y-4">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-1.5">
														<h4 className="font-bold text-base text-foreground">Professional</h4>
														<Badge variant="warning" className="text-[9px] px-1 py-0 uppercase font-bold">POPULAR</Badge>
													</div>
													{organization?.plan === "professional" && <Badge variant="default">Current Plan</Badge>}
												</div>
												<div className="text-3xl font-extrabold text-foreground">
													{organization?.currencySymbol}{annualBilling ? (organization?.currency === "JPY" ? "3,999" : "3,999") : (organization?.currency === "JPY" ? "4,999" : "4,999")}
													<span className="text-xs font-normal text-muted-foreground"> / month</span>
												</div>
												<p className="text-xs text-muted-foreground">For scaling organizations needing analytics & export.</p>
												<Separator />
												<ul className="text-xs text-muted-foreground space-y-2">
													<li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Up to 25 team members</li>
													<li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> 10 Teams & 20 Projects</li>
													<li className="flex items-center gap-2 font-medium text-foreground"><Sparkles className="w-3.5 h-3.5 text-primary" /> Report Export (CSV/PDF)</li>
													<li className="flex items-center gap-2 font-medium text-foreground"><Sparkles className="w-3.5 h-3.5 text-primary" /> Audit Trail Logging</li>
												</ul>
											</div>

											<div className="pt-6">
												{isOwner && organization?.plan !== "professional" && (
													<Button size="sm" className="w-full text-xs bg-primary hover:bg-primary/90" onClick={() => {
														upgradePlan(organization!.id, "professional");
														toast.success("Upgraded to Professional tier!");
													}}>
														Switch to Professional
													</Button>
												)}
											</div>
										</div>

										{/* Enterprise Tier */}
										<div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${organization?.plan === "enterprise" ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md" : "border-border/70 bg-card hover:border-border"}`}>
											<div className="space-y-4">
												<div className="flex items-center justify-between">
													<h4 className="font-bold text-base text-foreground">Enterprise</h4>
													{organization?.plan === "enterprise" && <Badge variant="default">Current Plan</Badge>}
												</div>
												<div className="text-3xl font-extrabold text-foreground">
													{organization?.currencySymbol}{annualBilling ? (organization?.currency === "JPY" ? "15,999" : "15,999") : (organization?.currency === "JPY" ? "19,999" : "19,999")}
													<span className="text-xs font-normal text-muted-foreground"> / month</span>
												</div>
												<p className="text-xs text-muted-foreground">Unlimited capacity, dedicated SLA and custom SSO.</p>
												<Separator />
												<ul className="text-xs text-muted-foreground space-y-2">
													<li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Unlimited members & teams</li>
													<li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Unlimited products & projects</li>
													<li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> SAML / Okta Single Sign-On</li>
													<li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Dedicated 99.99% SLA Support</li>
												</ul>
											</div>

											<div className="pt-6">
												{isOwner && organization?.plan !== "enterprise" && (
													<Button size="sm" className="w-full text-xs bg-primary hover:bg-primary/90" onClick={() => {
														upgradePlan(organization!.id, "enterprise");
														toast.success("Upgraded to Enterprise tier!");
													}}>
														Upgrade to Enterprise
													</Button>
												)}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* SECTION 8: INVOICES & RECEIPTS */}
					{activeSection === "invoices" && (
						<Card className="border-border/80 shadow-xs">
							<CardHeader className="border-b border-border/50 pb-4">
								<CardTitle className="text-lg font-bold flex items-center gap-2">
									<Receipt className="w-5 h-5 text-primary" /> Invoices & Billing History
								</CardTitle>
								<CardDescription className="text-xs mt-0.5">
									Download historical receipts and invoices for {organization?.name}.
								</CardDescription>
							</CardHeader>
							<CardContent className="p-4">
								<div className="rounded-xl border border-border/70 overflow-hidden">
									<table className="w-full text-xs text-left">
										<thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-semibold">
											<tr>
												<th className="p-3">Invoice ID</th>
												<th className="p-3">Billing Date</th>
												<th className="p-3">Tier</th>
												<th className="p-3">Amount</th>
												<th className="p-3">Status</th>
												<th className="p-3 text-right">Receipt</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-border/40">
											{mockInvoices.map((inv) => (
												<tr key={inv.id} className="hover:bg-accent/40 transition-colors">
													<td className="p-3 font-mono font-bold text-foreground">{inv.id}</td>
													<td className="p-3 text-muted-foreground">{inv.date}</td>
													<td className="p-3 uppercase font-semibold text-foreground">{inv.tier}</td>
													<td className="p-3 font-extrabold text-foreground">{inv.amount}</td>
													<td className="p-3">
														<Badge variant="success" className="text-[10px] font-bold">
															{inv.status}
														</Badge>
													</td>
													<td className="p-3 text-right">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => toast.success(`Downloaded ${inv.id}.pdf`)}
															className="h-7 text-xs gap-1 hover:bg-muted"
														>
															<Download className="w-3.5 h-3.5" /> PDF
														</Button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</CardContent>
						</Card>
					)}

					{/* SECTION 9: DANGER ZONE (OWNER ONLY) */}
					{activeSection === "danger-zone" && isOwner && (
						<div className="space-y-6">
							<Card className="border-destructive/40 bg-destructive/5 shadow-xs">
								<CardHeader className="border-b border-destructive/20 pb-4">
									<CardTitle className="text-lg font-bold text-destructive flex items-center gap-2">
										<Flame className="w-5 h-5" /> Danger Zone (Owner Exclusives)
									</CardTitle>
									<CardDescription className="text-xs text-destructive/90">
										Irreversible actions. Transfer primary ownership or permanently purge the tenant.
									</CardDescription>
								</CardHeader>

								<CardContent className="p-6 space-y-6">
									{/* Transfer Ownership Card */}
									<div className="p-5 rounded-2xl bg-card border border-destructive/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
										<div className="space-y-1">
											<div className="font-bold text-sm text-foreground flex items-center gap-2">
												<Shield className="w-4 h-4 text-warning" /> Transfer Primary Ownership
											</div>
											<p className="text-xs text-muted-foreground">
												Select another active teammate to assume full OWNER privileges. Your role will be transitioned to ADMIN.
											</p>
										</div>

										<Button
											variant="outline"
											size="sm"
											onClick={() => {
												setTransferTargetId(activeOrgMembers.find((m) => m.user.id !== user?.id)?.user.id || "");
												setTransferModalOpen(true);
											}}
											className="border-warning text-warning hover:bg-warning/10 shrink-0 h-9 text-xs"
										>
											Transfer Ownership
										</Button>
									</div>

									{/* Delete Organization Card */}
									<div className="p-5 rounded-2xl bg-card border border-destructive/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
										<div className="space-y-1">
											<div className="font-bold text-sm text-destructive flex items-center gap-2">
												<AlertTriangle className="w-4 h-4 text-destructive" /> Permanently Delete Organization
											</div>
											<p className="text-xs text-muted-foreground">
												Irrevocably delete <strong>{organization?.name}</strong>, all associated teams, task history, and audit records.
											</p>
										</div>

										<Button
											variant="destructive"
											size="sm"
											onClick={() => {
												setDeleteConfirmText("");
												setDeleteModalOpen(true);
											}}
											className="shrink-0 h-9 text-xs bg-destructive hover:bg-destructive/90 font-bold"
										>
											Delete Organization
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			</div>

			{/* Invite Member Modal */}
			<Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
				<DialogContent className="sm:max-w-[440px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<UserPlus className="w-5 h-5 text-primary" /> Invite to {organization?.name}
						</DialogTitle>
						<DialogDescription className="text-xs">
							Send an email invitation or share an onboarding link with your colleague.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSendInvite} className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Teammate Email Address *</Label>
							<Input
								type="email"
								placeholder="colleague@example.com"
								value={inviteEmail}
								onChange={(e) => setInviteEmail(e.target.value)}
								className="h-9.5 text-xs"
								autoFocus
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Assigned Organization Role</Label>
							<Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "ADMIN" | "MEMBER")}>
								<SelectTrigger className="h-9.5 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="MEMBER">MEMBER (Standard Access)</SelectItem>
									{isOwner && <SelectItem value="ADMIN">ADMIN (Operations Administrator)</SelectItem>}
								</SelectContent>
							</Select>
							{!isOwner && (
								<p className="text-[10px] text-muted-foreground">
									Note: Only the organization Owner has authority to assign the ADMIN role.
								</p>
							)}
						</div>

						<DialogFooter className="pt-3 gap-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setInviteModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-xs px-4">
								Send Invitation
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Transfer Ownership Modal */}
			<Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
				<DialogContent className="sm:max-w-[440px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-warning">
							<Shield className="w-5 h-5" /> Transfer Primary Ownership
						</DialogTitle>
						<DialogDescription className="text-xs">
							Select the active team member who will take over primary ownership of {organization?.name}.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Select Successor Owner</Label>
							<Select value={transferTargetId} onValueChange={setTransferTargetId}>
								<SelectTrigger className="h-9.5 text-xs">
									<SelectValue placeholder="Choose a member" />
								</SelectTrigger>
								<SelectContent>
									{activeOrgMembers
										.filter((m) => m.user.id !== user?.id)
										.map((m) => (
											<SelectItem key={m.user.id} value={m.user.id}>
												{m.user.name} ({m.membership.role}) — {m.user.email}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>

						<DialogFooter className="pt-2 gap-2">
							<Button variant="outline" size="sm" onClick={() => setTransferModalOpen(false)}>
								Cancel
							</Button>
							<Button
								size="sm"
								onClick={handleTransferOwnership}
								className="bg-warning text-warning-foreground hover:bg-warning/90 font-bold"
							>
								Confirm Ownership Transfer
							</Button>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>

			{/* Delete Organization Challenge Modal */}
			<Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
				<DialogContent className="sm:max-w-[460px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<AlertTriangle className="w-5 h-5" /> Delete Organization
						</DialogTitle>
						<DialogDescription className="text-xs">
							This action cannot be undone. All teams, products, sprint boards, daily updates, and audit trails will be permanently deleted.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-2">
						<div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-1">
							<p className="font-semibold">Type the organization name to confirm:</p>
							<p className="font-mono font-bold">{organization?.name}</p>
						</div>

						<Input
							value={deleteConfirmText}
							onChange={(e) => setDeleteConfirmText(e.target.value)}
							placeholder={organization?.name}
							className="h-9.5 text-xs font-mono"
							autoFocus
						/>

						<DialogFooter className="pt-2 gap-2">
							<Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
								Cancel
							</Button>
							<Button
								size="sm"
								disabled={deleteConfirmText.trim() !== organization?.name}
								onClick={handleDeleteOrg}
								className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold"
							>
								Permanently Delete
							</Button>
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
