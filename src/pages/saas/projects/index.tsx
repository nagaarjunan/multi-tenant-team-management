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
import { Checkbox } from "@/ui/checkbox";
import {
	FolderKanban,
	Plus,
	CheckSquare,
	Calendar,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";
import type { Project } from "@/types/saas";

export default function ProjectsPage() {
	const { organization, activeOrgMembers, can } = useAuthorization();
	const projects = useSaaSStore((s) => s.projects);
	const products = useSaaSStore((s) => s.products);
	const tasks = useSaaSStore((s) => s.tasks);
	const createProject = useSaaSStore((s) => s.createProject);
	const deleteProject = useSaaSStore((s) => s.deleteProject);
	const users = useSaaSStore((s) => s.users);

	// Filter for current org
	const orgProjects = useMemo(() => projects.filter((p) => p.orgId === organization?.id), [projects, organization?.id]);
	const orgProducts = useMemo(() => products.filter((p) => p.orgId === organization?.id), [products, organization?.id]);

	// Modal States
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [projName, setProjName] = useState("");
	const [projDesc, setProjDesc] = useState("");
	const [selectedProduct, setSelectedProduct] = useState("");
	const [status, setStatus] = useState<Project["status"]>("ACTIVE");
	const [startDate, setStartDate] = useState("2026-02-01");
	const [targetDate, setTargetDate] = useState("2026-05-01");
	const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!projName.trim()) {
			toast.error("Please enter a project name");
			return;
		}
		if (!selectedProduct) {
			toast.error("Please select a parent product");
			return;
		}
		if (!organization) return;

		createProject({
			orgId: organization.id,
			productId: selectedProduct,
			name: projName.trim(),
			description: projDesc.trim(),
			status,
			startDate,
			targetDate,
			memberIds: selectedMembers,
		});

		toast.success(`Project '${projName}' created!`);
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

	const toggleMember = (userId: string) => {
		if (selectedMembers.includes(userId)) {
			setSelectedMembers(selectedMembers.filter((id) => id !== userId));
		} else {
			setSelectedMembers([...selectedMembers, userId]);
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
						<h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						Execution projects belonging to products in {organization?.name}.
					</p>
				</div>

				{can("project.create") && (
					<Button
						onClick={() => {
							setSelectedProduct(orgProducts[0]?.id || "");
							setSelectedMembers(activeOrgMembers.map((m) => m.user.id).slice(0, 3));
							setCreateModalOpen(true);
						}}
						className="gap-2 bg-primary hover:bg-primary/90 shadow-xs"
					>
						<Plus className="w-4 h-4" /> Create Project
					</Button>
				)}
			</div>

			{/* Projects List */}
			{orgProjects.length === 0 ? (
				<Card className="border-dashed p-12 text-center">
					<FolderKanban className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
					<h3 className="font-semibold text-foreground text-sm">No projects found</h3>
					<p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
						Create projects under your products to start tracking tasks and daily execution.
					</p>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
					{orgProjects.map((project) => {
						const parentProd = products.find((p) => p.id === project.productId);
						const projectTasks = tasks.filter((t) => t.projectId === project.id);
						const completedTasks = projectTasks.filter((t) => t.status === "DONE");
						const memberUsers = users.filter((u) => project.memberIds.includes(u.id));

						return (
							<Card key={project.id} className="hover:border-primary/40 transition-all flex flex-col justify-between shadow-xs">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between gap-2">
										<div>
											<div className="text-[10px] text-primary font-bold uppercase tracking-wider">
												{parentProd?.name || "General Product"}
											</div>
											<CardTitle className="text-base font-semibold mt-0.5">{project.name}</CardTitle>
										</div>
										<Badge
											variant={
												project.status === "ACTIVE"
													? "success"
													: project.status === "PLANNING"
													? "info"
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
									{/* Dates & Task Count */}
									<div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/40 text-xs">
										<div className="space-y-0.5">
											<div className="text-[10px] text-muted-foreground flex items-center gap-1">
												<Calendar className="w-3 h-3" /> Target Date
											</div>
											<div className="font-semibold text-[11px]">{project.targetDate}</div>
										</div>
										<div className="space-y-0.5">
											<div className="text-[10px] text-muted-foreground flex items-center gap-1">
												<CheckSquare className="w-3 h-3" /> Tasks
											</div>
											<div className="font-semibold text-[11px]">
												{completedTasks.length} / {projectTasks.length} Done
											</div>
										</div>
									</div>

									{/* Members */}
									<div className="space-y-1">
										<div className="text-[11px] font-semibold text-muted-foreground">Team Access:</div>
										<div className="flex items-center gap-1 flex-wrap">
											{memberUsers.map((u) => (
												<div key={u.id} className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded text-[11px]">
													<Avatar className="w-3.5 h-3.5">
														<AvatarImage src={u.avatar} />
														<AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
													</Avatar>
													<span>{u.name.split(" ")[0]}</span>
												</div>
											))}
										</div>
									</div>

									{/* Action Links */}
									<div className="flex items-center justify-between pt-2 border-t border-border/40">
										<Link to="/tasks">
											<Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 text-primary">
												<CheckSquare className="w-3.5 h-3.5" /> Tasks & Board
											</Button>
										</Link>

										{can("project.delete") && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDelete(project.id, project.name)}
												className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
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
						<DialogTitle className="flex items-center gap-2">
							<FolderKanban className="w-5 h-5 text-primary" /> Create Project
						</DialogTitle>
						<DialogDescription className="text-xs">
							Initialize an active project under a product portfolio.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleCreate} className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Parent Product *</Label>
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

						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Project Name *</Label>
							<Input
								placeholder="e.g. Payment Gateway Integration, Release V2"
								value={projName}
								onChange={(e) => setProjName(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Description</Label>
							<Textarea
								placeholder="Project deliverables and milestone targets"
								value={projDesc}
								onChange={(e) => setProjDesc(e.target.value)}
								className="text-xs resize-none"
								rows={2}
							/>
						</div>

						<div className="grid grid-cols-3 gap-2">
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Status</Label>
								<Select value={status} onValueChange={(v) => setStatus(v as Project["status"])}>
									<SelectTrigger className="h-9 text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="PLANNING">Planning</SelectItem>
										<SelectItem value="ACTIVE">Active</SelectItem>
										<SelectItem value="ON_HOLD">On Hold</SelectItem>
										<SelectItem value="COMPLETED">Completed</SelectItem>
									</SelectContent>
								</Select>
							</div>

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
								<Label className="text-xs font-semibold">Target Date</Label>
								<Input
									type="date"
									value={targetDate}
									onChange={(e) => setTargetDate(e.target.value)}
									className="h-9 text-xs"
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Assign Members:</Label>
							<div className="max-h-28 overflow-y-auto space-y-1 border border-border/60 rounded-lg p-2 bg-muted/20">
								{activeOrgMembers.map((m) => (
									<div
										key={m.user.id}
										onClick={() => toggleMember(m.user.id)}
										className="flex items-center justify-between p-1 rounded hover:bg-card cursor-pointer"
									>
										<div className="flex items-center gap-2">
											<Checkbox checked={selectedMembers.includes(m.user.id)} />
											<span className="text-xs">{m.user.name}</span>
										</div>
									</div>
								))}
							</div>
						</div>

						<DialogFooter className="pt-3 gap-2">
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
