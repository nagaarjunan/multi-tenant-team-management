import { useState, useMemo } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useSaaSStore } from "@/store/saasStore";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";

import { Badge } from "@/ui/badge";

import {
	Briefcase,
	CalendarClock,
	CheckCircle2,
	Clock,
	AlertOctagon,
	Play,
	Square,
	ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";


export default function MyWorkPage() {
	const navigate = useNavigate();
	const { user, organization, isPersonalWorkspace } = useAuthorization();
	const tasks = useSaaSStore((s) => s.tasks);
	const projects = useSaaSStore((s) => s.projects);

	const updateTaskStatus = useSaaSStore((s) => s.updateTaskStatus);
	const startTimer = useSaaSStore((s) => s.startTimer);
	const stopTimer = useSaaSStore((s) => s.stopTimer);
	const activeTimer = useSaaSStore((s) => s.activeTimer);

	const [filterView, setFilterView] = useState<
		"assigned" | "due_today" | "high_priority" | "in_progress" | "blocked" | "completed"
	>("assigned");

	const todayStr = new Date().toISOString().split("T")[0];

	// Filter tasks where user is assignee or reporter in current workspace
	const myTasks = useMemo(() => {
		return tasks.filter((t) => {
			const matchesWorkspace = isPersonalWorkspace
				? t.workspaceType === "personal"
				: t.orgId === organization?.id;
			const isMine = t.assigneeId === user.id || t.reporterId === user.id;
			return matchesWorkspace && isMine;
		});
	}, [tasks, isPersonalWorkspace, organization?.id, user.id]);

	// Filter categories per PRD Section 16
	const assignedTasks = useMemo(() => myTasks.filter((t) => t.status !== "DONE"), [myTasks]);
	const dueTodayTasks = useMemo(() => myTasks.filter((t) => t.dueDate === todayStr && t.status !== "DONE"), [myTasks, todayStr]);
	const highPriorityTasks = useMemo(() => myTasks.filter((t) => (t.priority === "HIGH" || t.priority === "URGENT") && t.status !== "DONE"), [myTasks]);
	const inProgressTasks = useMemo(() => myTasks.filter((t) => t.status === "IN_PROGRESS"), [myTasks]);
	const blockedTasks = useMemo(() => myTasks.filter((t) => t.status === "BLOCKED"), [myTasks]);
	const completedTasks = useMemo(() => myTasks.filter((t) => t.status === "DONE"), [myTasks]);

	// Today's tracked time
	const todaySeconds = useMemo(() => {
		let total = 0;
		myTasks.forEach((t) => {
			(t.timeEntries || []).forEach((entry) => {
				if (entry.date === todayStr && entry.userId === user.id) {
					total += entry.seconds;
				}
			});
		});
		if (activeTimer && activeTimer.isRunning) {
			total += activeTimer.elapsedSeconds;
		}
		return total;
	}, [myTasks, todayStr, user.id, activeTimer]);

	const todayHours = (todaySeconds / 3600).toFixed(1);

	// Display list based on selected filterView
	const displayedTasks = useMemo(() => {
		switch (filterView) {
			case "due_today":
				return dueTodayTasks;
			case "high_priority":
				return highPriorityTasks;
			case "in_progress":
				return inProgressTasks;
			case "blocked":
				return blockedTasks;
			case "completed":
				return completedTasks;
			default:
				return assignedTasks;
		}
	}, [filterView, assignedTasks, dueTodayTasks, highPriorityTasks, inProgressTasks, blockedTasks, completedTasks]);

	return (
		<div className="space-y-6 pb-16">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<Briefcase className="w-5 h-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">My Work</h1>
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						Personal execution cockpit for {user.name} ({isPersonalWorkspace ? "Personal Workspace" : organization?.name}).
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => navigate("/daily-execution")}
						className="gap-1.5 text-xs h-8 border-primary/30 text-primary hover:bg-primary/10"
					>
						<CalendarClock className="w-3.5 h-3.5" /> Submit Daily Update
					</Button>
				</div>
			</div>

			{/* Today's KPI Overview Cards */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
				<Card className="p-4 flex items-center justify-between bg-card border-border/80 shadow-2xs">
					<div className="space-y-0.5">
						<span className="text-[11px] font-semibold text-muted-foreground">Today's Tracked Time</span>
						<div className="text-2xl font-bold font-mono text-primary">{todayHours} hrs</div>
					</div>
					<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
						<Clock className="w-5 h-5" />
					</div>
				</Card>

				<Card className="p-4 flex items-center justify-between bg-card border-border/80 shadow-2xs">
					<div className="space-y-0.5">
						<span className="text-[11px] font-semibold text-muted-foreground">Active Work</span>
						<div className="text-2xl font-bold">{inProgressTasks.length} in progress</div>
					</div>
					<div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
						<Play className="w-5 h-5 fill-current" />
					</div>
				</Card>

				<Card className="p-4 flex items-center justify-between bg-card border-border/80 shadow-2xs">
					<div className="space-y-0.5">
						<span className="text-[11px] font-semibold text-muted-foreground">Blocked Items</span>
						<div className={`text-2xl font-bold ${blockedTasks.length > 0 ? "text-destructive" : "text-foreground"}`}>
							{blockedTasks.length} blocked
						</div>
					</div>
					<div className="p-2.5 rounded-xl bg-destructive/10 text-destructive">
						<AlertOctagon className="w-5 h-5" />
					</div>
				</Card>

				<Card className="p-4 flex items-center justify-between bg-card border-border/80 shadow-2xs">
					<div className="space-y-0.5">
						<span className="text-[11px] font-semibold text-muted-foreground">Completed Work</span>
						<div className="text-2xl font-bold text-success">{completedTasks.length} done</div>
					</div>
					<div className="p-2.5 rounded-xl bg-success/10 text-success">
						<CheckCircle2 className="w-5 h-5" />
					</div>
				</Card>
			</div>

			{/* Filter Tabs matching PRD Section 16 */}
			<div className="space-y-4">
				<div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-xl max-w-2xl border border-border/60">
					<Button
						variant={filterView === "assigned" ? "default" : "ghost"}
						size="sm"
						onClick={() => setFilterView("assigned")}
						className="h-7 text-xs rounded-lg px-3"
					>
						Assigned ({assignedTasks.length})
					</Button>
					<Button
						variant={filterView === "due_today" ? "default" : "ghost"}
						size="sm"
						onClick={() => setFilterView("due_today")}
						className="h-7 text-xs rounded-lg px-3"
					>
						Due Today ({dueTodayTasks.length})
					</Button>
					<Button
						variant={filterView === "high_priority" ? "default" : "ghost"}
						size="sm"
						onClick={() => setFilterView("high_priority")}
						className="h-7 text-xs rounded-lg px-3"
					>
						High Priority ({highPriorityTasks.length})
					</Button>
					<Button
						variant={filterView === "in_progress" ? "default" : "ghost"}
						size="sm"
						onClick={() => setFilterView("in_progress")}
						className="h-7 text-xs rounded-lg px-3"
					>
						In Progress ({inProgressTasks.length})
					</Button>
					<Button
						variant={filterView === "blocked" ? "default" : "ghost"}
						size="sm"
						onClick={() => setFilterView("blocked")}
						className="h-7 text-xs rounded-lg px-3 text-destructive"
					>
						Blocked ({blockedTasks.length})
					</Button>
					<Button
						variant={filterView === "completed" ? "default" : "ghost"}
						size="sm"
						onClick={() => setFilterView("completed")}
						className="h-7 text-xs rounded-lg px-3"
					>
						Completed ({completedTasks.length})
					</Button>
				</div>

				{/* Task Cards List */}
				<div className="space-y-3">
					{displayedTasks.map((task) => {
						const project = projects.find((p) => p.id === task.projectId);
						const isTiming = activeTimer?.taskId === task.id;

						return (
							<Card
								key={task.id}
								className={`p-4 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
									task.status === "BLOCKED" ? "border-destructive/40 bg-destructive/5" : ""
								}`}
							>
								<div className="space-y-1.5 min-w-0">
									<div className="flex flex-wrap items-center gap-2">
										<Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/20">
											{project?.name || "Project"}
										</Badge>
										<Badge
											variant={
												task.priority === "URGENT" || task.priority === "HIGH"
													? "destructive"
													: "secondary"
											}
											className="text-[9px] uppercase font-bold"
										>
											{task.priority}
										</Badge>
										<Badge
											variant={
												task.status === "DONE"
													? "success"
													: task.status === "BLOCKED"
													? "destructive"
													: "secondary"
											}
											className="text-[9px] uppercase font-semibold"
										>
											{task.status.replace("_", " ")}
										</Badge>
									</div>

									<h3 className="font-semibold text-sm text-foreground">{task.title}</h3>
									{task.description && (
										<p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
									)}

									<div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
										<span>Due: {task.dueDate || "No due date"}</span>
										<span>•</span>
										<span className="font-mono font-medium text-primary">
											{task.trackedSeconds ? `${(task.trackedSeconds / 3600).toFixed(1)} hrs tracked` : "0.0 hrs"}
										</span>
									</div>
								</div>

								{/* Direct Action Buttons */}
								<div className="flex items-center gap-2 shrink-0">
									{isTiming ? (
										<Button
											size="sm"
											variant="destructive"
											onClick={() => {
												stopTimer();
												toast.success("Timer stopped and session recorded to task ledger.");
											}}
											className="h-8 text-xs gap-1.5"
										>
											<Square className="w-3.5 h-3.5 fill-current" /> Stop Timer
										</Button>
									) : (
										<Button
											size="sm"
											variant="outline"
											onClick={() => {
												startTimer(task.id);
												toast.success(`Timer started for "${task.title}"`);
											}}
											className="h-8 text-xs gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
										>
											<Play className="w-3.5 h-3.5 fill-current" /> Track Time
										</Button>
									)}

									<Button
										size="sm"
										variant="ghost"
										onClick={() => {
											const nextStatus = task.status === "DONE" ? "IN_PROGRESS" : "DONE";
											updateTaskStatus(task.id, nextStatus);
											toast.success(`Task status updated to ${nextStatus}`);
										}}
										className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
									>
										<CheckCircle2 className="w-3.5 h-3.5" />
										{task.status === "DONE" ? "Reopen" : "Mark Done"}
									</Button>

									<Button
										size="sm"
										variant="ghost"
										onClick={() => navigate(`/projects/${task.projectId}?tab=board`)}
										className="h-8 text-xs text-muted-foreground hover:text-foreground"
										title="Open in Project Hub"
									>
										<ArrowRight className="w-3.5 h-3.5" />
									</Button>
								</div>
							</Card>
						);
					})}

					{displayedTasks.length === 0 && (
						<Card className="border-dashed p-10 text-center text-muted-foreground">
							<CheckCircle2 className="w-10 h-10 text-success mx-auto mb-2 opacity-80" />
							<h4 className="font-semibold text-foreground text-sm">No tasks in this view</h4>
							<p className="text-xs mt-1">You are all caught up for this category.</p>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
