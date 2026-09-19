import React, { useState } from "react";
import { useSaaSStore } from "@/store/saasStore";
import { useAuthorization } from "@/hooks/useAuthorization";
import { Button } from "@/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
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
	Zap,
	FolderPlus,
	CheckSquare,
	UserPlus,
	Timer,
	CalendarClock,
	AlertOctagon,
} from "lucide-react";
import { toast } from "sonner";
import type { BlockerSeverity, TaskPriority } from "@/types/saas";

export default function QuickActions() {
	const { user, organization, isPersonalWorkspace } = useAuthorization();
	const projects = useSaaSStore((s) => s.projects);
	const tasks = useSaaSStore((s) => s.tasks);
	const createProject = useSaaSStore((s) => s.createProject);
	const createTask = useSaaSStore((s) => s.createTask);
	const saveDailyUpdate = useSaaSStore((s) => s.saveDailyUpdate);
	const reportTaskBlocker = useSaaSStore((s) => s.reportTaskBlocker);
	const sendInvitation = useSaaSStore((s) => s.sendInvitation);
	const startTimer = useSaaSStore((s) => s.startTimer);

	// Modals
	const [projectModalOpen, setProjectModalOpen] = useState(false);
	const [taskModalOpen, setTaskModalOpen] = useState(false);
	const [dailyModalOpen, setDailyModalOpen] = useState(false);
	const [blockerModalOpen, setBlockerModalOpen] = useState(false);
	const [inviteModalOpen, setInviteModalOpen] = useState(false);

	// Form States
	const [projName, setProjName] = useState("");
	const [projDesc, setProjDesc] = useState("");
	const [projStartDate, setProjStartDate] = useState("2026-09-20");
	const [projDueDate, setProjDueDate] = useState("2026-12-31");

	const [taskTitle, setTaskTitle] = useState("");
	const [taskDesc, setTaskDesc] = useState("");
	const [taskProjectId, setTaskProjectId] = useState("");
	const [taskPriority, setTaskPriority] = useState<TaskPriority>("MEDIUM");
	const [taskDueDate, setTaskDueDate] = useState("2026-09-30");

	const [yesterday, setYesterday] = useState("");
	const [today, setToday] = useState("");
	const [dailyBlockers, setDailyBlockers] = useState("");
	const [dailyProgress, setDailyProgress] = useState("");

	const [blockerTaskId, setBlockerTaskId] = useState("");
	const [blockerTitle, setBlockerTitle] = useState("");
	const [blockerDesc, setBlockerDesc] = useState("");
	const [blockerSeverity, setBlockerSeverity] = useState<BlockerSeverity>("HIGH");

	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");

	// Filter projects belonging to current workspace
	const currentWorkspaceProjects = projects.filter((p) => {
		if (isPersonalWorkspace) {
			return p.workspaceType === "personal";
		}
		return p.orgId === organization?.id;
	});

	const handleCreateProject = (e: React.FormEvent) => {
		e.preventDefault();
		if (!projName.trim()) {
			toast.error("Please enter a project name");
			return;
		}

		createProject({
			workspaceType: isPersonalWorkspace ? "personal" : "organization",
			orgId: isPersonalWorkspace ? undefined : organization?.id,
			name: projName.trim(),
			description: projDesc.trim(),
			status: "ACTIVE",
			startDate: projStartDate,
			targetDate: projDueDate,
			dueDate: projDueDate,
			memberIds: [user.id],
		});

		toast.success(`Project "${projName}" created!`);
		setProjectModalOpen(false);
		setProjName("");
		setProjDesc("");
	};

	const handleCreateTask = (e: React.FormEvent) => {
		e.preventDefault();
		if (!taskTitle.trim()) {
			toast.error("Please enter task title");
			return;
		}
		if (!taskProjectId) {
			toast.error("A project must be selected! (No Project -> No Task)");
			return;
		}

		try {
			createTask({
				projectId: taskProjectId,
				title: taskTitle.trim(),
				description: taskDesc.trim(),
				status: "TODO",
				priority: taskPriority,
				assigneeId: user.id,
				reporterId: user.id,
				dueDate: taskDueDate,
				labels: ["quick-task"],
			});
			toast.success(`Task "${taskTitle}" created!`);
			setTaskModalOpen(false);
			setTaskTitle("");
			setTaskDesc("");
		} catch (err: any) {
			toast.error(err.message || "Failed to create task");
		}
	};

	const handleSubmitDailyUpdate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!today.trim()) {
			toast.error("Please fill in what you will work on today");
			return;
		}

		saveDailyUpdate({
			orgId: organization?.id || "personal",
			userId: user.id,
			date: new Date().toISOString().split("T")[0],
			yesterday: yesterday.trim() || "No previous status recorded.",
			today: today.trim(),
			blockers: dailyBlockers.trim() || "None",
			status: "PUBLISHED",
		});

		toast.success("Daily Execution update submitted!");
		setDailyModalOpen(false);
		setYesterday("");
		setToday("");
		setDailyBlockers("");
		setDailyProgress("");
	};

	const handleReportBlocker = (e: React.FormEvent) => {
		e.preventDefault();
		if (!blockerTaskId) {
			toast.error("Please select the blocked task");
			return;
		}
		if (!blockerTitle.trim()) {
			toast.error("Please enter blocker title");
			return;
		}

		reportTaskBlocker(blockerTaskId, blockerTitle.trim(), blockerDesc.trim(), blockerSeverity);
		toast.success(`Blocker reported. Task status moved to BLOCKED.`);
		setBlockerModalOpen(false);
		setBlockerTaskId("");
		setBlockerTitle("");
		setBlockerDesc("");
	};

	const handleSendInvite = (e: React.FormEvent) => {
		e.preventDefault();
		if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
			toast.error("Please enter a valid email address");
			return;
		}
		if (!organization) return;

		sendInvitation(organization.id, inviteEmail.trim(), inviteRole);
		toast.success(`Invitation sent to ${inviteEmail}`);
		setInviteModalOpen(false);
		setInviteEmail("");
	};

	const accessibleTasks = tasks.filter((t) => {
		if (isPersonalWorkspace) return t.workspaceType === "personal";
		return t.orgId === organization?.id;
	});

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="flex items-center gap-1.5 h-8 px-2.5 bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 rounded-lg shadow-xs transition-all"
						title="Quick Actions"
					>
						<Zap className="w-3.5 h-3.5 fill-current" />
						<span className="hidden sm:inline font-semibold text-xs">Quick Action</span>
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="end" className="w-56 p-1.5">
					<DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase px-2 py-1 tracking-wider">
						Quick Create & Action
					</DropdownMenuLabel>
					<DropdownMenuSeparator />

					<DropdownMenuGroup>
						{/* 1. Create Project */}
						<DropdownMenuItem
							onClick={() => setProjectModalOpen(true)}
							className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer text-xs"
						>
							<FolderPlus className="w-4 h-4 text-primary" />
							<span>Create Project</span>
						</DropdownMenuItem>

						{/* 2. Create Task (Enforces No Project -> No Task) */}
						<DropdownMenuItem
							onClick={() => {
								if (currentWorkspaceProjects.length === 0) {
									toast.error("No Project Found! You must create a project first before creating tasks.", {
										action: {
											label: "Create Project",
											onClick: () => setProjectModalOpen(true),
										},
									});
									return;
								}
								setTaskProjectId(currentWorkspaceProjects[0].id);
								setTaskModalOpen(true);
							}}
							className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer text-xs"
						>
							<CheckSquare className="w-4 h-4 text-success" />
							<span>Create Task</span>
						</DropdownMenuItem>

						{/* 3. Start Timer */}
						<DropdownMenuItem
							onClick={() => {
								if (accessibleTasks.length === 0) {
									toast.info("No tasks available to track. Create a task first!");
									return;
								}
								startTimer(accessibleTasks[0].id);
								toast.success(`Timer started for "${accessibleTasks[0].title}"`);
							}}
							className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer text-xs"
						>
							<Timer className="w-4 h-4 text-warning" />
							<span>Start Timer</span>
						</DropdownMenuItem>

						{/* 4. Submit Daily Update */}
						<DropdownMenuItem
							onClick={() => setDailyModalOpen(true)}
							className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer text-xs"
						>
							<CalendarClock className="w-4 h-4 text-info" />
							<span>Submit Daily Update</span>
						</DropdownMenuItem>

						{/* 5. Report Blocker */}
						<DropdownMenuItem
							onClick={() => {
								if (accessibleTasks.length === 0) {
									toast.info("No tasks to report a blocker on.");
									return;
								}
								setBlockerTaskId(accessibleTasks[0].id);
								setBlockerModalOpen(true);
							}}
							className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer text-xs text-destructive"
						>
							<AlertOctagon className="w-4 h-4" />
							<span>Report Blocker</span>
						</DropdownMenuItem>

						{/* 6. Invite Member (Org mode only) */}
						{!isPersonalWorkspace && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => setInviteModalOpen(true)}
									className="flex items-center gap-2.5 px-2.5 py-2 cursor-pointer text-xs"
								>
									<UserPlus className="w-4 h-4 text-primary" />
									<span>Invite Member</span>
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* 1. Create Project Modal */}
			<Dialog open={projectModalOpen} onOpenChange={setProjectModalOpen}>
				<DialogContent className="sm:max-w-[460px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-base">
							<FolderPlus className="w-5 h-5 text-primary" />
							Create {isPersonalWorkspace ? "Personal" : "Organization"} Project
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Projects are the primary container for tasks, chat, files, time, and progress.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleCreateProject} className="space-y-3.5 py-2">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Project Name *</Label>
							<Input
								placeholder="e.g. Mobile App Redesign, Payment Gateway"
								value={projName}
								onChange={(e) => setProjName(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Description</Label>
							<Textarea
								placeholder="What is this project aiming to accomplish?"
								value={projDesc}
								onChange={(e) => setProjDesc(e.target.value)}
								className="text-xs resize-none h-18"
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Start Date</Label>
								<Input
									type="date"
									value={projStartDate}
									onChange={(e) => setProjStartDate(e.target.value)}
									className="h-9 text-xs"
								/>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Target / Due Date</Label>
								<Input
									type="date"
									value={projDueDate}
									onChange={(e) => setProjDueDate(e.target.value)}
									className="h-9 text-xs"
								/>
							</div>
						</div>
						<DialogFooter className="gap-2 pt-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setProjectModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								Create Project
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* 2. Create Task Modal */}
			<Dialog open={taskModalOpen} onOpenChange={setTaskModalOpen}>
				<DialogContent className="sm:max-w-[480px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-base">
							<CheckSquare className="w-5 h-5 text-success" />
							Create Task
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Tasks exist inside an existing project. (Rule: No Project → No Task)
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleCreateTask} className="space-y-3.5 py-2">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Parent Project *</Label>
							<Select value={taskProjectId} onValueChange={setTaskProjectId}>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue placeholder="Select Project" />
								</SelectTrigger>
								<SelectContent>
									{currentWorkspaceProjects.map((p) => (
										<SelectItem key={p.id} value={p.id} className="text-xs">
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
								value={taskTitle}
								onChange={(e) => setTaskTitle(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Description</Label>
							<Textarea
								placeholder="Detailed task description..."
								value={taskDesc}
								onChange={(e) => setTaskDesc(e.target.value)}
								className="text-xs resize-none h-18"
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Priority</Label>
								<Select value={taskPriority} onValueChange={(v) => setTaskPriority(v as TaskPriority)}>
									<SelectTrigger className="h-9 text-xs">
										<SelectValue placeholder="Priority" />
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
									value={taskDueDate}
									onChange={(e) => setTaskDueDate(e.target.value)}
									className="h-9 text-xs"
								/>
							</div>
						</div>
						<DialogFooter className="gap-2 pt-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setTaskModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								Save Task
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* 3. Daily Update Modal */}
			<Dialog open={dailyModalOpen} onOpenChange={setDailyModalOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-base">
							<CalendarClock className="w-5 h-5 text-info" />
							Daily Execution Update (Standup)
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Submit your 4-part daily execution status for {new Date().toISOString().split("T")[0]}.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSubmitDailyUpdate} className="space-y-3 py-2">
						<div className="space-y-1">
							<Label className="text-xs font-semibold">1. Yesterday (What was completed?)</Label>
							<Textarea
								placeholder="Brief summary of yesterday's completed work..."
								value={yesterday}
								onChange={(e) => setYesterday(e.target.value)}
								className="text-xs resize-none h-16"
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-xs font-semibold">2. Today (What will be worked on? *)</Label>
							<Textarea
								placeholder="Key objectives and deliverables for today..."
								value={today}
								onChange={(e) => setToday(e.target.value)}
								className="text-xs resize-none h-16"
								required
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-xs font-semibold">3. Blockers (What is preventing progress?)</Label>
							<Input
								placeholder="Enter 'None' or describe blocker..."
								value={dailyBlockers}
								onChange={(e) => setDailyBlockers(e.target.value)}
								className="h-8 text-xs"
							/>
						</div>
						<div className="space-y-1">
							<Label className="text-xs font-semibold">4. Progress (Important highlights)</Label>
							<Input
								placeholder="Any milestones achieved or notes..."
								value={dailyProgress}
								onChange={(e) => setDailyProgress(e.target.value)}
								className="h-8 text-xs"
							/>
						</div>
						<DialogFooter className="gap-2 pt-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setDailyModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								Submit Daily Update
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* 4. Report Blocker Modal */}
			<Dialog open={blockerModalOpen} onOpenChange={setBlockerModalOpen}>
				<DialogContent className="sm:max-w-[460px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-base text-destructive">
							<AlertOctagon className="w-5 h-5" />
							Report Blocker
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Reporting a blocker immediately marks the task as <strong>BLOCKED</strong>.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleReportBlocker} className="space-y-3 py-2">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Blocked Task *</Label>
							<Select value={blockerTaskId} onValueChange={setBlockerTaskId}>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue placeholder="Select Task" />
								</SelectTrigger>
								<SelectContent>
									{accessibleTasks.map((t) => (
										<SelectItem key={t.id} value={t.id} className="text-xs">
											{t.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Blocker Title *</Label>
							<Input
								placeholder="e.g. Gateway API timeout 504, waiting on credentials"
								value={blockerTitle}
								onChange={(e) => setBlockerTitle(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Severity</Label>
							<Select value={blockerSeverity} onValueChange={(v) => setBlockerSeverity(v as BlockerSeverity)}>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue placeholder="Severity" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="LOW">Low</SelectItem>
									<SelectItem value="MEDIUM">Medium</SelectItem>
									<SelectItem value="HIGH">High</SelectItem>
									<SelectItem value="CRITICAL">Critical</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Description / Reproduction</Label>
							<Textarea
								placeholder="Provide context on what is blocked and needed resolution..."
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

			{/* 5. Invite Member Modal */}
			<Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
				<DialogContent className="sm:max-w-[420px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-base">
							<UserPlus className="w-5 h-5 text-primary" />
							Invite Member to {organization?.name}
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Send an email invitation to join this organization workspace.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleSendInvite} className="space-y-3 py-2">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Email Address *</Label>
							<Input
								type="email"
								placeholder="colleague@company.com"
								value={inviteEmail}
								onChange={(e) => setInviteEmail(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Organization Role</Label>
							<Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "ADMIN" | "MEMBER")}>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue placeholder="Role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="MEMBER">Member</SelectItem>
									<SelectItem value="ADMIN">Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<DialogFooter className="gap-2 pt-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setInviteModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								Send Invitation
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
