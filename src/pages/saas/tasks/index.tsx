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
	Grid,
	List,
	Play,
	Square,
	AlertOctagon,
	AlertCircle,
	FolderPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import type { TaskPriority, TaskStatus, BlockerSeverity } from "@/types/saas";

export default function TasksPage() {
	const navigate = useNavigate();
	const { organization, user, isPersonalWorkspace } = useAuthorization();
	const tasks = useSaaSStore((s) => s.tasks);
	const projects = useSaaSStore((s) => s.projects);
	const users = useSaaSStore((s) => s.users);
	const createTask = useSaaSStore((s) => s.createTask);
	const updateTaskStatus = useSaaSStore((s) => s.updateTaskStatus);
	const deleteTask = useSaaSStore((s) => s.deleteTask);
	const addTaskComment = useSaaSStore((s) => s.addTaskComment);
	const startTimer = useSaaSStore((s) => s.startTimer);
	const stopTimer = useSaaSStore((s) => s.stopTimer);
	const activeTimer = useSaaSStore((s) => s.activeTimer);
	const reportTaskBlocker = useSaaSStore((s) => s.reportTaskBlocker);

	const [viewMode, setViewMode] = useState<"board" | "table">("board");
	const [filterStatus, setFilterStatus] = useState<string>("ALL");
	const [filterPriority, setFilterPriority] = useState<string>("ALL");
	const [filterProject, setFilterProject] = useState<string>("ALL");

	// Task Creation Form
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [selectedProject, setSelectedProject] = useState("");
	const [assigneeId, _setAssigneeId] = useState("");
	const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
	const [dueDate, setDueDate] = useState("2026-09-30");

	// Selected Task for Details / Comments Modal
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
	const [commentText, setCommentText] = useState("");

	// Blocker Modal
	const [blockerModalOpen, setBlockerModalOpen] = useState(false);
	const [blockerTitle, setBlockerTitle] = useState("");
	const [blockerDesc, setBlockerDesc] = useState("");
	const [blockerSeverity, setBlockerSeverity] = useState<BlockerSeverity>("HIGH");

	// Filter tasks & projects for current workspace
	const workspaceProjects = useMemo(() => {
		if (isPersonalWorkspace) {
			return projects.filter((p) => p.workspaceType === "personal");
		}
		return projects.filter((p) => p.workspaceType === "organization" && p.orgId === organization?.id);
	}, [projects, isPersonalWorkspace, organization?.id]);

	const workspaceProjectIds = useMemo(() => new Set(workspaceProjects.map((p) => p.id)), [workspaceProjects]);

	const workspaceTasks = useMemo(() => {
		return tasks.filter((t) => workspaceProjectIds.has(t.projectId));
	}, [tasks, workspaceProjectIds]);

	const filteredTasks = useMemo(() => {
		return workspaceTasks.filter((t) => {
			if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
			if (filterPriority !== "ALL" && t.priority !== filterPriority) return false;
			if (filterProject !== "ALL" && t.projectId !== filterProject) return false;
			return true;
		});
	}, [workspaceTasks, filterStatus, filterPriority, filterProject]);

	const selectedTask = workspaceTasks.find((t) => t.id === selectedTaskId);

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error("Please enter a task title");
			return;
		}
		if (!selectedProject) {
			toast.error("Please select a parent project (No Project -> No Task)");
			return;
		}

		try {
			createTask({
				projectId: selectedProject,
				title: title.trim(),
				description: description.trim(),
				status: "TODO",
				priority,
				assigneeId: assigneeId || user.id,
				reporterId: user.id,
				dueDate,
				labels: ["general"],
			});

			toast.success(`Task '${title}' created!`);
			setCreateModalOpen(false);
			setTitle("");
			setDescription("");
		} catch (err: any) {
			toast.error(err.message || "Failed to create task");
		}
	};

	const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
		updateTaskStatus(taskId, newStatus);
		toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
	};

	const handleDelete = (taskId: string, taskTitle: string) => {
		if (confirm(`Delete task '${taskTitle}'?`)) {
			deleteTask(taskId);
			toast.success("Task deleted.");
			if (selectedTaskId === taskId) setSelectedTaskId(null);
		}
	};

	const handleAddComment = () => {
		if (!commentText.trim() || !selectedTaskId) return;
		addTaskComment(selectedTaskId, commentText.trim());
		setCommentText("");
	};

	const handleReportBlockerSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedTaskId || !blockerTitle.trim()) return;

		reportTaskBlocker(selectedTaskId, blockerTitle.trim(), blockerDesc.trim(), blockerSeverity);
		toast.success("Blocker reported. Task status transitioned to BLOCKED.");
		setBlockerModalOpen(false);
		setBlockerTitle("");
		setBlockerDesc("");
	};

	const columns: TaskStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];

	return (
		<div className="space-y-6 pb-12">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<CheckSquare className="w-5 h-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">Tasks</h1>
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						{isPersonalWorkspace
							? `Personal tasks execution for ${user.name}`
							: `Task management across projects in ${organization?.name}`}
					</p>
				</div>

				<div className="flex items-center gap-2.5">
					<div className="flex items-center bg-muted/60 p-0.5 rounded-lg border">
						<Button
							variant={viewMode === "board" ? "default" : "ghost"}
							size="sm"
							onClick={() => setViewMode("board")}
							className="h-7 px-2.5 text-xs rounded-md"
						>
							<Grid className="w-3.5 h-3.5 mr-1" /> Board
						</Button>
						<Button
							variant={viewMode === "table" ? "default" : "ghost"}
							size="sm"
							onClick={() => setViewMode("table")}
							className="h-7 px-2.5 text-xs rounded-md"
						>
							<List className="w-3.5 h-3.5 mr-1" /> List
						</Button>
					</div>

					<Button
						onClick={() => {
							if (workspaceProjects.length === 0) {
								toast.error("No Project Found! You must create a project first before creating tasks.", {
									action: {
										label: "Create Project",
										onClick: () => navigate("/projects"),
									},
								});
								return;
							}
							setSelectedProject(workspaceProjects[0]?.id || "");
							setCreateModalOpen(true);
						}}
						className="gap-1.5 bg-primary hover:bg-primary/90 shadow-xs text-xs h-8"
					>
						<Plus className="w-3.5 h-3.5" /> Create Task
					</Button>
				</div>
			</div>

			{/* Filters Bar */}
			<div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-2xs">
				<div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
					<ListFilter className="w-3.5 h-3.5 text-primary" /> Filter:
				</div>

				<Select value={filterStatus} onValueChange={setFilterStatus}>
					<SelectTrigger className="h-8 text-xs w-32">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All Statuses</SelectItem>
						<SelectItem value="TODO">TODO</SelectItem>
						<SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
						<SelectItem value="BLOCKED">BLOCKED</SelectItem>
						<SelectItem value="DONE">DONE</SelectItem>
					</SelectContent>
				</Select>

				<Select value={filterPriority} onValueChange={setFilterPriority}>
					<SelectTrigger className="h-8 text-xs w-32">
						<SelectValue placeholder="Priority" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All Priorities</SelectItem>
						<SelectItem value="LOW">Low</SelectItem>
						<SelectItem value="MEDIUM">Medium</SelectItem>
						<SelectItem value="HIGH">High</SelectItem>
						<SelectItem value="URGENT">Urgent</SelectItem>
					</SelectContent>
				</Select>

				<Select value={filterProject} onValueChange={setFilterProject}>
					<SelectTrigger className="h-8 text-xs w-44">
						<SelectValue placeholder="Project" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All Projects</SelectItem>
						{workspaceProjects.map((p) => (
							<SelectItem key={p.id} value={p.id}>
								{p.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<span className="text-[11px] text-muted-foreground ml-auto">
					Showing {filteredTasks.length} of {workspaceTasks.length} tasks
				</span>
			</div>

			{/* Gatekeeper Check: "No Project -> No Task" Empty State */}
			{workspaceProjects.length === 0 ? (
				<Card className="border-dashed p-12 text-center">
					<AlertCircle className="w-12 h-12 text-warning mx-auto mb-3" />
					<h3 className="font-bold text-foreground text-base">No Project Found</h3>
					<p className="text-xs text-muted-foreground mt-1.5 max-w-md mx-auto">
						Core Principle: <strong>No Project → No Task</strong>. Tasks cannot be created without a parent
						project container. Please create a project first before adding tasks.
					</p>
					<Button onClick={() => navigate("/projects")} className="mt-4 bg-primary text-xs shadow-xs">
						<FolderPlus className="w-4 h-4 mr-1.5" /> Go to Projects to Create One
					</Button>
				</Card>
			) : viewMode === "board" ? (
				/* Board View */
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
					{columns.map((status) => {
						const colTasks = filteredTasks.filter((t) => t.status === status);
						return (
							<div
								key={status}
								className="flex flex-col rounded-2xl bg-muted/30 border border-border/80 p-3 min-h-[500px]"
							>
								<div className="flex items-center justify-between px-2 py-1.5 mb-2">
									<div className="flex items-center gap-2">
										<span className="font-bold text-xs uppercase tracking-wider text-foreground">
											{status.replace("_", " ")}
										</span>
										<span className="w-5 h-5 rounded-full bg-card flex items-center justify-center text-[10px] font-bold border">
											{colTasks.length}
										</span>
									</div>
								</div>

								<div className="space-y-2.5 flex-1">
									{colTasks.map((task) => {
										const project = projects.find((p) => p.id === task.projectId);
										const assignee = users.find((u) => u.id === task.assigneeId);
										const isTiming = activeTimer?.taskId === task.id;

										return (
											<div
												key={task.id}
												onClick={() => {
													setSelectedTaskId(task.id);
												}}
												className={`p-3.5 bg-card hover:bg-card/90 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs space-y-2.5 ${
													task.status === "BLOCKED"
														? "border-destructive/50 bg-destructive/5"
														: isTiming
														? "border-primary ring-1 ring-primary/30"
														: "border-border/70 hover:border-primary/40"
												}`}
											>
												<div className="flex items-start justify-between gap-2">
													<div>
														<div className="text-[10px] text-primary font-bold uppercase tracking-wider">
															{project?.name}
														</div>
														<h4 className="font-semibold text-xs text-foreground mt-0.5 line-clamp-2">
															{task.title}
														</h4>
													</div>
													<Badge
														variant={
															task.priority === "URGENT" || task.priority === "HIGH"
																? "destructive"
																: "secondary"
														}
														className="text-[9px] uppercase font-bold shrink-0"
													>
														{task.priority}
													</Badge>
												</div>

												{task.description && (
													<p className="text-[11px] text-muted-foreground line-clamp-2">{task.description}</p>
												)}

												<div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
													<div className="flex items-center gap-1.5">
														{assignee && (
															<Avatar className="w-4 h-4">
																<AvatarImage src={assignee.avatar} />
																<AvatarFallback className="text-[8px]">{assignee.name[0]}</AvatarFallback>
															</Avatar>
														)}
														<span className="truncate max-w-[80px]">{assignee?.name.split(" ")[0] || "Unassigned"}</span>
													</div>
													<span>{task.dueDate || "No date"}</span>
												</div>

												{/* Quick Status and Timer bar */}
												<div
													className="pt-1 flex items-center justify-between gap-1 text-[9px]"
													onClick={(e) => e.stopPropagation()}
												>
													<div className="flex items-center gap-1">
														{columns
															.filter((s) => s !== task.status)
															.map((next) => (
																<button
																	key={next}
																	type="button"
																	onClick={() => handleStatusChange(task.id, next)}
																	className="px-1.5 py-0.5 rounded bg-muted hover:bg-primary hover:text-primary-foreground transition-colors font-semibold"
																>
																	{next === "IN_PROGRESS" ? "PROG" : next}
																</button>
															))}
													</div>

													{isTiming ? (
														<button
															type="button"
															onClick={() => stopTimer()}
															className="text-destructive font-semibold flex items-center gap-0.5 hover:underline"
														>
															<Square className="w-2.5 h-2.5 fill-current" /> Stop
														</button>
													) : (
														<button
															type="button"
															onClick={() => startTimer(task.id)}
															className="text-primary font-semibold flex items-center gap-0.5 hover:underline"
														>
															<Play className="w-2.5 h-2.5 fill-current" /> Track
														</button>
													)}
												</div>
											</div>
										);
									})}

									{colTasks.length === 0 && (
										<div className="h-24 border border-dashed rounded-xl flex items-center justify-center text-xs text-muted-foreground/60">
											No tasks
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			) : (
				/* Table View */
				<Card>
					<CardContent className="p-0">
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse text-xs">
								<thead>
									<tr className="border-y border-border/80 bg-muted/40 text-muted-foreground font-semibold">
										<th className="py-2.5 px-4">Task</th>
										<th className="py-2.5 px-3">Project</th>
										<th className="py-2.5 px-3">Status</th>
										<th className="py-2.5 px-3">Priority</th>
										<th className="py-2.5 px-3">Assignee</th>
										<th className="py-2.5 px-3">Due Date</th>
										<th className="py-2.5 px-4 text-right">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border/60">
									{filteredTasks.map((task) => {
										const project = projects.find((p) => p.id === task.projectId);
										const assignee = users.find((u) => u.id === task.assigneeId);
										const isTiming = activeTimer?.taskId === task.id;

										return (
											<tr
												key={task.id}
												className="hover:bg-muted/30 transition-colors cursor-pointer"
												onClick={() => setSelectedTaskId(task.id)}
											>
												<td className="py-3 px-4 font-semibold text-foreground max-w-xs truncate">
													{task.title}
												</td>
												<td className="py-3 px-3 text-primary font-medium">{project?.name}</td>
												<td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
													<Select
														value={task.status}
														onValueChange={(v) => handleStatusChange(task.id, v as TaskStatus)}
													>
														<SelectTrigger className="h-7 text-[11px] w-28">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="TODO">TODO</SelectItem>
															<SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
															<SelectItem value="BLOCKED">BLOCKED</SelectItem>
															<SelectItem value="DONE">DONE</SelectItem>
														</SelectContent>
													</Select>
												</td>
												<td className="py-3 px-3">
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
												<td className="py-3 px-3">
													{assignee ? (
														<div className="flex items-center gap-1.5">
															<Avatar className="w-5 h-5">
																<AvatarImage src={assignee.avatar} />
																<AvatarFallback className="text-[9px]">{assignee.name[0]}</AvatarFallback>
															</Avatar>
															<span className="truncate max-w-[100px]">{assignee.name}</span>
														</div>
													) : (
														<span className="text-muted-foreground">Unassigned</span>
													)}
												</td>
												<td className="py-3 px-3 text-muted-foreground">{task.dueDate || "—"}</td>
												<td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
													<div className="flex items-center justify-end gap-1">
														{isTiming ? (
															<Button
																size="sm"
																variant="ghost"
																onClick={() => stopTimer()}
																className="h-7 text-xs text-destructive hover:bg-destructive/10"
															>
																<Square className="w-3 h-3 mr-1 fill-current" /> Stop
															</Button>
														) : (
															<Button
																size="sm"
																variant="ghost"
																onClick={() => startTimer(task.id)}
																className="h-7 text-xs text-primary hover:bg-primary/10"
															>
																<Play className="w-3 h-3 mr-1 fill-current" /> Track
															</Button>
														)}
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleDelete(task.id, task.title)}
															className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 rounded-md"
														>
															<Trash2 className="w-3.5 h-3.5" />
														</Button>
													</div>
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

			{/* Create Task Modal */}
			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				<DialogContent className="sm:max-w-[480px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-base">
							<CheckSquare className="w-5 h-5 text-primary" /> Create Task
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Tasks exist inside projects. (No Project → No Task)
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleCreate} className="space-y-3.5 py-2">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Parent Project *</Label>
							<Select value={selectedProject} onValueChange={setSelectedProject}>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue placeholder="Select parent project" />
								</SelectTrigger>
								<SelectContent>
									{workspaceProjects.map((p) => (
										<SelectItem key={p.id} value={p.id}>
											{p.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

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
								placeholder="Detailed specifications or reproduction steps..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="text-xs resize-none h-18"
							/>
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

						<DialogFooter className="gap-2 pt-2">
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

			{/* Task Detail Modal */}
			<Dialog open={!!selectedTask} onOpenChange={() => setSelectedTaskId(null)}>
				<DialogContent className="sm:max-w-[540px]">
					{selectedTask && (
						<div className="space-y-4">
							<DialogHeader>
								<div className="flex items-center gap-2 mb-1">
									<Badge
										variant={selectedTask.status === "DONE" ? "success" : "secondary"}
										className="text-[10px] uppercase font-bold"
									>
										{selectedTask.status.replace("_", " ")}
									</Badge>
									<Badge
										variant={
											selectedTask.priority === "HIGH" || selectedTask.priority === "URGENT"
												? "destructive"
												: "outline"
										}
										className="text-[10px] uppercase font-bold"
									>
										{selectedTask.priority}
									</Badge>
								</div>
								<DialogTitle className="text-base font-bold text-foreground">
									{selectedTask.title}
								</DialogTitle>
								<DialogDescription className="text-xs text-muted-foreground">
									Project:{" "}
									<strong>{projects.find((p) => p.id === selectedTask.projectId)?.name || "Project"}</strong>
								</DialogDescription>
							</DialogHeader>

							<p className="text-xs text-foreground/90 bg-muted/30 p-3 rounded-lg border">
								{selectedTask.description || "No description provided."}
							</p>

							{/* Actions Bar */}
							<div className="flex items-center gap-2 p-3 bg-muted/40 rounded-xl border">
								{activeTimer?.taskId === selectedTask.id ? (
									<Button
										size="sm"
										variant="destructive"
										onClick={() => stopTimer()}
										className="h-8 text-xs"
									>
										<Square className="w-3.5 h-3.5 mr-1 fill-current" /> Stop Timer
									</Button>
								) : (
									<Button
										size="sm"
										onClick={() => startTimer(selectedTask.id)}
										className="h-8 text-xs bg-primary hover:bg-primary/90"
									>
										<Play className="w-3.5 h-3.5 mr-1 fill-current" /> Start Timer
									</Button>
								)}

								<Button
									size="sm"
									variant="outline"
									onClick={() => setBlockerModalOpen(true)}
									className="h-8 text-xs text-destructive hover:bg-destructive/10"
								>
									<AlertOctagon className="w-3.5 h-3.5 mr-1" /> Report Blocker
								</Button>

								<div className="ml-auto font-mono text-xs font-semibold text-primary">
									{selectedTask.trackedSeconds ? `${(selectedTask.trackedSeconds / 3600).toFixed(1)} hrs` : "0 hrs"}
								</div>
							</div>

							{/* Comments */}
							<div className="space-y-3 pt-2">
								<h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
									<MessageSquare className="w-3.5 h-3.5 text-primary" /> Comments ({selectedTask.comments?.length || 0})
								</h4>
								<div className="space-y-2 max-h-40 overflow-y-auto">
									{selectedTask.comments?.map((c) => {
										const commenter = users.find((u) => u.id === c.userId);
										return (
											<div key={c.id} className="p-2 rounded-lg bg-muted/40 text-xs space-y-0.5">
												<div className="flex items-center justify-between text-[10px] text-muted-foreground">
													<span className="font-semibold text-foreground">{commenter?.name || "Member"}</span>
													<span>{new Date(c.createdAt).toLocaleTimeString()}</span>
												</div>
												<p>{c.content}</p>
											</div>
										);
									})}
								</div>
								<div className="flex items-center gap-2 pt-1">
									<Input
										placeholder="Add a comment..."
										value={commentText}
										onChange={(e) => setCommentText(e.target.value)}
										className="h-8 text-xs"
									/>
									<Button size="sm" onClick={handleAddComment} className="h-8 text-xs">
										Send
									</Button>
								</div>
							</div>

							<DialogFooter className="gap-2 pt-2 border-t">
								<Button variant="outline" size="sm" onClick={() => setSelectedTaskId(null)}>
									Close
								</Button>
							</DialogFooter>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Blocker Modal */}
			<Dialog open={blockerModalOpen} onOpenChange={setBlockerModalOpen}>
				<DialogContent className="sm:max-w-[440px]">
					<DialogHeader>
						<DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
							<AlertOctagon className="w-4 h-4" /> Report Blocker on Task
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Reporting a blocker automatically sets this task to <strong>BLOCKED</strong>.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleReportBlockerSubmit} className="space-y-3 py-2">
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Blocker Title *</Label>
							<Input
								placeholder="e.g. Waiting on API credentials or firewall whitelist"
								value={blockerTitle}
								onChange={(e) => setBlockerTitle(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Severity</Label>
							<Select value={blockerSeverity} onValueChange={(v) => setBlockerSeverity(v as BlockerSeverity)}>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="LOW">Low</SelectItem>
									<SelectItem value="MEDIUM">Medium</SelectItem>
									<SelectItem value="HIGH">High</SelectItem>
									<SelectItem value="CRITICAL">Critical</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Details</Label>
							<Textarea
								placeholder="Describe what is blocked and needed resolution..."
								value={blockerDesc}
								onChange={(e) => setBlockerDesc(e.target.value)}
								className="text-xs resize-none h-16"
							/>
						</div>
						<DialogFooter className="gap-2 pt-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setBlockerModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" variant="destructive">
								Submit Blocker
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
