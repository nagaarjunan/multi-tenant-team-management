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
	AlertOctagon,
	Plus,
	CheckCircle2,
	Flame,
	Check,
} from "lucide-react";
import { toast } from "sonner";
import type { Blocker, BlockerSeverity } from "@/types/saas";

export default function BlockersPage() {
	const { organization, activeOrgMembers, user, isPersonalWorkspace, can } = useAuthorization();
	const blockers = useSaaSStore((s) => s.blockers);
	const tasks = useSaaSStore((s) => s.tasks);
	const teams = useSaaSStore((s) => s.teams);
	const users = useSaaSStore((s) => s.users);
	const createBlocker = useSaaSStore((s) => s.createBlocker);
	const reportTaskBlocker = useSaaSStore((s) => s.reportTaskBlocker);
	const resolveBlocker = useSaaSStore((s) => s.resolveBlocker);
	const escalateBlocker = useSaaSStore((s) => s.escalateBlocker);

	// Filter blockers for active workspace
	const orgBlockers = useMemo(() => {
		if (isPersonalWorkspace) {
			return blockers.filter((b) => b.reporterId === user.id || b.orgId === "personal" || !b.orgId);
		}
		return blockers.filter((b) => b.orgId === organization?.id);
	}, [blockers, isPersonalWorkspace, user.id, organization?.id]);

	const orgTasks = useMemo(() => {
		if (isPersonalWorkspace) {
			return tasks.filter((t) => t.workspaceType === "personal");
		}
		return tasks.filter((t) => t.orgId === organization?.id);
	}, [tasks, isPersonalWorkspace, organization?.id]);

	const orgTeams = useMemo(() => teams.filter((t) => t.orgId === organization?.id), [teams, organization?.id]);

	// Modal States
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [selectedTaskId, setSelectedTaskId] = useState("");
	const [selectedTeamId, setSelectedTeamId] = useState("");
	const [assigneeId, setAssigneeId] = useState("");
	const [severity, setSeverity] = useState<BlockerSeverity>("HIGH");

	// Resolve Modal
	const [resolvingBlocker, setResolvingBlocker] = useState<Blocker | null>(null);
	const [resolutionText, setResolutionText] = useState("");

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			toast.error("Please enter a blocker title");
			return;
		}

		if (selectedTaskId) {
			reportTaskBlocker(selectedTaskId, title.trim(), description.trim(), severity);
			toast.success("Blocker reported! Associated task marked as BLOCKED.");
		} else {
			createBlocker({
				orgId: isPersonalWorkspace ? "personal" : organization?.id || "",
				title: title.trim(),
				description: description.trim(),
				teamId: selectedTeamId || undefined,
				reporterId: user.id,
				assigneeId: assigneeId || undefined,
				severity,
				status: "OPEN",
			});
			toast.success("Blocker reported!");
		}

		setCreateModalOpen(false);
		setTitle("");
		setDescription("");
		setSelectedTaskId("");
	};

	const handleResolve = () => {
		if (!resolvingBlocker) return;
		resolveBlocker(resolvingBlocker.id, resolutionText.trim() || "Resolved by team");
		toast.success("Blocker marked as resolved.");
		setResolvingBlocker(null);
		setResolutionText("");
	};

	const handleEscalate = (blocker: Blocker) => {
		if (!can("blocker.escalate", blocker)) {
			toast.error("You do not have permission to escalate this blocker.");
			return;
		}
		escalateBlocker(blocker.id);
		toast.warning(`Blocker escalated to CRITICAL severity.`);
	};

	return (
		<div className="space-y-6 pb-12">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-destructive/10 text-destructive">
							<AlertOctagon className="w-5 h-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">Blocker Tracking & Triage</h1>
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						Obstacles impacting delivery. Triage, escalate, and resolve blockers collaboratively.
					</p>
				</div>

				{can("blocker.create") && (
					<Button
						onClick={() => {
							setSelectedTeamId(orgTeams[0]?.id || "");
							setSelectedTaskId(orgTasks[0]?.id || "");
							setCreateModalOpen(true);
						}}
						className="gap-2 bg-destructive hover:bg-destructive/90 text-white shadow-xs"
					>
						<Plus className="w-4 h-4" /> Report Blocker
					</Button>
				)}
			</div>

			{/* Blockers List */}
			{orgBlockers.length === 0 ? (
				<Card className="border-dashed p-12 text-center">
					<CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3" />
					<h3 className="font-semibold text-foreground text-sm">No Active Blockers</h3>
					<p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
						No blockers reported in {organization?.name}. Everything is moving according to plan!
					</p>
				</Card>
			) : (
				<div className="space-y-4">
					{orgBlockers.map((blocker) => {
						const reporter = users.find((u) => u.id === blocker.reporterId);
						const assignee = users.find((u) => u.id === blocker.assigneeId);
						const relatedTask = tasks.find((t) => t.id === blocker.taskId);
						const relatedTeam = teams.find((t) => t.id === blocker.teamId);
						const isResolved = blocker.status === "RESOLVED";

						return (
							<Card
								key={blocker.id}
								className={`transition-all shadow-xs ${
									isResolved
										? "border-border/60 bg-card/60 opacity-80"
										: blocker.severity === "CRITICAL"
										? "border-destructive/40 bg-destructive/5"
										: "border-warning/30 bg-warning/5"
								}`}
							>
								<CardHeader className="pb-3">
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<CardTitle className="text-base font-semibold">{blocker.title}</CardTitle>
												<Badge
													variant={
														blocker.severity === "CRITICAL"
															? "destructive"
															: blocker.severity === "HIGH"
															? "warning"
															: "secondary"
													}
													className="text-[10px] uppercase font-bold"
												>
													{blocker.severity}
												</Badge>
												<Badge
													variant={isResolved ? "success" : "outline"}
													className="text-[10px] uppercase font-medium"
												>
													{blocker.status}
												</Badge>
											</div>
											<CardDescription className="text-xs text-foreground/80">
												{blocker.description}
											</CardDescription>
										</div>

										<div className="flex items-center gap-2 shrink-0">
											{!isResolved && (
												<>
													{can("blocker.escalate", blocker) && blocker.severity !== "CRITICAL" && (
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleEscalate(blocker)}
															className="text-xs h-8 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
														>
															<Flame className="w-3.5 h-3.5" /> Escalate
														</Button>
													)}

													{can("blocker.resolve", blocker) && (
														<Button
															size="sm"
															onClick={() => setResolvingBlocker(blocker)}
															className="text-xs h-8 gap-1 bg-success hover:bg-success/90 text-white"
														>
															<Check className="w-3.5 h-3.5" /> Resolve
														</Button>
													)}
												</>
											)}
										</div>
									</div>
								</CardHeader>

								<CardContent className="space-y-2 pt-0 text-xs text-muted-foreground border-t border-border/40 mt-3 pt-3">
									<div className="flex flex-wrap items-center justify-between gap-2">
										<div className="flex items-center gap-4 text-[11px]">
											<div className="flex items-center gap-1.5">
												<span>Reported by:</span>
												<Avatar className="w-4 h-4">
													<AvatarImage src={reporter?.avatar} />
													<AvatarFallback className="text-[8px]">{reporter?.name?.charAt(0)}</AvatarFallback>
												</Avatar>
												<span className="font-semibold text-foreground">{reporter?.name}</span>
											</div>

											{assignee && (
												<div className="flex items-center gap-1.5">
													<span>Assigned to:</span>
													<Avatar className="w-4 h-4">
														<AvatarImage src={assignee?.avatar} />
														<AvatarFallback className="text-[8px]">{assignee?.name?.charAt(0)}</AvatarFallback>
													</Avatar>
													<span className="font-semibold text-foreground">{assignee?.name}</span>
												</div>
											)}

											{relatedTask && <span>Task: <strong>{relatedTask.title}</strong></span>}
											{relatedTeam && <span>Team: <strong>{relatedTeam.name}</strong></span>}
										</div>

										<div className="text-[10px]">
											{isResolved ? (
												<span className="text-success font-medium">
													Resolved on {new Date(blocker.resolvedAt || blocker.createdAt).toLocaleDateString()}
												</span>
											) : (
												<span>Logged on {new Date(blocker.createdAt).toLocaleDateString()}</span>
											)}
										</div>
									</div>

									{isResolved && blocker.resolution && (
										<div className="p-2.5 rounded-lg bg-success/10 border border-success/20 text-foreground text-xs mt-2">
											<strong>Resolution:</strong> {blocker.resolution}
										</div>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{/* Create Blocker Modal */}
			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				<DialogContent className="sm:max-w-[480px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<AlertOctagon className="w-5 h-5" /> Report Delivery Blocker
						</DialogTitle>
						<DialogDescription className="text-xs">
							Flag impediments stopping task progress or team execution.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleCreate} className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Blocker Summary *</Label>
							<Input
								placeholder="e.g. Third-party API rate limit, Missing environment secrets"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Detailed Description</Label>
							<Textarea
								placeholder="Describe the root cause, impacted systems, and what is required to unblock"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="text-xs resize-none"
								rows={3}
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Severity</Label>
								<Select value={severity} onValueChange={(v) => setSeverity(v as BlockerSeverity)}>
									<SelectTrigger className="h-9 text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="LOW">Low</SelectItem>
										<SelectItem value="MEDIUM">Medium</SelectItem>
										<SelectItem value="HIGH">High</SelectItem>
										<SelectItem value="CRITICAL">Critical (P0)</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Assign Triage Owner</Label>
								<Select value={assigneeId} onValueChange={setAssigneeId}>
									<SelectTrigger className="h-9 text-xs">
										<SelectValue placeholder="Assign resolver" />
									</SelectTrigger>
									<SelectContent>
										{activeOrgMembers.map((m) => (
											<SelectItem key={m.user.id} value={m.user.id}>
												{m.user.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<DialogFooter className="pt-3 gap-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-destructive hover:bg-destructive/90 text-white">
								Submit Blocker
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Resolve Blocker Dialog */}
			{resolvingBlocker && (
				<Dialog open={!!resolvingBlocker} onOpenChange={(open) => !open && setResolvingBlocker(null)}>
					<DialogContent className="sm:max-w-[450px]">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2 text-success">
								<CheckCircle2 className="w-5 h-5" /> Mark Blocker as Resolved
							</DialogTitle>
							<DialogDescription className="text-xs">
								Document the resolution so other team members stay informed.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-3 py-2">
							<Label className="text-xs font-semibold">Resolution Notes</Label>
							<Textarea
								placeholder="e.g. Upgraded API quota, sandbox keys refreshed, PR merged..."
								value={resolutionText}
								onChange={(e) => setResolutionText(e.target.value)}
								className="text-xs resize-none"
								rows={3}
							/>
						</div>

						<DialogFooter className="pt-2 gap-2">
							<Button variant="outline" size="sm" onClick={() => setResolvingBlocker(null)}>
								Cancel
							</Button>
							<Button size="sm" onClick={handleResolve} className="bg-success hover:bg-success/90 text-white">
								Confirm Resolution
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
