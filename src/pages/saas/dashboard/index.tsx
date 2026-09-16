import { useMemo } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useSaaSStore } from "@/store/saasStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import {
	CheckCircle2,
	Clock,
	AlertOctagon,
	Users,
	Sparkles,
	ArrowUpRight,
	CalendarClock,
	Shield,
	CheckSquare,
	Briefcase,
	Globe,
	Flame,
} from "lucide-react";
import { Link } from "react-router";

export default function SaaSMainDashboard() {
	const { user, organization, role, isOwner, isAdmin, isMember, isSuperAdmin } = useAuthorization();
	const tasks = useSaaSStore((s) => s.tasks);
	const blockers = useSaaSStore((s) => s.blockers);
	const dailyUpdates = useSaaSStore((s) => s.dailyUpdates);
	const teams = useSaaSStore((s) => s.teams);
	const projects = useSaaSStore((s) => s.projects);
	const auditLogs = useSaaSStore((s) => s.auditLogs);
	const users = useSaaSStore((s) => s.users);

	// Filter tenant-scoped data
	const orgTasks = useMemo(() => tasks.filter((t) => t.orgId === organization?.id), [tasks, organization?.id]);
	const orgBlockers = useMemo(() => blockers.filter((b) => b.orgId === organization?.id), [blockers, organization?.id]);
	const orgTeams = useMemo(() => teams.filter((t) => t.orgId === organization?.id), [teams, organization?.id]);
	const orgProjects = useMemo(() => projects.filter((p) => p.orgId === organization?.id), [projects, organization?.id]);
	const orgLogs = useMemo(() => auditLogs.filter((l) => l.orgId === organization?.id).slice(0, 6), [auditLogs, organization?.id]);

	// Compute metrics
	const activeTasksCount = orgTasks.filter((t) => t.status !== "DONE").length;
	const completedTasksCount = orgTasks.filter((t) => t.status === "DONE").length;
	const completionRate = orgTasks.length > 0 ? Math.round((completedTasksCount / orgTasks.length) * 100) : 0;
	const openBlockers = orgBlockers.filter((b) => b.status !== "RESOLVED");
	const criticalBlockers = openBlockers.filter((b) => b.severity === "CRITICAL" || b.severity === "HIGH");

	// User's specific work
	const myTasks = orgTasks.filter((t) => t.assigneeId === user?.id);
	const myPendingTasks = myTasks.filter((t) => t.status !== "DONE");
	const myTodayUpdate = dailyUpdates.find((d) => d.orgId === organization?.id && d.userId === user?.id && d.date === "2026-09-16");

	return (
		<div className="space-y-6 pb-10">
			{/* Organization & Persona Welcome Header */}
			<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 p-6 md:p-8 shadow-sm">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
					<div className="space-y-2">
						<div className="flex items-center gap-2 flex-wrap">
							<Badge variant="outline" className="bg-background/80 text-foreground text-xs py-1 px-2.5 font-medium gap-1.5 shadow-xs">
								<Globe className="w-3.5 h-3.5 text-primary" />
								<span>{organization?.name}</span> • <span>{organization?.country}</span> ({organization?.timezone})
							</Badge>
							<Badge
								variant={isSuperAdmin ? "destructive" : isOwner ? "default" : isAdmin ? "info" : "secondary"}
								className="text-xs uppercase font-bold px-2.5 py-1"
							>
								{isSuperAdmin ? "SUPER ADMIN" : role}
							</Badge>
							<Badge variant="outline" className="text-xs uppercase font-semibold text-muted-foreground">
								Plan: {organization?.plan}
							</Badge>
						</div>

						<h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
							Good afternoon, {user?.name?.split(" ")[0]} 👋
						</h1>
						<p className="text-sm text-muted-foreground max-w-2xl">
							{isOwner && "You have full ownership of this tenant. Manage members, billing, policies, and organization execution."}
							{isAdmin && "You have administrative oversight over operational teams, tasks, projects, and daily execution."}
							{isMember && "Here is your personalized execution hub. Track your assigned tasks, team standups, and active blockers."}
							{isSuperAdmin && "You are viewing this tenant via Super Admin platform console."}
						</p>
					</div>

					<div className="flex items-center gap-2.5 shrink-0 flex-wrap">
						<Link to="/my-work">
							<Button variant="outline" className="gap-1.5 h-9 text-xs">
								<Briefcase className="w-4 h-4" /> My Work ({myPendingTasks.length})
							</Button>
						</Link>
						<Link to="/daily-execution">
							<Button className="gap-1.5 h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
								<CalendarClock className="w-4 h-4" />
								{myTodayUpdate ? "Edit Standup" : "Post Today's Standup"}
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{/* KPI Metric Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Active Tasks
						</CardTitle>
						<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
							<CheckSquare className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{activeTasksCount}</div>
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
							<span className="text-success font-medium flex items-center">
								{completedTasksCount} done
							</span>
							<span>• {completionRate}% completion</span>
						</div>
						<Progress value={completionRate} className="h-1.5 mt-3" />
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Open Blockers
						</CardTitle>
						<div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
							<AlertOctagon className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{openBlockers.length}</div>
						<div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
							{criticalBlockers.length > 0 ? (
								<span className="text-destructive font-semibold flex items-center gap-1">
									<Flame className="w-3.5 h-3.5" /> {criticalBlockers.length} high/critical severity
								</span>
							) : (
								<span className="text-success font-medium">No critical blockers</span>
							)}
						</div>
						<div className="mt-3 flex gap-1">
							{openBlockers.map((b) => (
								<span
									key={b.id}
									className={`h-1.5 rounded-full flex-1 ${
										b.severity === "CRITICAL" ? "bg-destructive" : b.severity === "HIGH" ? "bg-warning" : "bg-muted-foreground/30"
									}`}
								/>
							))}
						</div>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Teams & Projects
						</CardTitle>
						<div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-info">
							<Users className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{orgTeams.length} Teams</div>
						<p className="text-xs text-muted-foreground mt-1">
							{orgProjects.length} active products/projects delivering
						</p>
						<div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-info">
							<span>All teams operating in {organization?.timezone}</span>
						</div>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Today's Standup
						</CardTitle>
						<div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
							<CalendarClock className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{myTodayUpdate ? "Submitted" : "Pending"}
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							{myTodayUpdate ? "Logged for 2026-09-16" : "Submit before daily sprint sync"}
						</p>
						<div className="mt-3 flex items-center gap-1">
							{myTodayUpdate ? (
								<Badge variant="success" className="text-[10px] px-1.5 py-0 h-4">
									<CheckCircle2 className="w-3 h-3 mr-1" /> Standup Logged
								</Badge>
							) : (
								<Badge variant="warning" className="text-[10px] px-1.5 py-0 h-4">
									<Clock className="w-3 h-3 mr-1" /> Action Needed
								</Badge>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Middle Section: My Immediate Work & Standups */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left 2 Cols: My Tasks & Workload */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-3">
							<div>
								<CardTitle className="text-base font-semibold">My Assigned Tasks</CardTitle>
								<CardDescription className="text-xs">
									Tasks assigned to you across projects
								</CardDescription>
							</div>
							<Link to="/tasks">
								<Button variant="ghost" size="sm" className="gap-1 text-xs text-primary">
									View All <ArrowUpRight className="w-3.5 h-3.5" />
								</Button>
							</Link>
						</CardHeader>
						<CardContent>
							{myTasks.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground text-xs">
									<CheckCircle2 className="w-8 h-8 text-success/60 mx-auto mb-2" />
									You are all caught up! No tasks assigned.
								</div>
							) : (
								<div className="space-y-3">
									{myTasks.slice(0, 4).map((task) => {
										const project = orgProjects.find((p) => p.id === task.projectId);
										return (
											<div
												key={task.id}
												className="flex items-center justify-between p-3 rounded-lg border border-border/60 hover:bg-accent/40 transition-colors gap-3"
											>
												<div className="flex items-start gap-3 min-w-0">
													<div
														className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
															task.status === "DONE"
																? "bg-success"
																: task.status === "IN_PROGRESS"
																? "bg-info"
																: task.status === "BLOCKED"
																? "bg-destructive"
																: "bg-muted-foreground"
														}`}
													/>
													<div className="min-w-0">
														<div className="text-xs font-semibold text-foreground truncate">{task.title}</div>
														<div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
															<span>{project?.name || "General"}</span>
															<span>•</span>
															<span>Due {task.dueDate || "No date"}</span>
														</div>
													</div>
												</div>

												<div className="flex items-center gap-2 shrink-0">
													<Badge
														variant={
															task.priority === "URGENT" || task.priority === "HIGH"
																? "destructive"
																: "secondary"
														}
														className="text-[10px] uppercase font-semibold"
													>
														{task.priority}
													</Badge>
													<Badge
														variant={
															task.status === "DONE"
																? "success"
																: task.status === "IN_PROGRESS"
																? "info"
																: task.status === "BLOCKED"
																? "destructive"
																: "secondary"
														}
														className="text-[10px] font-semibold"
													>
														{task.status.replace("_", " ")}
													</Badge>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Active Blockers Quick Triage */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-3">
							<div>
								<CardTitle className="text-base font-semibold flex items-center gap-2">
									<AlertOctagon className="w-4 h-4 text-destructive" />
									Active Blockers Requiring Attention
								</CardTitle>
								<CardDescription className="text-xs">
									Obstacles blocking team execution in {organization?.name}
								</CardDescription>
							</div>
							<Link to="/blockers">
								<Button variant="ghost" size="sm" className="gap-1 text-xs text-primary">
									Triage Board <ArrowUpRight className="w-3.5 h-3.5" />
								</Button>
							</Link>
						</CardHeader>
						<CardContent>
							{openBlockers.length === 0 ? (
								<div className="text-center py-6 text-muted-foreground text-xs">
									🎉 No open blockers. Everything is running smoothly!
								</div>
							) : (
								<div className="space-y-3">
									{openBlockers.map((blocker) => {
										const reporter = users.find((u) => u.id === blocker.reporterId);
										return (
											<div
												key={blocker.id}
												className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 space-y-1.5"
											>
												<div className="flex items-center justify-between gap-2">
													<span className="font-semibold text-xs text-foreground truncate">
														{blocker.title}
													</span>
													<Badge
														variant={blocker.severity === "CRITICAL" ? "destructive" : "warning"}
														className="text-[10px] uppercase font-bold"
													>
														{blocker.severity}
													</Badge>
												</div>
												<p className="text-xs text-muted-foreground line-clamp-2">
													{blocker.description}
												</p>
												<div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1">
													<span>Reported by {reporter?.name || "Team Member"}</span>
													<Badge variant="outline" className="text-[9px] uppercase">
														{blocker.status}
													</Badge>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right 1 Col: Team Structure & Audit Activity */}
				<div className="space-y-6">
					{/* Active Teams */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-base font-semibold">Teams in Organization</CardTitle>
							<CardDescription className="text-xs">
								Team Leads & Member Responsibilities
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{orgTeams.map((team) => {
								const leadUser = users.find((u) => u.id === team.leadId);
								return (
									<div key={team.id} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2">
										<div className="flex items-center justify-between">
											<span className="font-semibold text-xs text-foreground">{team.name}</span>
											<Badge variant="outline" className="text-[10px]">
												{team.memberIds.length} members
											</Badge>
										</div>
										<p className="text-[11px] text-muted-foreground line-clamp-2">
											{team.description}
										</p>
										<div className="flex items-center gap-1.5 pt-1 text-[11px] text-primary">
											<Sparkles className="w-3 h-3" />
											<span className="font-medium">
												Lead: {leadUser?.name || "No lead assigned"}
											</span>
										</div>
									</div>
								);
							})}
						</CardContent>
					</Card>

					{/* Recent Privileged Audit Logs */}
					<Card>
						<CardHeader className="pb-3 flex flex-row items-center justify-between">
							<div>
								<CardTitle className="text-base font-semibold">Audit Activity</CardTitle>
								<CardDescription className="text-xs">
									Recent security & role operations
								</CardDescription>
							</div>
							<Shield className="w-4 h-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							{orgLogs.length === 0 ? (
								<div className="text-center py-4 text-xs text-muted-foreground">
									No audit logs recorded yet.
								</div>
							) : (
								<div className="space-y-3">
									{orgLogs.map((log) => (
										<div key={log.id} className="text-xs space-y-0.5 border-l-2 border-primary/40 pl-2.5 py-0.5">
											<div className="font-semibold text-foreground text-[11px]">
												{log.action.replace(/_/g, " ")}
											</div>
											<div className="text-[10px] text-muted-foreground">
												{log.details || `${log.actorName} performed ${log.action}`}
											</div>
											<div className="text-[9px] text-muted-foreground/60">
												{new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
