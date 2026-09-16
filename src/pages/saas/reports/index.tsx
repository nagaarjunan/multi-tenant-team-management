import { useState, useMemo } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useSaaSStore } from "@/store/saasStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/ui/dialog";
import {
	BarChart3,
	Download,
	Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { PLAN_FEATURE_ACCESS } from "@/auth/authorization";

export default function ReportsPage() {
	const { organization, can, isOwner } = useAuthorization();
	const tasks = useSaaSStore((s) => s.tasks);
	const blockers = useSaaSStore((s) => s.blockers);
	const teams = useSaaSStore((s) => s.teams);
	const upgradePlan = useSaaSStore((s) => s.upgradePlan);

	const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

	// Filter data for current org
	const orgTasks = useMemo(() => tasks.filter((t) => t.orgId === organization?.id), [tasks, organization?.id]);
	const orgBlockers = useMemo(() => blockers.filter((b) => b.orgId === organization?.id), [blockers, organization?.id]);
	const orgTeams = useMemo(() => teams.filter((t) => t.orgId === organization?.id), [teams, organization?.id]);

	const completedTasks = orgTasks.filter((t) => t.status === "DONE").length;
	const inProgressTasks = orgTasks.filter((t) => t.status === "IN_PROGRESS").length;
	const blockedTasks = orgTasks.filter((t) => t.status === "BLOCKED").length;
	const todoTasks = orgTasks.filter((t) => t.status === "TODO").length;

	const resolvedBlockers = orgBlockers.filter((b) => b.status === "RESOLVED").length;
	const openBlockers = orgBlockers.filter((b) => b.status !== "RESOLVED").length;

	// Export handler evaluating Permission vs Plan Entitlement
	const handleExport = () => {
		// 1. Check Permission
		if (!can("report.export")) {
			toast.error("Permission Denied: You do not have permission to export organizational reports.");
			return;
		}

		// 2. Check Plan Entitlement
		const currentPlan = organization?.plan || "starter";
		const isPlanAllowed = PLAN_FEATURE_ACCESS[currentPlan]?.reportExport;

		if (!isPlanAllowed) {
			setUpgradeModalOpen(true);
			return;
		}

		// Success export
		toast.success(`Report exported successfully as ${organization?.name}-Execution-Report.csv!`);
	};

	const handleUpgrade = () => {
		if (!organization) return;
		upgradePlan(organization.id, "professional");
		toast.success(`Organization '${organization.name}' upgraded to Professional plan!`);
		setUpgradeModalOpen(false);
	};

	return (
		<div className="space-y-6 pb-12">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<BarChart3 className="w-5 h-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">Operational Reports & Analytics</h1>
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						Sprint velocity, blocker resolution metrics, and team workload analytics in {organization?.name}.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button onClick={handleExport} variant="outline" className="gap-2 text-xs h-9 shadow-xs">
						<Download className="w-4 h-4" /> Export CSV / PDF
					</Button>
				</div>
			</div>

			{/* Plan & Permission Notice */}
			{organization?.plan === "starter" && (
				<Card className="border-primary/20 bg-primary/5 p-4">
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
								<Sparkles className="w-4 h-4" />
							</div>
							<div>
								<div className="text-xs font-semibold text-foreground">Starter Tier Analytics</div>
								<div className="text-[11px] text-muted-foreground">
									You are currently on the Free Starter plan. Advanced export and historical audit reports require a Professional plan.
								</div>
							</div>
						</div>
						{isOwner && (
							<Button size="sm" onClick={() => setUpgradeModalOpen(true)} className="h-8 text-xs gap-1.5 bg-primary">
								<Sparkles className="w-3.5 h-3.5" /> Upgrade Plan
							</Button>
						)}
					</div>
				</Card>
			)}

			{/* Analytics Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
				{/* 1. Task Delivery Breakdown */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base font-semibold">Delivery Status Breakdown</CardTitle>
						<CardDescription className="text-xs">Overall tasks across projects</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between text-xs">
								<span className="text-success font-medium">Completed ({completedTasks})</span>
								<span className="text-muted-foreground">
									{orgTasks.length > 0 ? Math.round((completedTasks / orgTasks.length) * 100) : 0}%
								</span>
							</div>
							<Progress value={orgTasks.length > 0 ? (completedTasks / orgTasks.length) * 100 : 0} className="h-2 bg-muted" />
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between text-xs">
								<span className="text-info font-medium">In Progress ({inProgressTasks})</span>
								<span className="text-muted-foreground">
									{orgTasks.length > 0 ? Math.round((inProgressTasks / orgTasks.length) * 100) : 0}%
								</span>
							</div>
							<Progress value={orgTasks.length > 0 ? (inProgressTasks / orgTasks.length) * 100 : 0} className="h-2 bg-muted" />
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between text-xs">
								<span className="text-destructive font-medium">Blocked ({blockedTasks})</span>
								<span className="text-muted-foreground">
									{orgTasks.length > 0 ? Math.round((blockedTasks / orgTasks.length) * 100) : 0}%
								</span>
							</div>
							<Progress value={orgTasks.length > 0 ? (blockedTasks / orgTasks.length) * 100 : 0} className="h-2 bg-muted" />
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between text-xs">
								<span className="text-muted-foreground font-medium">To Do ({todoTasks})</span>
								<span className="text-muted-foreground">
									{orgTasks.length > 0 ? Math.round((todoTasks / orgTasks.length) * 100) : 0}%
								</span>
							</div>
							<Progress value={orgTasks.length > 0 ? (todoTasks / orgTasks.length) * 100 : 0} className="h-2 bg-muted" />
						</div>
					</CardContent>
				</Card>

				{/* 2. Blocker Resolution Health */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base font-semibold">Blocker Health & Resolution</CardTitle>
						<CardDescription className="text-xs">Resolution efficiency and active risks</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/20 border border-border/40 text-center">
							<div className="space-y-1">
								<div className="text-2xl font-bold text-destructive">{openBlockers}</div>
								<div className="text-[10px] uppercase font-semibold text-muted-foreground">Active Blockers</div>
							</div>
							<div className="space-y-1">
								<div className="text-2xl font-bold text-success">{resolvedBlockers}</div>
								<div className="text-[10px] uppercase font-semibold text-muted-foreground">Resolved</div>
							</div>
						</div>

						<div className="space-y-2 pt-2 text-xs">
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Average Resolution Time:</span>
								<span className="font-semibold text-foreground">1.4 Days</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Critical Escalation Rate:</span>
								<span className="font-semibold text-foreground">12%</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-muted-foreground">Timezone Alignment:</span>
								<span className="font-semibold text-primary">{organization?.timezone}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* 3. Team Workload Distribution */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base font-semibold">Team Workloads</CardTitle>
						<CardDescription className="text-xs">Tasks assigned across teams</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{orgTeams.map((t) => {
							const teamTasks = orgTasks.filter((tsk) => tsk.teamId === t.id);
							return (
								<div key={t.id} className="p-3 rounded-lg bg-muted/20 border border-border/40 space-y-1.5">
									<div className="flex items-center justify-between text-xs">
										<span className="font-semibold">{t.name}</span>
										<Badge variant="outline" className="text-[10px]">
											{teamTasks.length} Tasks
										</Badge>
									</div>
									<div className="text-[11px] text-muted-foreground flex items-center justify-between">
										<span>{t.memberIds.length} Active Engineers</span>
										<span>{t.leadId ? "Lead Assigned" : "No Lead"}</span>
									</div>
								</div>
							);
						})}
					</CardContent>
				</Card>
			</div>

			{/* Plan Upgrade Dialog (Plan Denial Modal) */}
			<Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
				<DialogContent className="sm:max-w-[480px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-primary">
							<Sparkles className="w-5 h-5" /> Plan Upgrade Required
						</DialogTitle>
						<DialogDescription className="text-xs">
							Report Export & Compliance Analytics is an enterprise feature.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-2">
						<div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
							<div className="font-semibold text-xs text-foreground">Professional Plan Features:</div>
							<ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
								<li>Unlimited CSV & PDF Report Exports</li>
								<li>Up to 25 team members and 10 teams</li>
								<li>Full compliance audit trails and security logs</li>
								<li>Priority SLA and daily execution insights</li>
							</ul>
						</div>

						<DialogFooter className="pt-2 gap-2">
							<Button variant="outline" size="sm" onClick={() => setUpgradeModalOpen(false)}>
								Cancel
							</Button>
							{isOwner ? (
								<Button size="sm" onClick={handleUpgrade} className="bg-primary hover:bg-primary/90 gap-1.5">
									<Sparkles className="w-4 h-4" /> Upgrade to Professional
								</Button>
							) : (
								<Button size="sm" disabled className="text-xs">
									Contact Org Owner to Upgrade
								</Button>
							)}
						</DialogFooter>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
