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
import { Textarea } from "@/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import {
	FolderKanban,
	Plus,
	CheckSquare,
	Calendar,
	Trash2,
	Crown,
	ArrowRight,
	Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router";
import type { Project } from "@/types/saas";

export default function ProjectsPage() {
	const navigate = useNavigate();
	const { user, organization, isPersonalWorkspace, can } = useAuthorization();
	const projects = useSaaSStore((s) => s.projects);
	const products = useSaaSStore((s) => s.products);
	const tasks = useSaaSStore((s) => s.tasks);
	const createProject = useSaaSStore((s) => s.createProject);
	const deleteProject = useSaaSStore((s) => s.deleteProject);
	const users = useSaaSStore((s) => s.users);

	// Filter for current workspace: Personal projects or Org projects
	const workspaceProjects = useMemo(() => {
		if (isPersonalWorkspace) {
			return projects.filter((p) => p.workspaceType === "personal");
		}
		return projects.filter((p) => p.workspaceType === "organization" && p.orgId === organization?.id);
	}, [projects, isPersonalWorkspace, organization?.id]);

	const orgProducts = useMemo(() => products.filter((p) => p.orgId === organization?.id), [products, organization?.id]);

	// Modal States
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [projName, setProjName] = useState("");
	const [projDesc, setProjDesc] = useState("");
	const [selectedProduct, setSelectedProduct] = useState("");
	const [status, _setStatus] = useState<Project["status"]>("ACTIVE");
	const [startDate, setStartDate] = useState("2026-09-20");
	const [targetDate, setTargetDate] = useState("2026-12-31");

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!projName.trim()) {
			toast.error("Please enter a project name");
			return;
		}

		createProject({
			workspaceType: isPersonalWorkspace ? "personal" : "organization",
			orgId: isPersonalWorkspace ? undefined : organization?.id,
			productId: isPersonalWorkspace ? undefined : selectedProduct || undefined,
			name: projName.trim(),
			description: projDesc.trim(),
			status,
			startDate,
			targetDate,
			dueDate: targetDate,
			memberIds: [user.id],
		});

		toast.success(`Project "${projName}" created!`);
		setCreateModalOpen(false);
		setProjName("");
		setProjDesc("");
	};

	const handleDelete = (id: string, name: string) => {
		if (confirm(`Are you sure you want to delete project '${name}'?`)) {
			deleteProject(id);
			toast.success(`Project '${name}' removed.`);
		}
	};

	return (
		<div className="space-y-6 pb-12">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<FolderKanban className="w-5 h-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							{isPersonalWorkspace ? "Personal Projects" : "Organization Projects"}
						</h1>
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						{isPersonalWorkspace
							? `Private projects and personal execution for ${user.name}.`
							: `Collaborative execution projects in ${organization?.name}.`}
					</p>
				</div>

				<Button
					onClick={() => {
						setSelectedProduct(orgProducts[0]?.id || "");
						setCreateModalOpen(true);
					}}
					className="gap-2 bg-primary hover:bg-primary/90 shadow-xs text-xs"
				>
					<Plus className="w-4 h-4" /> Create Project
				</Button>
			</div>

			{/* Projects Grid */}
			{workspaceProjects.length === 0 ? (
				<Card className="border-dashed p-12 text-center">
					<FolderKanban className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
					<h3 className="font-semibold text-foreground text-sm">No projects in this workspace yet</h3>
					<p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
						Rule: <strong>No Project → No Task</strong>. Create your first project to start organizing tasks,
						chatting with team members, tracking time, and logging progress.
					</p>
					<Button
						onClick={() => setCreateModalOpen(true)}
						className="mt-4 bg-primary hover:bg-primary/90 text-xs"
					>
						<Plus className="w-4 h-4 mr-1.5" /> Create First Project
					</Button>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
					{workspaceProjects.map((project) => {
						const parentProd = products.find((p) => p.id === project.productId);
						const projectTasks = tasks.filter((t) => t.projectId === project.id);
						const completedTasks = projectTasks.filter((t) => t.status === "DONE");
						const memberUsers = users.filter((u) => project.memberIds.includes(u.id));
						const leadUser = users.find((u) => u.id === project.leadId);
						const totalSeconds = projectTasks.reduce((acc, t) => acc + (t.trackedSeconds || 0), 0);
						const completionRate =
							projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;

						return (
							<Card
								key={project.id}
								onClick={() => navigate(`/projects/${project.id}`)}
								className="hover:border-primary/50 transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs cursor-pointer group"
							>
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between gap-2">
										<div>
											{!isPersonalWorkspace && (
												<div className="text-[10px] text-primary font-bold uppercase tracking-wider">
													{parentProd?.name || "General Product"}
												</div>
											)}
											<CardTitle className="text-base font-semibold group-hover:text-primary transition-colors mt-0.5">
												{project.name}
											</CardTitle>
										</div>
										<Badge
											variant={
												project.status === "ACTIVE"
													? "success"
													: project.status === "COMPLETED"
													? "default"
													: "secondary"
											}
											className="text-[10px] uppercase font-bold shrink-0"
										>
											{project.status}
										</Badge>
									</div>
									<CardDescription className="text-xs line-clamp-2 mt-1">
										{project.description || "No description provided."}
									</CardDescription>
								</CardHeader>

								<CardContent className="space-y-4">
									{/* Dates, Task Count & Time */}
									<div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs">
										<div className="space-y-0.5">
											<div className="text-[10px] text-muted-foreground flex items-center gap-1">
												<Calendar className="w-3 h-3" /> Due Date
											</div>
											<div className="font-semibold text-[11px] truncate">{project.targetDate || "—"}</div>
										</div>
										<div className="space-y-0.5">
											<div className="text-[10px] text-muted-foreground flex items-center gap-1">
												<CheckSquare className="w-3 h-3" /> Tasks
											</div>
											<div className="font-semibold text-[11px]">
												{completedTasks.length}/{projectTasks.length} ({completionRate}%)
											</div>
										</div>
										<div className="space-y-0.5">
											<div className="text-[10px] text-muted-foreground flex items-center gap-1">
												<Clock className="w-3 h-3" /> Time
											</div>
											<div className="font-semibold text-[11px] font-mono text-primary">
												{(totalSeconds / 3600).toFixed(1)}h
											</div>
										</div>
									</div>

									{/* Lead & Members */}
									<div className="flex items-center justify-between gap-2 text-xs">
										{leadUser ? (
											<div className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
												<Crown className="w-3.5 h-3.5 text-primary" />
												<span className="text-muted-foreground">Lead:</span>
												<span className="font-semibold">{leadUser.name.split(" ")[0]}</span>
											</div>
										) : (
											<div className="text-[11px] text-muted-foreground">
												{memberUsers.length} {memberUsers.length === 1 ? "Member" : "Members"}
											</div>
										)}

										<div className="flex -space-x-1.5 overflow-hidden">
											{memberUsers.slice(0, 3).map((u) => (
												<Avatar key={u.id} className="w-5 h-5 border border-background">
													<AvatarImage src={u.avatar} />
													<AvatarFallback className="text-[9px]">{u.name[0]}</AvatarFallback>
												</Avatar>
											))}
										</div>
									</div>

									{/* Action Footer */}
									<div
										className="flex items-center justify-between pt-2.5 border-t border-border/50 text-xs"
										onClick={(e) => e.stopPropagation()}
									>
										<Link to={`/projects/${project.id}`}>
											<Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary p-0 hover:bg-transparent">
												Open Project Hub <ArrowRight className="w-3 h-3 ml-1" />
											</Button>
										</Link>

										{can("project.delete") && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDelete(project.id, project.name)}
												className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 rounded-md"
												title="Delete Project"
											>
												<Trash2 className="w-3.5 h-3.5" />
											</Button>
										)}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{/* Create Project Modal */}
			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				<DialogContent className="sm:max-w-[480px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-base">
							<FolderKanban className="w-5 h-5 text-primary" /> Create {isPersonalWorkspace ? "Personal" : "Organization"} Project
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Initialize an active project container for tasks, chat, files, time, and progress.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleCreate} className="space-y-4 py-2">
						{!isPersonalWorkspace && orgProducts.length > 0 && (
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Parent Product</Label>
								<Select value={selectedProduct} onValueChange={setSelectedProduct}>
									<SelectTrigger className="h-9 text-xs">
										<SelectValue placeholder="Select product" />
									</SelectTrigger>
									<SelectContent>
										{orgProducts.map((p) => (
											<SelectItem key={p.id} value={p.id}>
												{p.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Project Name *</Label>
							<Input
								placeholder="e.g. Infrastructure V2, Marketing Website"
								value={projName}
								onChange={(e) => setProjName(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Description</Label>
							<Textarea
								placeholder="What are the key goals and deliverables?"
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
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									className="h-9 text-xs"
								/>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Target / Due Date</Label>
								<Input
									type="date"
									value={targetDate}
									onChange={(e) => setTargetDate(e.target.value)}
									className="h-9 text-xs"
								/>
							</div>
						</div>

						<DialogFooter className="gap-2 pt-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								Create Project
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
