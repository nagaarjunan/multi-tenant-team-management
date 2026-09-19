import { useState, useEffect, useMemo } from "react";
import { useSaaSStore } from "@/store/saasStore";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useNavigate } from "react-router";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/ui/command";
import { Button } from "@/ui/button";
import {
	Search,
	FolderKanban,
	CheckSquare,
	User,
	MessageSquare,
	FileText,
} from "lucide-react";

export default function GlobalSearch() {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();

	const { user, organization, isPersonalWorkspace } = useAuthorization();
	const projects = useSaaSStore((s) => s.projects);
	const tasks = useSaaSStore((s) => s.tasks);
	const users = useSaaSStore((s) => s.users);
	const chatMessages = useSaaSStore((s) => s.chatMessages);
	const projectFiles = useSaaSStore((s) => s.projectFiles);

	// Cmd+K / Ctrl+K keyboard shortcut
	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	// Filter accessible records for current workspace
	const accessibleProjects = useMemo(() => {
		return projects.filter((p) => {
			if (isPersonalWorkspace) return p.workspaceType === "personal";
			return p.orgId === organization?.id;
		});
	}, [projects, isPersonalWorkspace, organization?.id]);

	const accessibleProjectIds = useMemo(() => new Set(accessibleProjects.map((p) => p.id)), [accessibleProjects]);

	const accessibleTasks = useMemo(() => {
		return tasks.filter((t) => accessibleProjectIds.has(t.projectId));
	}, [tasks, accessibleProjectIds]);

	const accessibleChatMessages = useMemo(() => {
		return chatMessages.filter((m) => accessibleProjectIds.has(m.projectId));
	}, [chatMessages, accessibleProjectIds]);

	const accessibleFiles = useMemo(() => {
		return projectFiles.filter((f) => accessibleProjectIds.has(f.projectId));
	}, [projectFiles, accessibleProjectIds]);

	const accessibleUsers = useMemo(() => {
		if (isPersonalWorkspace) return [user];
		// Org members
		const orgMemberIds = new Set(accessibleProjects.flatMap((p) => p.memberIds));
		return users.filter((u) => orgMemberIds.has(u.id));
	}, [users, accessibleProjects, isPersonalWorkspace, user]);

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setOpen(true)}
				className="flex items-center justify-between gap-3 h-8 px-2.5 text-xs text-muted-foreground bg-muted/30 hover:bg-accent border-border/80 rounded-lg shadow-xs transition-all w-32 sm:w-44 lg:w-56"
			>
				<div className="flex items-center gap-2 truncate">
					<Search className="w-3.5 h-3.5 shrink-0" />
					<span className="truncate">Search {isPersonalWorkspace ? "personal..." : "workspace..."}</span>
				</div>
				<kbd className="hidden sm:inline-flex pointer-events-none h-4 select-none items-center gap-1 rounded bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground border">
					<span>⌘</span>K
				</kbd>
			</Button>

			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Search projects, tasks, chat, files, members..." />
				<CommandList className="max-h-[380px]">
					<CommandEmpty>No results found.</CommandEmpty>

					{/* 1. Projects */}
					{accessibleProjects.length > 0 && (
						<CommandGroup heading="Projects">
							{accessibleProjects.map((project) => (
								<CommandItem
									key={project.id}
									onSelect={() => {
										setOpen(false);
										navigate(`/projects/${project.id}`);
									}}
									className="flex items-center justify-between py-2 cursor-pointer"
								>
									<div className="flex items-center gap-2 min-w-0">
										<FolderKanban className="w-4 h-4 text-primary shrink-0" />
										<span className="font-medium text-xs truncate">{project.name}</span>
									</div>
									<span className="text-[10px] text-muted-foreground uppercase">{project.status}</span>
								</CommandItem>
							))}
						</CommandGroup>
					)}

					{/* 2. Tasks */}
					{accessibleTasks.length > 0 && (
						<>
							<CommandSeparator />
							<CommandGroup heading="Tasks">
								{accessibleTasks.map((task) => (
									<CommandItem
										key={task.id}
										onSelect={() => {
											setOpen(false);
											navigate(`/projects/${task.projectId}?tab=board`);
										}}
										className="flex items-center justify-between py-2 cursor-pointer"
									>
										<div className="flex items-center gap-2 min-w-0">
											<CheckSquare className="w-4 h-4 text-success shrink-0" />
											<div className="flex flex-col min-w-0">
												<span className="font-medium text-xs truncate">{task.title}</span>
												<span className="text-[10px] text-muted-foreground truncate">{task.description}</span>
											</div>
										</div>
										<span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase font-semibold">
											{task.status.replace("_", " ")}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						</>
					)}

					{/* 3. Chat Messages */}
					{accessibleChatMessages.length > 0 && (
						<>
							<CommandSeparator />
							<CommandGroup heading="Chat Messages">
								{accessibleChatMessages.map((msg) => {
									const author = users.find((u) => u.id === msg.userId);
									return (
										<CommandItem
											key={msg.id}
											onSelect={() => {
												setOpen(false);
												navigate(`/projects/${msg.projectId}?tab=chat`);
											}}
											className="flex items-center justify-between py-2 cursor-pointer"
										>
											<div className="flex items-center gap-2 min-w-0">
												<MessageSquare className="w-4 h-4 text-info shrink-0" />
												<div className="flex flex-col min-w-0">
													<span className="text-xs truncate font-medium">"{msg.content}"</span>
													<span className="text-[10px] text-muted-foreground">By {author?.name || "Member"}</span>
												</div>
											</div>
										</CommandItem>
									);
								})}
							</CommandGroup>
						</>
					)}

					{/* 4. Files */}
					{accessibleFiles.length > 0 && (
						<>
							<CommandSeparator />
							<CommandGroup heading="Files">
								{accessibleFiles.map((file) => (
									<CommandItem
										key={file.id}
										onSelect={() => {
											setOpen(false);
											navigate(`/projects/${file.projectId}?tab=files`);
										}}
										className="flex items-center justify-between py-2 cursor-pointer"
									>
										<div className="flex items-center gap-2 min-w-0">
											<FileText className="w-4 h-4 text-warning shrink-0" />
											<span className="text-xs font-medium truncate">{file.name}</span>
										</div>
										<span className="text-[10px] text-muted-foreground">{file.size}</span>
									</CommandItem>
								))}
							</CommandGroup>
						</>
					)}

					{/* 5. Members */}
					{accessibleUsers.length > 0 && (
						<>
							<CommandSeparator />
							<CommandGroup heading="Members">
								{accessibleUsers.map((u) => (
									<CommandItem
										key={u?.id}
										onSelect={() => {
											setOpen(false);
											navigate(`/settings/members`);
										}}
										className="flex items-center justify-between py-2 cursor-pointer"
									>
										<div className="flex items-center gap-2 min-w-0">
											<User className="w-4 h-4 text-muted-foreground shrink-0" />
											<div className="flex flex-col min-w-0">
												<span className="text-xs font-medium truncate">{u?.name}</span>
												<span className="text-[10px] text-muted-foreground truncate">{u?.email}</span>
											</div>
										</div>
									</CommandItem>
								))}
							</CommandGroup>
						</>
					)}
				</CommandList>
			</CommandDialog>
		</>
	);
}
