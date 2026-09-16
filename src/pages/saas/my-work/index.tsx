import { useState, useMemo } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useSaaSStore } from "@/store/saasStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Badge } from "@/ui/badge";
import {
	Briefcase,
	CalendarClock,
	CheckCircle2,
	Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { TaskStatus } from "@/types/saas";

export default function MyWorkPage() {
	const { user, organization } = useAuthorization();
	const tasks = useSaaSStore((s) => s.tasks);
	const updateTaskStatus = useSaaSStore((s) => s.updateTaskStatus);
	const dailyUpdates = useSaaSStore((s) => s.dailyUpdates);
	const blockers = useSaaSStore((s) => s.blockers);
	const teams = useSaaSStore((s) => s.teams);
	const projects = useSaaSStore((s) => s.projects);

	const [activeTab, setActiveTab] = useState("tasks");

	// Filter work for current user and current org
	const myTasks = useMemo(() => {
		return tasks.filter((t) => t.orgId === organization?.id && (t.assigneeId === user?.id || t.reporterId === user?.id));
	}, [tasks, organization?.id, user?.id]);

	const myDailyUpdates = useMemo(() => {
		return dailyUpdates.filter((d) => d.orgId === organization?.id && d.userId === user?.id);
	}, [dailyUpdates, organization?.id, user?.id]);

	const myBlockers = useMemo(() => {
		return blockers.filter((b) => b.orgId === organization?.id && (b.reporterId === user?.id || b.assigneeId === user?.id));
	}, [blockers, organization?.id, user?.id]);

	const myTeams = useMemo(() => {
		return teams.filter((t) => t.orgId === organization?.id && (t.memberIds.includes(user?.id) || t.leadId === user?.id));
	}, [teams, organization?.id, user?.id]);

	const myProjects = useMemo(() => {
		return projects.filter((p) => p.orgId === organization?.id && p.memberIds.includes(user?.id));
	}, [projects, organization?.id, user?.id]);

	const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
		updateTaskStatus(taskId, newStatus);
		toast.success(`Task status updated to ${newStatus}`);
	};

	return (
		<div className="space-y-6 pb-12">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<Briefcase className="w-5 h-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">My Work</h1>
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						Personalized workspace for {user?.name} in {organization?.name}
					</p>
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
				<TabsList className="grid grid-cols-4 w-full sm:w-[500px]">
					<TabsTrigger value="tasks" className="text-xs">
						Tasks ({myTasks.filter((t) => t.status !== "DONE").length})
					</TabsTrigger>
					<TabsTrigger value="standups" className="text-xs">
						Standups ({myDailyUpdates.length})
					</TabsTrigger>
					<TabsTrigger value="blockers" className="text-xs">
						Blockers ({myBlockers.filter((b) => b.status !== "RESOLVED").length})
					</TabsTrigger>
					<TabsTrigger value="memberships" className="text-xs">
						Teams & Projects
					</TabsTrigger>
				</TabsList>

				{/* 1. Tasks Tab */}
				<TabsContent value="tasks" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base font-semibold">Assigned & Created Tasks</CardTitle>
							<CardDescription className="text-xs">
								You have permission to update status and edit tasks assigned to you.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{myTasks.length === 0 ? (
								<div className="text-center py-12 text-muted-foreground text-xs">
									<CheckCircle2 className="w-10 h-10 text-success mx-auto mb-2 opacity-80" />
									<h3 className="font-semibold text-foreground text-sm">You're all caught up</h3>
									<p className="mt-1">No tasks are currently assigned to you in {organization?.name}.</p>
								</div>
							) : (
								<div className="space-y-3">
									{myTasks.map((task) => {
										const project = projects.find((p) => p.id === task.projectId);
										const isAssignee = task.assigneeId === user?.id;

										return (
											<div
												key={task.id}
												className="p-4 rounded-xl border border-border/70 hover:border-primary/40 bg-card transition-all space-y-3 shadow-xs"
											>
												<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
													<div className="space-y-1">
														<div className="flex items-center gap-2">
															<span className="font-semibold text-sm text-foreground">{task.title}</span>
															{isAssignee && (
																<Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
																	Assigned to you
																</Badge>
															)}
														</div>
														<p className="text-xs text-muted-foreground">{task.description}</p>
													</div>

													<div className="flex items-center gap-2 shrink-0">
														<Badge
															variant={
																task.priority === "URGENT" || task.priority === "HIGH"
																	? "destructive"
																	: "secondary"
															}
															className="text-[10px] uppercase font-bold"
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
															className="text-[10px] uppercase font-semibold"
														>
															{task.status.replace("_", " ")}
														</Badge>
													</div>
												</div>

												{/* Quick Status Bar */}
												<div className="flex flex-wrap items-center justify-between pt-2 border-t border-border/40 gap-2 text-xs text-muted-foreground">
													<div className="flex items-center gap-3 text-[11px]">
														<span>Project: <strong>{project?.name || "General"}</strong></span>
														<span>•</span>
														<span>Due: {task.dueDate || "No due date"}</span>
													</div>

													<div className="flex items-center gap-1">
														<span className="text-[11px] mr-1">Change status:</span>
														{(["TODO", "IN_PROGRESS", "BLOCKED", "DONE"] as TaskStatus[]).map((st) => (
															<Button
																key={st}
																size="sm"
																variant={task.status === st ? "default" : "outline"}
																onClick={() => handleStatusChange(task.id, st)}
																className={`h-7 px-2 text-[10px] uppercase font-medium ${
																	task.status === st ? "pointer-events-none" : ""
																}`}
															>
																{st.replace("_", " ")}
															</Button>
														))}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* 2. Standups Tab */}
				<TabsContent value="standups" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base font-semibold">Your Daily Standup Logs</CardTitle>
							<CardDescription className="text-xs">
								Historical daily execution updates submitted in timezone {organization?.timezone}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{myDailyUpdates.length === 0 ? (
								<div className="text-center py-10 text-xs text-muted-foreground">
									No standup entries logged yet. Visit the <strong>Daily Execution</strong> tab to post your update.
								</div>
							) : (
								<div className="space-y-4">
									{myDailyUpdates.map((upd) => (
										<div key={upd.id} className="p-4 rounded-xl border border-border/60 bg-muted/10 space-y-3">
											<div className="flex items-center justify-between">
												<span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
													<CalendarClock className="w-4 h-4 text-primary" /> Date: {upd.date}
												</span>
												<Badge variant="success" className="text-[10px]">
													{upd.status}
												</Badge>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
												<div className="p-2.5 rounded-lg bg-card border border-border/40 space-y-1">
													<span className="text-[11px] font-semibold text-muted-foreground uppercase">Yesterday</span>
													<p className="text-foreground">{upd.yesterday || "None"}</p>
												</div>
												<div className="p-2.5 rounded-lg bg-card border border-border/40 space-y-1">
													<span className="text-[11px] font-semibold text-primary uppercase">Today</span>
													<p className="text-foreground">{upd.today || "None"}</p>
												</div>
												<div className="p-2.5 rounded-lg bg-card border border-border/40 space-y-1">
													<span className="text-[11px] font-semibold text-destructive uppercase">Blockers</span>
													<p className="text-foreground">{upd.blockers || "None"}</p>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* 3. Blockers Tab */}
				<TabsContent value="blockers" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base font-semibold">Your Reported Blockers</CardTitle>
							<CardDescription className="text-xs">
								Blockers you have reported or are assigned to investigate
							</CardDescription>
						</CardHeader>
						<CardContent>
							{myBlockers.length === 0 ? (
								<div className="text-center py-10 text-xs text-muted-foreground">
									You have not reported any active blockers.
								</div>
							) : (
								<div className="space-y-3">
									{myBlockers.map((blocker) => (
										<div key={blocker.id} className="p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 space-y-2">
											<div className="flex items-center justify-between">
												<span className="font-semibold text-xs text-foreground">{blocker.title}</span>
												<Badge variant={blocker.severity === "CRITICAL" ? "destructive" : "warning"} className="text-[10px]">
													{blocker.severity}
												</Badge>
											</div>
											<p className="text-xs text-muted-foreground">{blocker.description}</p>
											<div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
												<span>Status: <strong>{blocker.status}</strong></span>
												<span>Reported: {new Date(blocker.createdAt).toLocaleDateString()}</span>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* 4. Teams & Projects */}
				<TabsContent value="memberships" className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-sm font-semibold">Your Teams</CardTitle>
								<CardDescription className="text-xs">Teams in which you participate</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{myTeams.length === 0 ? (
									<p className="text-xs text-muted-foreground">Not assigned to any team yet.</p>
								) : (
									myTeams.map((t) => {
										const isLead = t.leadId === user?.id;
										return (
											<div key={t.id} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
												<div className="flex items-center justify-between">
													<span className="font-semibold text-xs">{t.name}</span>
													{isLead && (
														<Badge variant="default" className="text-[10px] gap-1">
															<Sparkles className="w-2.5 h-2.5" /> Team Lead
														</Badge>
													)}
												</div>
												<p className="text-[11px] text-muted-foreground">{t.description}</p>
											</div>
										);
									})
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="text-sm font-semibold">Your Assigned Projects</CardTitle>
								<CardDescription className="text-xs">Projects where you have access</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{myProjects.length === 0 ? (
									<p className="text-xs text-muted-foreground">Not assigned to any project yet.</p>
								) : (
									myProjects.map((p) => (
										<div key={p.id} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
											<div className="flex items-center justify-between">
												<span className="font-semibold text-xs">{p.name}</span>
												<Badge variant="outline" className="text-[10px]">
													{p.status}
												</Badge>
											</div>
											<p className="text-[11px] text-muted-foreground">{p.description}</p>
										</div>
									))
								)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
