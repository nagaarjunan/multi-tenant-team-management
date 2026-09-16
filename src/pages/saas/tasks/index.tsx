import React, { useState, useMemo } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useSaaSStore } from "@/store/saasStore";
import { Button } from "@/ui/button";
import { Card, CardContent } from "@/ui/card";
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
import { Textarea } from "@/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import {
	CheckSquare,
	Plus,
	ListFilter,
	MessageSquare,
	Trash2,
	Send,
	Grid,
} from "lucide-react";
import { toast } from "sonner";
import type { Task, TaskPriority, TaskStatus } from "@/types/saas";

export default function TasksPage() {
	const { organization, activeOrgMembers, user, can } = useAuthorization();
	const tasks = useSaaSStore((s) => s.tasks);
	const projects = useSaaSStore((s) => s.projects);
	const teams = useSaaSStore((s) => s.teams);
	const users = useSaaSStore((s) => s.users);
	const createTask = useSaaSStore((s) => s.createTask);
	const updateTaskStatus = useSaaSStore((s) => s.updateTaskStatus);
	const deleteTask = useSaaSStore((s) => s.deleteTask);
	const addTaskComment = useSaaSStore((s) => s.addTaskComment);

	const [viewMode, setViewMode] = useState<"board" | "table">("board");
	const [filterStatus, setFilterStatus] = useState<string>("ALL");
	const [filterPriority, setFilterPriority] = useState<string>("ALL");
	const [filterProject, setFilterProject] = useState<string>("ALL");

	// Task Creation Form
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [selectedProject, setSelectedProject] = useState("");
	const [selectedTeam, setSelectedTeam] = useState("");
	const [assigneeId, setAssigneeId] = useState("");
	const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
	const [dueDate, setDueDate] = useState("2026-09-25");
	const [labelsInput] = useState("backend, security");

	// Selected Task for Details / Comments Modal
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [commentText, setCommentText] = useState("");

	// Filter tasks for active organization
	const orgTasks = useMemo(() => tasks.filter((t) => t.orgId === organization?.id), [tasks, organization?.id]);
	const orgProjects = useMemo(() => projects.filter((p) => p.orgId === organization?.id), [projects, organization?.id]);
	const orgTeams = useMemo(() => teams.filter((t) => t.orgId === organization?.id), [teams, organization?.id]);

	const filteredTasks = useMemo(() => {
		return orgTasks.filter((t) => {
			if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
			if (filterPriority !== "ALL" && t.priority !== filterPriority) return false;
			if (filterProject !== "ALL" && t.projectId !== filterProject) return false;
			return true;
		});
	}, [orgTasks, filterStatus, filterPriority, filterProject]);

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error("Please enter a task title");
			return;
		}
		if (!selectedProject) {
			toast.error("Please select a project");
			return;
		}
		if (!organization || !user) return;

		const labels = labelsInput.split(",").map((l) => l.trim()).filter(Boolean);

		createTask({
			orgId: organization.id,
			projectId: selectedProject,
			teamId: selectedTeam || undefined,
			title: title.trim(),
			description: description.trim(),
			status: "TODO",
			priority,
			assigneeId: assigneeId || undefined,
			reporterId: user.id,
			dueDate,
			labels,
		});

		toast.success(`Task '${title}' created!`);
		setCreateModalOpen(false);
		setTitle("");
		setDescription("");
	};

	const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
		const task = tasks.find((t) => t.id === taskId);
		if (!task) return;

		// Check RBAC permission on this resource
		if (!can("task.status.change", task)) {
			toast.error("You don't have permission to modify this task.");
			return;
		}

		updateTaskStatus(taskId, newStatus);
		toast.success(`Status updated to ${newStatus}`);
		if (selectedTask?.id === taskId) {
			setSelectedTask({ ...selectedTask, status: newStatus });
		}
	};

	const handleDelete = (taskId: string, taskTitle: string) => {
		const task = tasks.find((t) => t.id === taskId);
		if (!task) return;

		if (!can("task.delete", task)) {
			toast.error("You don't have permission to delete this task.");
			return;
		}

		if (confirm(`Delete task '${taskTitle}'?`)) {
			deleteTask(taskId);
			toast.success("Task deleted.");
			if (selectedTask?.id === taskId) setSelectedTask(null);
		}
	};

	const handleAddComment = () => {
		if (!commentText.trim() || !selectedTask) return;
		addTaskComment(selectedTask.id, commentText.trim());
		setCommentText("");
		// Refresh selected task
		const updated = tasks.find((t) => t.id === selectedTask.id);
		if (updated) setSelectedTask(updated);
		toast.success("Comment added.");
	};

	const columns: { status: TaskStatus; title: string; color: string }[] = [
		{ status: "TODO", title: "To Do", color: "border-muted-foreground/30" },
		{ status: "IN_PROGRESS", title: "In Progress", color: "border-info/40" },
		{ status: "BLOCKED", title: "Blocked", color: "border-destructive/40" },
		{ status: "DONE", title: "Completed", color: "border-success/40" },
	];

	return (
		<div className="space-y-6 pb-12">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<CheckSquare className="w-5 h-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">Task Management</h1>
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						Collaborative sprint board and task list with resource-level authorization.
					</p>
				</div>

				<div className="flex items-center gap-2 flex-wrap">
					<div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/60">
						<Button
							variant={viewMode === "board" ? "default" : "ghost"}
							size="sm"
							onClick={() => setViewMode("board")}
							className="h-7 px-2.5 text-xs gap-1.5"
						>
							<Grid className="w-3.5 h-3.5" /> Board
						</Button>
						<Button
							variant={viewMode === "table" ? "default" : "ghost"}
							size="sm"
							onClick={() => setViewMode("table")}
							className="h-7 px-2.5 text-xs gap-1.5"
						>
							<ListFilter className="w-3.5 h-3.5" /> List
						</Button>
					</div>

					{can("task.create") && (
						<Button
							onClick={() => {
								setSelectedProject(orgProjects[0]?.id || "");
								setSelectedTeam(orgTeams[0]?.id || "");
								setAssigneeId(user?.id || "");
								setCreateModalOpen(true);
							}}
							className="gap-2 bg-primary hover:bg-primary/90 shadow-xs h-9"
						>
							<Plus className="w-4 h-4" /> Create Task
						</Button>
					)}
				</div>
			</div>

			{/* Filter Bar */}
			<div className="flex flex-wrap items-center gap-3 p-3 bg-card rounded-xl border border-border/60 text-xs">
				<div className="flex items-center gap-2">
					<span className="text-muted-foreground font-medium">Status:</span>
					<Select value={filterStatus} onValueChange={setFilterStatus}>
						<SelectTrigger className="h-8 text-xs w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Statuses</SelectItem>
							<SelectItem value="TODO">To Do</SelectItem>
							<SelectItem value="IN_PROGRESS">In Progress</SelectItem>
							<SelectItem value="BLOCKED">Blocked</SelectItem>
							<SelectItem value="DONE">Completed</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-muted-foreground font-medium">Priority:</span>
					<Select value={filterPriority} onValueChange={setFilterPriority}>
						<SelectTrigger className="h-8 text-xs w-32">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Priorities</SelectItem>
							<SelectItem value="URGENT">Urgent</SelectItem>
							<SelectItem value="HIGH">High</SelectItem>
							<SelectItem value="MEDIUM">Medium</SelectItem>
							<SelectItem value="LOW">Low</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-muted-foreground font-medium">Project:</span>
					<Select value={filterProject} onValueChange={setFilterProject}>
						<SelectTrigger className="h-8 text-xs w-40">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">All Projects</SelectItem>
							{orgProjects.map((p) => (
								<SelectItem key={p.id} value={p.id}>
									{p.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="ml-auto text-muted-foreground">
					Showing <strong>{filteredTasks.length}</strong> tasks
				</div>
			</div>

			{/* 1. Kanban Board View */}
			{viewMode === "board" && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{columns.map((col) => {
						const colTasks = filteredTasks.filter((t) => t.status === col.status);
						return (
							<div key={col.status} className="space-y-3 bg-muted/20 p-3 rounded-xl border border-border/50 flex flex-col min-h-[500px]">
								<div className="flex items-center justify-between pb-2 border-b border-border/40">
									<div className="flex items-center gap-2">
										<span className="font-semibold text-xs text-foreground">{col.title}</span>
										<Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
											{colTasks.length}
										</Badge>
									</div>
								</div>

								<div className="space-y-3 flex-1 overflow-y-auto">
									{colTasks.map((task) => {
										const assignee = users.find((u) => u.id === task.assigneeId);
										const project = projects.find((p) => p.id === task.projectId);

										return (
											<Card
												key={task.id}
												onClick={() => setSelectedTask(task)}
												className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all p-3.5 space-y-2.5 bg-card border-border/60 shadow-xs"
											>
												<div className="flex items-start justify-between gap-1">
													<Badge variant="outline" className="text-[9px] uppercase tracking-wider text-muted-foreground">
														{project?.name || "General"}
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
												</div>

												<h4 className="text-xs font-semibold text-foreground line-clamp-2">
													{task.title}
												</h4>

												<div className="flex items-center justify-between pt-2 border-t border-border/30 text-[11px] text-muted-foreground">
													<div className="flex items-center gap-1.5">
														<Avatar className="w-4 h-4">
															<AvatarImage src={assignee?.avatar} />
															<AvatarFallback className="text-[8px]">{assignee?.name?.charAt(0)}</AvatarFallback>
														</Avatar>
														<span className="text-[10px] truncate max-w-[80px]">
															{assignee?.name?.split(" ")[0] || "Unassigned"}
														</span>
													</div>

													<div className="flex items-center gap-2 text-[10px]">
														{task.comments?.length > 0 && (
															<span className="flex items-center gap-0.5 text-muted-foreground">
																<MessageSquare className="w-3 h-3" /> {task.comments.length}
															</span>
														)}
														<span className="text-muted-foreground">{task.dueDate?.split("-").slice(1).join("/")}</span>
													</div>
												</div>
											</Card>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* 2. List / Table View */}
			{viewMode === "table" && (
				<Card>
					<CardContent className="p-0">
						<div className="overflow-x-auto">
							<table className="w-full text-xs text-left">
								<thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
									<tr>
										<th className="p-3">Title</th>
										<th className="p-3">Project</th>
										<th className="p-3">Status</th>
										<th className="p-3">Priority</th>
										<th className="p-3">Assignee</th>
										<th className="p-3">Due Date</th>
										<th className="p-3 text-right">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border/40">
									{filteredTasks.map((task) => {
										const assignee = users.find((u) => u.id === task.assigneeId);
										const project = projects.find((p) => p.id === task.projectId);

										return (
											<tr
												key={task.id}
												className="hover:bg-accent/40 cursor-pointer transition-colors"
												onClick={() => setSelectedTask(task)}
											>
												<td className="p-3 font-semibold text-foreground max-w-[240px] truncate">
													{task.title}
												</td>
												<td className="p-3 text-muted-foreground truncate">{project?.name || "—"}</td>
												<td className="p-3">
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
														className="text-[10px]"
													>
														{task.status.replace("_", " ")}
													</Badge>
												</td>
												<td className="p-3">
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
												</td>
												<td className="p-3">
													<div className="flex items-center gap-1.5">
														<Avatar className="w-4 h-4">
															<AvatarImage src={assignee?.avatar} />
															<AvatarFallback className="text-[8px]">{assignee?.name?.charAt(0)}</AvatarFallback>
														</Avatar>
														<span>{assignee?.name || "Unassigned"}</span>
													</div>
												</td>
												<td className="p-3 text-muted-foreground">{task.dueDate || "—"}</td>
												<td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
													{can("task.delete", task) && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDelete(task.id, task.title)}
															className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
														>
															<Trash2 className="w-3.5 h-3.5" />
														</Button>
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

			{/* Task Details & Comments Dialog */}
			{selectedTask && (
				<Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
					<DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
						<DialogHeader>
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="text-[10px] uppercase font-medium">
									{projects.find((p) => p.id === selectedTask.projectId)?.name || "Task"}
								</Badge>
								<Badge
									variant={selectedTask.priority === "URGENT" ? "destructive" : "secondary"}
									className="text-[10px] uppercase font-bold"
								>
									{selectedTask.priority}
								</Badge>
							</div>
							<DialogTitle className="text-lg font-bold text-foreground mt-1">
								{selectedTask.title}
							</DialogTitle>
						</DialogHeader>

						<div className="space-y-4 py-2 text-xs">
							{/* Description */}
							<div className="space-y-1">
								<span className="font-semibold text-muted-foreground uppercase text-[10px]">Description</span>
								<p className="text-foreground bg-muted/20 p-3 rounded-lg border border-border/40">
									{selectedTask.description || "No description provided."}
								</p>
							</div>

							{/* Status Changer Buttons */}
							<div className="space-y-1.5">
								<span className="font-semibold text-muted-foreground uppercase text-[10px]">Status Workflow</span>
								<div className="flex items-center gap-1.5 flex-wrap">
									{(["TODO", "IN_PROGRESS", "BLOCKED", "DONE"] as TaskStatus[]).map((st) => (
										<Button
											key={st}
											size="sm"
											variant={selectedTask.status === st ? "default" : "outline"}
											onClick={() => handleStatusChange(selectedTask.id, st)}
											className="h-7 text-xs"
										>
											{st.replace("_", " ")}
										</Button>
									))}
								</div>
							</div>

							{/* Comments Section */}
							<div className="space-y-2 pt-2 border-t border-border/40">
								<span className="font-semibold text-foreground flex items-center gap-1.5">
									<MessageSquare className="w-3.5 h-3.5" /> Comments ({selectedTask.comments?.length || 0})
								</span>

								<div className="space-y-2 max-h-40 overflow-y-auto pr-1">
									{selectedTask.comments?.length === 0 ? (
										<p className="text-muted-foreground text-xs italic">No comments on this task yet.</p>
									) : (
										selectedTask.comments?.map((cm) => {
											const cmUser = users.find((u) => u.id === cm.userId);
											return (
												<div key={cm.id} className="p-2.5 rounded-lg bg-muted/30 border border-border/40 space-y-1">
													<div className="flex items-center justify-between text-[11px]">
														<span className="font-semibold text-foreground">{cmUser?.name || "User"}</span>
														<span className="text-muted-foreground text-[10px]">
															{new Date(cm.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
														</span>
													</div>
													<p className="text-foreground text-xs">{cm.content}</p>
												</div>
											);
										})
									)}
								</div>

								{/* Add comment input */}
								<div className="flex items-center gap-2 pt-1">
									<Input
										placeholder="Add a comment or update..."
										value={commentText}
										onChange={(e) => setCommentText(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
										className="h-8 text-xs"
									/>
									<Button size="sm" onClick={handleAddComment} className="h-8 px-2.5 bg-primary">
										<Send className="w-3.5 h-3.5" />
									</Button>
								</div>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			)}

			{/* Create Task Dialog */}
			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<CheckSquare className="w-5 h-5 text-primary" /> Create New Task
						</DialogTitle>
						<DialogDescription className="text-xs">
							Assign work items with priority, milestone deadlines, and project alignment.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleCreate} className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Task Title *</Label>
							<Input
								placeholder="e.g. Implement webhook signature verification"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Description</Label>
							<Textarea
								placeholder="Acceptance criteria and implementation details"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="text-xs resize-none"
								rows={2}
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Project *</Label>
								<Select value={selectedProject} onValueChange={setSelectedProject}>
									<SelectTrigger className="h-9 text-xs">
										<SelectValue placeholder="Select project" />
									</SelectTrigger>
									<SelectContent>
										{orgProjects.map((p) => (
											<SelectItem key={p.id} value={p.id}>
												{p.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Assignee</Label>
								<Select value={assigneeId} onValueChange={setAssigneeId}>
									<SelectTrigger className="h-9 text-xs">
										<SelectValue placeholder="Assign team member" />
									</SelectTrigger>
									<SelectContent>
										{activeOrgMembers.map((m) => (
											<SelectItem key={m.user.id} value={m.user.id}>
												{m.user.name} ({m.membership.role})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Priority</Label>
								<Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
									<SelectTrigger className="h-9 text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="LOW">Low</SelectItem>
										<SelectItem value="MEDIUM">Medium</SelectItem>
										<SelectItem value="HIGH">High</SelectItem>
										<SelectItem value="URGENT">Urgent</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Due Date</Label>
								<Input
									type="date"
									value={dueDate}
									onChange={(e) => setDueDate(e.target.value)}
									className="h-9 text-xs"
								/>
							</div>
						</div>

						<DialogFooter className="pt-3 gap-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								Create Task
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
