import React, { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import { useSaaSStore } from "@/store/saasStore";
import { useAuthorization } from "@/hooks/useAuthorization";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import {
	FolderKanban,
	LayoutDashboard,
	List,
	Calendar as CalendarIcon,
	MessageSquare,
	FileText,
	Users,
	Activity,
	BarChart3,
	Plus,
	MoreVertical,
	CheckCircle2,
	Clock,
	AlertOctagon,
	Send,
	Eye,
	Download,
	Trash2,
	Crown,
	UserPlus,
	Play,
	Square,
	ArrowLeft,
	Search,
} from "lucide-react";
import { toast } from "sonner";
import type { TaskPriority, TaskStatus, BlockerSeverity, ProjectFile } from "@/types/saas";

export default function ProjectDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTab = searchParams.get("tab") || "board";

	const { user, isOwner, isAdmin } = useAuthorization();
	const projects = useSaaSStore((s) => s.projects);
	const tasks = useSaaSStore((s) => s.tasks);
	const users = useSaaSStore((s) => s.users);
	const chatMessages = useSaaSStore((s) => s.chatMessages);
	const projectFiles = useSaaSStore((s) => s.projectFiles);

	const auditLogs = useSaaSStore((s) => s.auditLogs);
	const activeTimer = useSaaSStore((s) => s.activeTimer);

	// Actions
	const createTask = useSaaSStore((s) => s.createTask);
	const updateTaskStatus = useSaaSStore((s) => s.updateTaskStatus);

	const addTaskComment = useSaaSStore((s) => s.addTaskComment);
	const startTimer = useSaaSStore((s) => s.startTimer);
	const stopTimer = useSaaSStore((s) => s.stopTimer);
	const reportTaskBlocker = useSaaSStore((s) => s.reportTaskBlocker);
	const sendChatMessage = useSaaSStore((s) => s.sendChatMessage);
	const deleteChatMessage = useSaaSStore((s) => s.deleteChatMessage);
	const toggleChatReaction = useSaaSStore((s) => s.toggleChatReaction);
	const convertChatMessageToTask = useSaaSStore((s) => s.convertChatMessageToTask);
	const uploadProjectFile = useSaaSStore((s) => s.uploadProjectFile);
	const deleteProjectFile = useSaaSStore((s) => s.deleteProjectFile);
	const setProjectLead = useSaaSStore((s) => s.setProjectLead);

	const removeProjectMember = useSaaSStore((s) => s.removeProjectMember);

	// Current Project
	const project = useMemo(() => projects.find((p) => p.id === id), [projects, id]);

	// Tasks for this project
	const projectTasks = useMemo(() => tasks.filter((t) => t.projectId === id), [tasks, id]);

	// Chat for this project
	const messages = useMemo(() => chatMessages.filter((m) => m.projectId === id), [chatMessages, id]);

	// Files for this project
	const files = useMemo(() => projectFiles.filter((f) => f.projectId === id), [projectFiles, id]);

	// Members of this project
	const projectMembers = useMemo(() => {
		if (!project) return [];
		return users.filter((u) => project.memberIds.includes(u.id));
	}, [project, users]);

	// Activity logs for this project
	const projectLogs = useMemo(() => {
		return auditLogs.filter((l) => l.resourceId === id || projectTasks.some((t) => t.id === l.resourceId));
	}, [auditLogs, id, projectTasks]);

	// Modals State
	const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
	const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
	const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null);
	const [_addMemberModalOpen, setAddMemberModalOpen] = useState(false);
	const [convertModalOpen, setConvertModalOpen] = useState(false);
	const [convertingMsgId, setConvertingMsgId] = useState<string | null>(null);
	const [convertTaskTitle, setConvertTaskTitle] = useState("");

	// New Task Form
	const [taskTitle, setTaskTitle] = useState("");
	const [taskDesc, setTaskDesc] = useState("");
	const [taskPriority, setTaskPriority] = useState<TaskPriority>("MEDIUM");
	const [taskAssignee, setTaskAssignee] = useState<string>(user?.id || "");
	const [taskDueDate, setTaskDueDate] = useState("2026-09-30");

	// Chat Input State
	const [chatInput, setChatInput] = useState("");
	const [chatSearch, setChatSearch] = useState("");

	// Comment Input State
	const [commentText, setCommentText] = useState("");

	// File Upload State
	const [uploadModalOpen, setUploadModalOpen] = useState(false);
	const [fileName, setFileName] = useState("");
	const [fileType, setFileType] = useState("document");

	// Blocker reporting state in task detail
	const [blockerModalOpen, setBlockerModalOpen] = useState(false);
	const [blockerTitle, setBlockerTitle] = useState("");
	const [blockerDesc, setBlockerDesc] = useState("");
	const [blockerSeverity, setBlockerSeverity] = useState<BlockerSeverity>("HIGH");

	if (!project) {
		return (
			<div className="p-8 text-center space-y-4">
				<FolderKanban className="w-12 h-12 text-muted-foreground/40 mx-auto" />
				<h2 className="text-lg font-bold">Project Not Found</h2>
				<p className="text-xs text-muted-foreground">The project you are looking for does not exist or has been removed.</p>
				<Button onClick={() => navigate("/projects")} variant="outline" size="sm">
					<ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
				</Button>
			</div>
		);
	}

	const selectedTask = projectTasks.find((t) => t.id === selectedTaskId);
	const leadUser = users.find((u) => u.id === project.leadId);

	const handleCreateTaskSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!taskTitle.trim()) {
			toast.error("Please enter task title");
			return;
		}

		createTask({
			projectId: project.id,
			title: taskTitle.trim(),
			description: taskDesc.trim(),
			status: "TODO",
			priority: taskPriority,
			assigneeId: taskAssignee || undefined,
			reporterId: user.id,
			dueDate: taskDueDate,
			labels: ["project-task"],
		});

		toast.success(`Task "${taskTitle}" created!`);
		setCreateTaskModalOpen(false);
		setTaskTitle("");
		setTaskDesc("");
	};

	const handleSendChat = (e: React.FormEvent) => {
		e.preventDefault();
		if (!chatInput.trim()) return;

		sendChatMessage(project.id, chatInput.trim());
		setChatInput("");
	};

	const handleConvertMsgToTask = (e: React.FormEvent) => {
		e.preventDefault();
		if (!convertingMsgId || !convertTaskTitle.trim()) return;

		try {
			convertChatMessageToTask(convertingMsgId, convertTaskTitle.trim(), user.id);
			toast.success("Converted chat message to task!");
			setConvertModalOpen(false);
			setConvertingMsgId(null);
			setConvertTaskTitle("");
		} catch (err: any) {
			toast.error(err.message || "Failed to convert message");
		}
	};

	const handleFileUpload = (e: React.FormEvent) => {
		e.preventDefault();
		if (!fileName.trim()) {
			toast.error("Please enter file name");
			return;
		}

		uploadProjectFile({
			projectId: project.id,
			name: fileName.trim(),
			size: "1.2 MB",
			type: fileType,
			url: fileType === "image" ? "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80" : "https://example.com/file",
			uploadedBy: user.id,
		});

		toast.success(`File "${fileName}" uploaded to project!`);
		setUploadModalOpen(false);
		setFileName("");
	};

	const handleReportTaskBlocker = (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedTaskId || !blockerTitle.trim()) return;

		reportTaskBlocker(selectedTaskId, blockerTitle.trim(), blockerDesc.trim(), blockerSeverity);
		toast.success("Blocker submitted. Task status is now BLOCKED.");
		setBlockerModalOpen(false);
		setBlockerTitle("");
		setBlockerDesc("");
	};

	const handleAddComment = () => {
		if (!commentText.trim() || !selectedTaskId) return;
		addTaskComment(selectedTaskId, commentText.trim());
		setCommentText("");
	};

	// Kanban columns
	const columns: TaskStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];

	// Task metrics
	const completedCount = projectTasks.filter((t) => t.status === "DONE").length;

	const blockedCount = projectTasks.filter((t) => t.status === "BLOCKED").length;
	const totalHoursTracked = (projectTasks.reduce((acc, t) => acc + (t.trackedSeconds || 0), 0) / 3600).toFixed(1);
	const completionRate = projectTasks.length > 0 ? Math.round((completedCount / projectTasks.length) * 100) : 0;

	return (
		<div className="space-y-6 pb-16">
			{/* Project Header Banner */}
			<div className="flex flex-col gap-4 bg-card/70 border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs backdrop-blur-xs">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-start gap-3.5 min-w-0">
						<Button
							variant="outline"
							size="icon"
							onClick={() => navigate("/projects")}
							className="h-9 w-9 rounded-xl shrink-0 mt-0.5"
							title="Back to Projects"
						>
							<ArrowLeft className="w-4 h-4" />
						</Button>
						<div className="space-y-1 min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								<h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
									{project.name}
								</h1>
								<Badge variant={project.status === "COMPLETED" ? "success" : "info"} className="text-[10px] uppercase font-bold">
									{project.status}
								</Badge>
								<Badge variant="outline" className="text-[10px] uppercase font-semibold">
									{project.workspaceType}
								</Badge>
							</div>
							<p className="text-xs text-muted-foreground max-w-2xl">{project.description}</p>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex items-center gap-2 shrink-0">
						<Button
							onClick={() => setCreateTaskModalOpen(true)}
							size="sm"
							className="bg-primary hover:bg-primary/90 text-xs shadow-xs"
						>
							<Plus className="w-3.5 h-3.5 mr-1" /> Create Task
						</Button>
					</div>
				</div>

				{/* Metadata Sub-bar */}
				<div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/60 text-xs text-muted-foreground">
					<div className="flex flex-wrap items-center gap-4">
						{leadUser ? (
							<div className="flex items-center gap-1.5 bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/20">
								<Crown className="w-3.5 h-3.5 text-primary" />
								<span className="text-[11px] font-semibold text-foreground">Project Lead:</span>
								<span className="text-[11px] font-medium text-primary">{leadUser.name}</span>
							</div>
						) : (
							<div className="flex items-center gap-1.5 text-[11px]">
								<Crown className="w-3.5 h-3.5 text-muted-foreground" />
								<span>No Project Lead assigned</span>
							</div>
						)}

						<div className="flex items-center gap-1.5">
							<Clock className="w-3.5 h-3.5" />
							<span>Start: {project.startDate}</span>
							<span>•</span>
							<span>Due: {project.targetDate || project.dueDate || "Not set"}</span>
						</div>

						<div className="flex items-center gap-1.5">
							<Users className="w-3.5 h-3.5" />
							<span>{project.memberIds.length} Members</span>
						</div>
					</div>

					<div className="flex items-center gap-3 font-medium">
						<span>Progress: {completionRate}%</span>
						<div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
							<div className="h-full bg-primary transition-all" style={{ width: `${completionRate}%` }} />
						</div>
					</div>
				</div>
			</div>

			{/* Integrated Project Execution Tabs */}
			<Tabs
				value={activeTab}
				onValueChange={(tab) => setSearchParams({ tab })}
				className="space-y-4"
			>
				<TabsList className="grid grid-cols-4 sm:grid-cols-8 w-full max-w-4xl h-auto p-1 bg-muted/60 rounded-xl">
					<TabsTrigger value="board" className="flex items-center gap-1.5 text-xs py-2">
						<LayoutDashboard className="w-3.5 h-3.5" />
						<span>Board</span>
					</TabsTrigger>
					<TabsTrigger value="list" className="flex items-center gap-1.5 text-xs py-2">
						<List className="w-3.5 h-3.5" />
						<span>List</span>
					</TabsTrigger>
					<TabsTrigger value="calendar" className="flex items-center gap-1.5 text-xs py-2">
						<CalendarIcon className="w-3.5 h-3.5" />
						<span>Calendar</span>
					</TabsTrigger>
					<TabsTrigger value="chat" className="flex items-center gap-1.5 text-xs py-2 relative">
						<MessageSquare className="w-3.5 h-3.5" />
						<span>Chat</span>
						{messages.length > 0 && (
							<span className="w-1.5 h-1.5 rounded-full bg-primary absolute top-1 right-1" />
						)}
					</TabsTrigger>
					<TabsTrigger value="files" className="flex items-center gap-1.5 text-xs py-2">
						<FileText className="w-3.5 h-3.5" />
						<span>Files</span>
					</TabsTrigger>
					<TabsTrigger value="members" className="flex items-center gap-1.5 text-xs py-2">
						<Users className="w-3.5 h-3.5" />
						<span>Members</span>
					</TabsTrigger>
					<TabsTrigger value="activity" className="flex items-center gap-1.5 text-xs py-2">
						<Activity className="w-3.5 h-3.5" />
						<span>Activity</span>
					</TabsTrigger>
					<TabsTrigger value="reports" className="flex items-center gap-1.5 text-xs py-2">
						<BarChart3 className="w-3.5 h-3.5" />
						<span>Reports</span>
					</TabsTrigger>
				</TabsList>

				{/* 1. BOARD VIEW (Kanban TODO -> IN PROGRESS -> BLOCKED -> DONE) */}
				<TabsContent value="board" className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
						{columns.map((status) => {
							const colTasks = projectTasks.filter((t) => t.status === status);
							const statusColors = {
								TODO: "border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300",
								IN_PROGRESS: "border-blue-300 dark:border-blue-900 text-blue-700 dark:text-blue-300",
								BLOCKED: "border-destructive/40 text-destructive",
								DONE: "border-emerald-300 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300",
							};

							return (
								<div
									key={status}
									className="flex flex-col rounded-2xl bg-muted/30 border border-border/80 p-3 min-h-[500px]"
								>
									{/* Column Header */}
									<div className="flex items-center justify-between px-2 py-1.5 mb-2">
										<div className="flex items-center gap-2">
											<span className={`font-bold text-xs uppercase tracking-wider ${statusColors[status]}`}>
												{status.replace("_", " ")}
											</span>
											<span className="w-5 h-5 rounded-full bg-card flex items-center justify-center text-[10px] font-bold border">
												{colTasks.length}
											</span>
										</div>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => {
												setTaskTitle("");
												setCreateTaskModalOpen(true);
											}}
											className="w-6 h-6 rounded-md hover:bg-card"
											title={`Add task to ${status}`}
										>
											<Plus className="w-3.5 h-3.5 text-muted-foreground" />
										</Button>
									</div>

									{/* Column Task Cards */}
									<div className="space-y-2.5 flex-1">
										{colTasks.map((task) => {
											const assignee = users.find((u) => u.id === task.assigneeId);
											const isBlocked = task.status === "BLOCKED";
											const isTiming = activeTimer?.taskId === task.id;

											return (
												<div
													key={task.id}
													onClick={() => {
														setSelectedTaskId(task.id);
														setTaskDetailModalOpen(true);
													}}
													className={`group p-3.5 bg-card hover:bg-card/90 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-xs space-y-2.5 ${
														isBlocked
															? "border-destructive/50 bg-destructive/5"
															: isTiming
															? "border-primary shadow-xs ring-1 ring-primary/30"
															: "border-border/70 hover:border-primary/40"
													}`}
												>
													<div className="flex items-start justify-between gap-2">
														<span className="font-semibold text-xs text-foreground leading-snug line-clamp-2">
															{task.title}
														</span>
														<Badge
															variant={
																task.priority === "URGENT" || task.priority === "HIGH"
																	? "destructive"
																	: "secondary"
															}
															className="text-[9px] px-1.5 py-0 uppercase font-bold shrink-0"
														>
															{task.priority}
														</Badge>
													</div>

													{task.description && (
														<p className="text-[11px] text-muted-foreground line-clamp-2">
															{task.description}
														</p>
													)}

													{/* Quick Info footer */}
													<div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
														<div className="flex items-center gap-2">
															{assignee ? (
																<div className="flex items-center gap-1" title={`Assigned to ${assignee.name}`}>
																	<Avatar className="w-4 h-4">
																		<AvatarImage src={assignee.avatar} />
																		<AvatarFallback className="text-[8px]">{assignee.name[0]}</AvatarFallback>
																	</Avatar>
																	<span className="truncate max-w-[80px]">{assignee.name.split(" ")[0]}</span>
																</div>
															) : (
																<span>Unassigned</span>
															)}

															{task.trackedSeconds ? (
																<span className="font-mono text-primary font-medium">
																	{(task.trackedSeconds / 3600).toFixed(1)}h
																</span>
															) : null}
														</div>

														<span className={task.dueDate && new Date(task.dueDate) < new Date() ? "text-destructive font-semibold" : ""}>
															{task.dueDate || "No date"}
														</span>
													</div>

													{/* Quick Move Status Strip */}
													<div
														className="pt-1.5 flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
														onClick={(e) => e.stopPropagation()}
													>
														<span className="text-[9px] text-muted-foreground">Move to:</span>
														<div className="flex items-center gap-1">
															{columns
																.filter((s) => s !== task.status)
																.map((nextStatus) => (
																	<button
																		key={nextStatus}
																		type="button"
																		onClick={() => updateTaskStatus(task.id, nextStatus)}
																		className="px-1.5 py-0.5 rounded text-[9px] bg-muted hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
																	>
																		{nextStatus === "IN_PROGRESS" ? "PROG" : nextStatus}
																	</button>
																))}
														</div>
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
				</TabsContent>

				{/* 2. LIST VIEW */}
				<TabsContent value="list" className="space-y-4">
					<Card>
						<CardHeader className="py-3.5 px-4 flex flex-row items-center justify-between">
							<div>
								<CardTitle className="text-sm font-bold">Structured Task List</CardTitle>
								<CardDescription className="text-xs">
									Detailed table of all tasks with direct timer and status triggers.
								</CardDescription>
							</div>
							<Button size="sm" onClick={() => setCreateTaskModalOpen(true)} className="text-xs">
								<Plus className="w-3.5 h-3.5 mr-1" /> Add Task
							</Button>
						</CardHeader>
						<CardContent className="p-0">
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse text-xs">
									<thead>
										<tr className="border-y border-border/80 bg-muted/40 text-muted-foreground font-semibold">
											<th className="py-2.5 px-4">Task</th>
											<th className="py-2.5 px-3">Status</th>
											<th className="py-2.5 px-3">Priority</th>
											<th className="py-2.5 px-3">Assignee</th>
											<th className="py-2.5 px-3">Due Date</th>
											<th className="py-2.5 px-3">Time Tracked</th>
											<th className="py-2.5 px-4 text-right">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border/60">
										{projectTasks.map((task) => {
											const assignee = users.find((u) => u.id === task.assigneeId);
											const isTiming = activeTimer?.taskId === task.id;

											return (
												<tr
													key={task.id}
													className="hover:bg-muted/30 transition-colors cursor-pointer"
													onClick={() => {
														setSelectedTaskId(task.id);
														setTaskDetailModalOpen(true);
													}}
												>
													<td className="py-3 px-4 font-semibold text-foreground max-w-xs truncate">
														<div className="flex items-center gap-2">
															<span>{task.title}</span>
															{task.status === "BLOCKED" && (
																<Badge variant="destructive" className="text-[9px] px-1 py-0 uppercase">
																	Blocked
																</Badge>
															)}
														</div>
													</td>
													<td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
														<Select
															value={task.status}
															onValueChange={(v) => updateTaskStatus(task.id, v as TaskStatus)}
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
													<td className="py-3 px-3 font-mono font-medium text-primary">
														{task.trackedSeconds ? `${(task.trackedSeconds / 3600).toFixed(1)} hrs` : "0.0 hrs"}
													</td>
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
														</div>
													</td>
												</tr>
											);
										})}

										{projectTasks.length === 0 && (
											<tr>
												<td colSpan={7} className="text-center py-10 text-muted-foreground">
													No tasks created in this project yet. Click "Add Task" to start.
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* 3. CALENDAR VIEW */}
				<TabsContent value="calendar" className="space-y-4">
					<Card>
						<CardHeader className="py-3 px-4">
							<CardTitle className="text-sm font-bold">Project Schedule & Due Dates</CardTitle>
							<CardDescription className="text-xs">
								Visual timeline of scheduled work, upcoming deadlines, and overdue items.
							</CardDescription>
						</CardHeader>
						<CardContent className="p-4">
							<div className="space-y-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
									{projectTasks.map((task) => {
										const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
										return (
											<div
												key={task.id}
												onClick={() => {
													setSelectedTaskId(task.id);
													setTaskDetailModalOpen(true);
												}}
												className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
													isOverdue
														? "border-destructive/50 bg-destructive/5"
														: "border-border/70 hover:border-primary/40 bg-card"
												}`}
											>
												<div className="flex items-center justify-between">
													<Badge
														variant={
															task.status === "DONE"
																? "success"
																: isOverdue
																? "destructive"
																: "secondary"
														}
														className="text-[9px] uppercase font-bold"
													>
														{isOverdue ? "OVERDUE" : task.status.replace("_", " ")}
													</Badge>
													<span className="text-[11px] font-mono text-muted-foreground">
														Due: {task.dueDate || "Not set"}
													</span>
												</div>
												<h4 className="font-semibold text-xs text-foreground line-clamp-1">{task.title}</h4>
												<p className="text-[11px] text-muted-foreground line-clamp-2">{task.description}</p>
											</div>
										);
									})}
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* 4. CHAT TAB with CONVERT CHAT MESSAGE TO TASK */}
				<TabsContent value="chat" className="space-y-4">
					<Card className="flex flex-col h-[600px]">
						<CardHeader className="py-3 px-4 border-b border-border/70 flex flex-row items-center justify-between shrink-0">
							<div className="flex items-center gap-2">
								<MessageSquare className="w-4 h-4 text-primary" />
								<div>
									<CardTitle className="text-sm font-bold">Project Communication</CardTitle>
									<CardDescription className="text-[11px]">
										Real-time messages with project members. Convert any message directly into a task.
									</CardDescription>
								</div>
							</div>

							<div className="relative w-48 hidden sm:block">
								<Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
								<Input
									placeholder="Search messages..."
									value={chatSearch}
									onChange={(e) => setChatSearch(e.target.value)}
									className="h-8 text-xs pl-8"
								/>
							</div>
						</CardHeader>

						{/* Messages Feed */}
						<CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
							{messages
								.filter((m) => !chatSearch || m.content.toLowerCase().includes(chatSearch.toLowerCase()))
								.map((msg) => {
									const author = users.find((u) => u.id === msg.userId);
									const isMe = msg.userId === user.id;

									return (
										<div
											key={msg.id}
											className={`flex gap-3 group ${isMe ? "flex-row-reverse" : "flex-row"}`}
										>
											<Avatar className="w-8 h-8 shrink-0 mt-0.5">
												<AvatarImage src={author?.avatar} />
												<AvatarFallback>{author?.name[0] || "U"}</AvatarFallback>
											</Avatar>

											<div className={`flex flex-col max-w-[75%] space-y-1 ${isMe ? "items-end" : "items-start"}`}>
												<div className="flex items-center gap-2 text-[10px] text-muted-foreground">
													<span className="font-semibold text-foreground">{author?.name}</span>
													<span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
													{msg.isConvertedToTask && (
														<Badge variant="outline" className="text-[9px] px-1 py-0 text-success border-success/30">
															<CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Task Created
														</Badge>
													)}
												</div>

												<div
													className={`p-3 rounded-2xl text-xs relative ${
														isMe
															? "bg-primary text-primary-foreground rounded-tr-xs"
															: "bg-muted/80 text-foreground rounded-tl-xs"
													}`}
												>
													{msg.content}

													{/* Emoji Reactions */}
													{msg.reactions && Object.keys(msg.reactions).length > 0 && (
														<div className="flex flex-wrap gap-1 mt-2 pt-1 border-t border-black/10">
															{Object.entries(msg.reactions).map(([emoji, userIds]) => (
																<span
																	key={emoji}
																	onClick={() => toggleChatReaction(msg.id, emoji)}
																	className="px-1.5 py-0.5 rounded-full bg-black/10 text-[10px] cursor-pointer hover:bg-black/20"
																>
																	{emoji} {userIds.length}
																</span>
															))}
														</div>
													)}
												</div>

												{/* Message Actions (Convert to Task, React, Delete) */}
												<div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">
													<button
														type="button"
														onClick={() => toggleChatReaction(msg.id, "👍")}
														className="p-1 hover:bg-muted rounded"
														title="Thumbs Up"
													>
														👍
													</button>
													<button
														type="button"
														onClick={() => toggleChatReaction(msg.id, "🚀")}
														className="p-1 hover:bg-muted rounded"
														title="Rocket"
													>
														🚀
													</button>

													{/* CONVERT TO TASK ACTION (PRD Section 21) */}
													<button
														type="button"
														onClick={() => {
															setConvertingMsgId(msg.id);
															setConvertTaskTitle(msg.content.slice(0, 60));
															setConvertModalOpen(true);
														}}
														className="px-1.5 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary font-semibold flex items-center gap-1"
														title="Convert Chat Message to Task"
													>
														<Plus className="w-2.5 h-2.5" /> Convert to Task
													</button>

													{isMe && (
														<button
															type="button"
															onClick={() => deleteChatMessage(msg.id)}
															className="p-1 hover:bg-destructive/10 text-destructive rounded"
															title="Delete own message"
														>
															<Trash2 className="w-3 h-3" />
														</button>
													)}
												</div>
											</div>
										</div>
									);
								})}

							{messages.length === 0 && (
								<div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
									<MessageSquare className="w-10 h-10 opacity-30 mb-2" />
									<p className="text-xs font-medium">No messages in this project yet.</p>
									<p className="text-[11px] opacity-70">Start the conversation with your team members below.</p>
								</div>
							)}
						</CardContent>

						{/* Chat Input Bar */}
						<form
							onSubmit={handleSendChat}
							className="p-3 border-t border-border/70 flex items-center gap-2 shrink-0 bg-card"
						>
							<Input
								placeholder="Type a message or discuss a task..."
								value={chatInput}
								onChange={(e) => setChatInput(e.target.value)}
								className="h-10 text-xs"
							/>
							<Button type="submit" size="sm" className="h-10 px-4 bg-primary hover:bg-primary/90 shrink-0">
								<Send className="w-4 h-4 mr-1" /> Send
							</Button>
						</form>
					</Card>
				</TabsContent>

				{/* 5. FILES TAB */}
				<TabsContent value="files" className="space-y-4">
					<Card>
						<CardHeader className="py-3.5 px-4 flex flex-row items-center justify-between">
							<div>
								<CardTitle className="text-sm font-bold">Project Files & Attachments</CardTitle>
								<CardDescription className="text-xs">
									Repository of specifications, diagrams, assets, and task attachments.
								</CardDescription>
							</div>
							<Button size="sm" onClick={() => setUploadModalOpen(true)} className="text-xs">
								<Plus className="w-3.5 h-3.5 mr-1" /> Upload File
							</Button>
						</CardHeader>
						<CardContent className="p-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
								{files.map((file) => {
									const uploader = users.find((u) => u.id === file.uploadedBy);
									return (
										<div
											key={file.id}
											className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all flex flex-col justify-between space-y-3 shadow-2xs"
										>
											<div className="flex items-start justify-between gap-2">
												<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
													<FileText className="w-5 h-5" />
												</div>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon" className="w-7 h-7">
															<MoreVertical className="w-3.5 h-3.5" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end" className="text-xs">
														<DropdownMenuItem onClick={() => setPreviewFile(file)}>
															<Eye className="w-3.5 h-3.5 mr-2" /> Preview File
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => window.open(file.url, "_blank")}>
															<Download className="w-3.5 h-3.5 mr-2" /> Download
														</DropdownMenuItem>
														{(file.uploadedBy === user.id || isOwner) && (
															<>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	onClick={() => deleteProjectFile(file.id)}
																	className="text-destructive"
																>
																	<Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
																</DropdownMenuItem>
															</>
														)}
													</DropdownMenuContent>
												</DropdownMenu>
											</div>

											<div>
												<h4 className="font-semibold text-xs text-foreground truncate" title={file.name}>
													{file.name}
												</h4>
												<p className="text-[10px] text-muted-foreground mt-0.5">
													{file.size} • Uploaded by {uploader?.name.split(" ")[0] || "Member"}
												</p>
											</div>

											<div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
												<Button
													variant="outline"
													size="sm"
													onClick={() => setPreviewFile(file)}
													className="h-7 text-xs w-full"
												>
													<Eye className="w-3 h-3 mr-1" /> Preview
												</Button>
											</div>
										</div>
									);
								})}

								{files.length === 0 && (
									<div className="col-span-full text-center py-12 text-muted-foreground">
										<FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
										<p className="text-xs font-semibold">No files uploaded yet.</p>
										<p className="text-[11px]">Upload documentation or deliverables for this project.</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* 6. MEMBERS & LEAD TAB */}
				<TabsContent value="members" className="space-y-4">
					<Card>
						<CardHeader className="py-3.5 px-4 flex flex-row items-center justify-between">
							<div>
								<CardTitle className="text-sm font-bold">Project Members & Lead Responsibility</CardTitle>
								<CardDescription className="text-xs">
									Project Lead is not an independent role; it is a responsibility assigned to an existing member.
								</CardDescription>
							</div>
							{(isOwner || isAdmin) && (
								<Button size="sm" onClick={() => setAddMemberModalOpen(true)} className="text-xs">
									<UserPlus className="w-3.5 h-3.5 mr-1" /> Add Member
								</Button>
							)}
						</CardHeader>
						<CardContent className="p-4 space-y-3">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
								{projectMembers.map((member) => {
									const isLead = project.leadId === member.id;
									return (
										<div
											key={member.id}
											className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
												isLead ? "border-primary bg-primary/5" : "border-border/80 bg-card"
											}`}
										>
											<div className="flex items-center gap-3 min-w-0">
												<Avatar className="w-9 h-9 shrink-0">
													<AvatarImage src={member.avatar} />
													<AvatarFallback>{member.name[0]}</AvatarFallback>
												</Avatar>
												<div className="flex flex-col min-w-0">
													<div className="flex items-center gap-1.5">
														<span className="font-semibold text-xs text-foreground truncate">{member.name}</span>
														{isLead && (
															<Badge variant="default" className="text-[9px] px-1.5 py-0 uppercase font-bold">
																Project Lead
															</Badge>
														)}
													</div>
													<span className="text-[10px] text-muted-foreground truncate">{member.email}</span>
												</div>
											</div>

											{(isOwner || isAdmin) && (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon" className="w-7 h-7">
															<MoreVertical className="w-3.5 h-3.5" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end" className="text-xs">
														{isLead ? (
															<DropdownMenuItem onClick={() => setProjectLead(project.id, undefined)}>
																Remove Lead Responsibility
															</DropdownMenuItem>
														) : (
															<DropdownMenuItem onClick={() => setProjectLead(project.id, member.id)}>
																<Crown className="w-3.5 h-3.5 mr-2 text-primary" /> Assign as Project Lead
															</DropdownMenuItem>
														)}
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => removeProjectMember(project.id, member.id)}
															className="text-destructive"
														>
															<Trash2 className="w-3.5 h-3.5 mr-2" /> Remove from Project
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											)}
										</div>
									);
								})}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* 7. ACTIVITY AUDIT STREAM */}
				<TabsContent value="activity" className="space-y-4">
					<Card>
						<CardHeader className="py-3 px-4">
							<CardTitle className="text-sm font-bold">Project Activity History</CardTitle>
							<CardDescription className="text-xs">
								Chronological audit record of project events, task progress, and time logs.
							</CardDescription>
						</CardHeader>
						<CardContent className="p-4 space-y-3">
							{projectLogs.map((log) => (
								<div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/40 text-xs">
									<div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
									<div className="flex-1">
										<div className="flex items-center justify-between">
											<span className="font-semibold text-foreground">{log.action.replace("_", " ")}</span>
											<span className="text-[10px] text-muted-foreground">
												{new Date(log.timestamp).toLocaleString()}
											</span>
										</div>
										<p className="text-muted-foreground mt-0.5">{log.details}</p>
										<span className="text-[10px] text-primary/80 font-medium">By {log.actorName}</span>
									</div>
								</div>
							))}
							{projectLogs.length === 0 && (
								<div className="text-center py-8 text-muted-foreground text-xs">
									No activity recorded yet for this project.
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* 8. REPORTS TAB */}
				<TabsContent value="reports" className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<Card className="p-4 space-y-1.5">
							<span className="text-xs text-muted-foreground font-semibold">Total Tasks</span>
							<div className="text-2xl font-bold">{projectTasks.length}</div>
							<span className="text-[10px] text-muted-foreground">Across all workflow states</span>
						</Card>
						<Card className="p-4 space-y-1.5">
							<span className="text-xs text-muted-foreground font-semibold">Completion Rate</span>
							<div className="text-2xl font-bold text-success">{completionRate}%</div>
							<span className="text-[10px] text-muted-foreground">{completedCount} of {projectTasks.length} done</span>
						</Card>
						<Card className="p-4 space-y-1.5">
							<span className="text-xs text-muted-foreground font-semibold">Active Blockers</span>
							<div className={`text-2xl font-bold ${blockedCount > 0 ? "text-destructive" : "text-foreground"}`}>
								{blockedCount}
							</div>
							<span className="text-[10px] text-muted-foreground">Tasks currently in BLOCKED state</span>
						</Card>
						<Card className="p-4 space-y-1.5">
							<span className="text-xs text-muted-foreground font-semibold">Total Hours Tracked</span>
							<div className="text-2xl font-bold text-primary">{totalHoursTracked}h</div>
							<span className="text-[10px] text-muted-foreground">Recorded via live timer engine</span>
						</Card>
					</div>
				</TabsContent>
			</Tabs>

			{/* Modal: Create Task */}
			<Dialog open={createTaskModalOpen} onOpenChange={setCreateTaskModalOpen}>
				<DialogContent className="sm:max-w-[460px]">
					<DialogHeader>
						<DialogTitle className="text-base font-bold flex items-center gap-2">
							<Plus className="w-4 h-4 text-primary" /> Create Task in {project.name}
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Create an actionable task within this project container.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleCreateTaskSubmit} className="space-y-3.5 py-2">
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Task Title *</Label>
							<Input
								placeholder="e.g. Write integration test suite"
								value={taskTitle}
								onChange={(e) => setTaskTitle(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Description</Label>
							<Textarea
								placeholder="Task details and acceptance criteria..."
								value={taskDesc}
								onChange={(e) => setTaskDesc(e.target.value)}
								className="text-xs resize-none h-18"
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1">
								<Label className="text-xs font-semibold">Priority</Label>
								<Select value={taskPriority} onValueChange={(v) => setTaskPriority(v as TaskPriority)}>
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
							<div className="space-y-1">
								<Label className="text-xs font-semibold">Assignee</Label>
								<Select value={taskAssignee} onValueChange={setTaskAssignee}>
									<SelectTrigger className="h-9 text-xs">
										<SelectValue placeholder="Assignee" />
									</SelectTrigger>
									<SelectContent>
										{projectMembers.map((m) => (
											<SelectItem key={m.id} value={m.id} className="text-xs">
												{m.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Due Date</Label>
							<Input
								type="date"
								value={taskDueDate}
								onChange={(e) => setTaskDueDate(e.target.value)}
								className="h-9 text-xs"
							/>
						</div>
						<DialogFooter className="gap-2 pt-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setCreateTaskModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								Create Task
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Modal: Task Detail Drawer / Modal */}
			<Dialog open={taskDetailModalOpen} onOpenChange={setTaskDetailModalOpen}>
				<DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
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
										variant={selectedTask.priority === "HIGH" || selectedTask.priority === "URGENT" ? "destructive" : "outline"}
										className="text-[10px] uppercase font-bold"
									>
										{selectedTask.priority}
									</Badge>
								</div>
								<DialogTitle className="text-base font-bold text-foreground">
									{selectedTask.title}
								</DialogTitle>
								<DialogDescription className="text-xs text-muted-foreground">
									Belongs to project: <strong>{project.name}</strong>
								</DialogDescription>
							</DialogHeader>

							<p className="text-xs text-foreground/90 bg-muted/30 p-3 rounded-lg border">
								{selectedTask.description || "No description provided."}
							</p>

							{/* Actions Bar (Timer & Blocker) */}
							<div className="flex flex-wrap items-center gap-2 p-3 bg-muted/40 rounded-xl border">
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

								<div className="ml-auto flex items-center gap-1">
									<span className="text-xs font-semibold font-mono text-primary">
										{selectedTask.trackedSeconds ? `${(selectedTask.trackedSeconds / 3600).toFixed(1)} hrs tracked` : "0 hrs"}
									</span>
								</div>
							</div>

							{/* Comments Section */}
							<div className="space-y-3 pt-2">
								<h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
									<MessageSquare className="w-3.5 h-3.5 text-primary" /> Comments ({selectedTask.comments?.length || 0})
								</h4>
								<div className="space-y-2 max-h-48 overflow-y-auto">
									{selectedTask.comments?.map((c) => {
										const commenter = users.find((u) => u.id === c.userId);
										return (
											<div key={c.id} className="p-2.5 rounded-lg bg-muted/40 text-xs space-y-1">
												<div className="flex items-center justify-between text-[10px] text-muted-foreground">
													<span className="font-semibold text-foreground">{commenter?.name || "Member"}</span>
													<span>{new Date(c.createdAt).toLocaleTimeString()}</span>
												</div>
												<p className="text-foreground/90">{c.content}</p>
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
								<Button variant="outline" size="sm" onClick={() => setTaskDetailModalOpen(false)}>
									Close
								</Button>
							</DialogFooter>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Modal: Convert Message to Task (PRD §21) */}
			<Dialog open={convertModalOpen} onOpenChange={setConvertModalOpen}>
				<DialogContent className="sm:max-w-[440px]">
					<DialogHeader>
						<DialogTitle className="text-base font-bold flex items-center gap-2">
							<CheckCircle2 className="w-4 h-4 text-success" /> Convert Message to Task
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Create a new task in <strong>{project.name}</strong> from this chat discussion.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleConvertMsgToTask} className="space-y-3 py-2">
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Task Title *</Label>
							<Input
								value={convertTaskTitle}
								onChange={(e) => setConvertTaskTitle(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>
						<DialogFooter className="gap-2 pt-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setConvertModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								Create Task
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Modal: File Preview */}
			<Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle className="text-sm font-bold flex items-center gap-2">
							<FileText className="w-4 h-4 text-primary" /> {previewFile?.name}
						</DialogTitle>
						<DialogDescription className="text-xs">
							{previewFile?.size} • Type: {previewFile?.type}
						</DialogDescription>
					</DialogHeader>
					<div className="py-4 flex items-center justify-center bg-muted/20 rounded-xl border min-h-[220px]">
						{previewFile?.type === "image" ? (
							<img src={previewFile.url} alt={previewFile.name} className="max-h-72 object-contain rounded-lg" />
						) : (
							<div className="text-center p-6 text-xs text-muted-foreground space-y-2">
								<FileText className="w-12 h-12 text-primary/60 mx-auto" />
								<p className="font-semibold text-foreground">File preview ready</p>
								<p>Format supported: {previewFile?.name.split(".").pop()?.toUpperCase()}</p>
							</div>
						)}
					</div>
					<DialogFooter>
						<Button variant="outline" size="sm" onClick={() => setPreviewFile(null)}>
							Close Preview
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Modal: Upload File */}
			<Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
				<DialogContent className="sm:max-w-[420px]">
					<DialogHeader>
						<DialogTitle className="text-base font-bold flex items-center gap-2">
							<FileText className="w-4 h-4 text-primary" /> Upload Project File
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleFileUpload} className="space-y-3 py-2">
						<div className="space-y-1">
							<Label className="text-xs font-semibold">File Name *</Label>
							<Input
								placeholder="e.g. sprint_backlog_review.pdf"
								value={fileName}
								onChange={(e) => setFileName(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-xs font-semibold">File Category</Label>
							<Select value={fileType} onValueChange={setFileType}>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="document">Document (PDF/DOCX)</SelectItem>
									<SelectItem value="image">Image (PNG/JPG/SVG)</SelectItem>
									<SelectItem value="spreadsheet">Spreadsheet (XLSX)</SelectItem>
									<SelectItem value="code">Code / Schemas (JSON/YAML)</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<DialogFooter className="gap-2 pt-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setUploadModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								Upload
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Modal: Report Blocker inside task */}
			<Dialog open={blockerModalOpen} onOpenChange={setBlockerModalOpen}>
				<DialogContent className="sm:max-w-[440px]">
					<DialogHeader>
						<DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
							<AlertOctagon className="w-4 h-4" /> Report Blocker on Task
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							This will change the task status to <strong>BLOCKED</strong>.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleReportTaskBlocker} className="space-y-3 py-2">
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Blocker Summary *</Label>
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
								placeholder="What is required to unblock this task?"
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
