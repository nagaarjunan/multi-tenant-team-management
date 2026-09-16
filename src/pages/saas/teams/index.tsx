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
	Users,
	Sparkles,
	Trash2,
	Edit,
	Plus,
} from "lucide-react";
import { toast } from "sonner";
import type { Team } from "@/types/saas";

export default function TeamsPage() {
	const { organization, activeOrgMembers, can } = useAuthorization();
	const teams = useSaaSStore((s) => s.teams);
	const createTeam = useSaaSStore((s) => s.createTeam);
	const updateTeam = useSaaSStore((s) => s.updateTeam);
	const deleteTeam = useSaaSStore((s) => s.deleteTeam);
	const users = useSaaSStore((s) => s.users);

	// Filter teams for active organization
	const orgTeams = useMemo(() => teams.filter((t) => t.orgId === organization?.id), [teams, organization?.id]);

	// Modal States
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [manageTeam, setManageTeam] = useState<Team | null>(null);

	// Form States
	const [teamName, setTeamName] = useState("");
	const [teamDesc, setTeamDesc] = useState("");
	const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
	const [selectedLead, setSelectedLead] = useState<string>("");

	const openCreateModal = () => {
		setTeamName("");
		setTeamDesc("");
		setSelectedMembers(activeOrgMembers.map((m) => m.user.id).slice(0, 2));
		setSelectedLead("");
		setCreateModalOpen(true);
	};

	const handleCreateTeam = (e: React.FormEvent) => {
		e.preventDefault();
		if (!teamName.trim()) {
			toast.error("Please enter a team name");
			return;
		}
		if (!organization) return;

		createTeam({
			orgId: organization.id,
			name: teamName.trim(),
			description: teamDesc.trim(),
			memberIds: selectedMembers,
			leadId: selectedLead || undefined,
		});

		toast.success(`Team '${teamName}' created successfully!`);
		setCreateModalOpen(false);
	};

	const openManageModal = (team: Team) => {
		setManageTeam(team);
		setTeamName(team.name);
		setTeamDesc(team.description);
		setSelectedMembers(team.memberIds);
		setSelectedLead(team.leadId || "");
	};

	const handleUpdateTeam = () => {
		if (!manageTeam) return;

		// Validation: If a team lead is selected, verify they belong to selectedMembers
		let finalLead = selectedLead;
		if (finalLead && !selectedMembers.includes(finalLead)) {
			toast.error("The selected Team Lead must be a member of the team!");
			return;
		}

		updateTeam(manageTeam.id, {
			name: teamName,
			description: teamDesc,
			memberIds: selectedMembers,
			leadId: finalLead || undefined,
		});

		toast.success(`Team '${teamName}' updated!`);
		setManageTeam(null);
	};

	const handleDeleteTeam = (teamId: string, name: string) => {
		if (confirm(`Are you sure you want to delete the team '${name}'?`)) {
			deleteTeam(teamId);
			toast.success(`Team '${name}' removed.`);
		}
	};

	const toggleMember = (userId: string) => {
		if (selectedMembers.includes(userId)) {
			setSelectedMembers(selectedMembers.filter((id) => id !== userId));
			if (selectedLead === userId) {
				setSelectedLead("");
			}
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
							<Users className="w-5 h-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">Teams</h1>
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						Organize people into functional units. Team Lead is a team responsibility, not a global role.
					</p>
				</div>

				{can("team.create") && (
					<Button onClick={openCreateModal} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
						<Plus className="w-4 h-4" /> Create Team
					</Button>
				)}
			</div>

			{/* Teams Grid */}
			{orgTeams.length === 0 ? (
				<Card className="border-dashed p-12 text-center">
					<Users className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
					<h3 className="font-semibold text-foreground text-sm">No teams yet</h3>
					<p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
						Create your first team to organize people and assign team leadership.
					</p>
					{can("team.create") && (
						<Button onClick={openCreateModal} className="mt-4 gap-1.5" size="sm">
							<Plus className="w-4 h-4" /> Create First Team
						</Button>
					)}
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
					{orgTeams.map((team) => {
						const leadUser = users.find((u) => u.id === team.leadId);
						const teamMembers = users.filter((u) => team.memberIds.includes(u.id));
						const canManageThisTeam = can("team.update", team);

						return (
							<Card key={team.id} className="hover:border-primary/40 transition-all flex flex-col justify-between shadow-xs">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between gap-2">
										<div>
											<CardTitle className="text-base font-semibold">{team.name}</CardTitle>
											<CardDescription className="text-xs line-clamp-2 mt-1">
												{team.description || "No description provided."}
											</CardDescription>
										</div>
										<Badge variant="outline" className="text-[10px] shrink-0 font-medium">
											{team.memberIds.length} members
										</Badge>
									</div>
								</CardHeader>

								<CardContent className="space-y-4">
									{/* Team Lead Section */}
									<div className="p-3 rounded-lg bg-primary/5 border border-primary/15 flex items-center justify-between">
										<div className="flex items-center gap-2 min-w-0">
											<div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
												<Sparkles className="w-3.5 h-3.5" />
											</div>
											<div className="min-w-0">
												<div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
													Team Lead
												</div>
												<div className="text-xs font-semibold text-foreground truncate">
													{leadUser?.name || <span className="text-muted-foreground font-normal italic">None assigned</span>}
												</div>
											</div>
										</div>
										{leadUser && (
											<Badge variant="default" className="text-[9px] px-1 py-0 h-3.5 uppercase font-medium">
												Lead
											</Badge>
										)}
									</div>

									{/* Members Avatars */}
									<div className="space-y-1.5">
										<div className="text-[11px] font-semibold text-muted-foreground">Members:</div>
										<div className="flex items-center gap-1.5 flex-wrap">
											{teamMembers.map((m) => (
												<div key={m.id} className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md text-xs">
													<Avatar className="w-4 h-4">
														<AvatarImage src={m.avatar} alt={m.name} />
														<AvatarFallback className="text-[8px]">{m.name.charAt(0)}</AvatarFallback>
													</Avatar>
													<span className="text-[11px] truncate max-w-[100px]">{m.name}</span>
													{team.leadId === m.id && (
														<Sparkles className="w-2.5 h-2.5 text-primary shrink-0" />
													)}
												</div>
											))}
										</div>
									</div>

									{/* Actions */}
									{canManageThisTeam && (
										<div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
											<Button
												variant="outline"
												size="sm"
												onClick={() => openManageModal(team)}
												className="h-8 text-xs gap-1"
											>
												<Edit className="w-3.5 h-3.5" /> Manage Team
											</Button>
											{can("team.delete") && (
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDeleteTeam(team.id, team.name)}
													className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
												>
													<Trash2 className="w-3.5 h-3.5" />
												</Button>
											)}
										</div>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{/* Create Team Modal */}
			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Users className="w-5 h-5 text-primary" /> Create New Team
						</DialogTitle>
						<DialogDescription className="text-xs">
							Add a team to group work and collaborate in {organization?.name}.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleCreateTeam} className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label htmlFor="tName" className="text-xs font-semibold">Team Name *</Label>
							<Input
								id="tName"
								placeholder="e.g. Backend Engineering, Mobile Team"
								value={teamName}
								onChange={(e) => setTeamName(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>

						<div className="space-y-1.5">
							<Label htmlFor="tDesc" className="text-xs font-semibold">Description</Label>
							<Textarea
								id="tDesc"
								placeholder="Brief overview of team mandate and domain"
								value={teamDesc}
								onChange={(e) => setTeamDesc(e.target.value)}
								className="text-xs resize-none"
								rows={2}
							/>
						</div>

						{/* Select Members */}
						<div className="space-y-2">
							<Label className="text-xs font-semibold">Add Organization Members:</Label>
							<div className="max-h-36 overflow-y-auto space-y-1.5 border border-border/60 rounded-lg p-2 bg-muted/20">
								{activeOrgMembers.map((m) => {
									const isChecked = selectedMembers.includes(m.user.id);
									return (
										<div
											key={m.user.id}
											onClick={() => toggleMember(m.user.id)}
											className="flex items-center justify-between p-1.5 rounded-md hover:bg-card cursor-pointer"
										>
											<div className="flex items-center gap-2">
												<Checkbox checked={isChecked} />
												<Avatar className="w-5 h-5">
													<AvatarImage src={m.user.avatar} />
													<AvatarFallback className="text-[10px]">{m.user.name.charAt(0)}</AvatarFallback>
												</Avatar>
												<span className="text-xs">{m.user.name}</span>
											</div>
											<Badge variant="outline" className="text-[9px] uppercase">
												{m.membership.role}
											</Badge>
										</div>
									);
								})}
							</div>
						</div>

						{/* Team Lead Assignment */}
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Team Lead (Optional):</Label>
							<Select value={selectedLead} onValueChange={setSelectedLead}>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue placeholder="Select Team Lead from chosen members" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No Team Lead</SelectItem>
									{selectedMembers.map((memberId) => {
										const u = users.find((user) => user.id === memberId);
										if (!u) return null;
										return (
											<SelectItem key={u.id} value={u.id}>
												{u.name} ({u.title || "Member"})
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
							<p className="text-[10px] text-muted-foreground">
								Note: In accordance with RBAC rules, only selected team members can be designated as Team Lead.
							</p>
						</div>

						<DialogFooter className="pt-3 gap-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								Create Team
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Manage Team Modal */}
			{manageTeam && (
				<Dialog open={!!manageTeam} onOpenChange={(open) => !open && setManageTeam(null)}>
					<DialogContent className="sm:max-w-[500px]">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<Users className="w-5 h-5 text-primary" /> Manage Team — {manageTeam.name}
							</DialogTitle>
							<DialogDescription className="text-xs">
								Update team details, member roster, and Team Lead responsibility.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-2">
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Team Name</Label>
								<Input
									value={teamName}
									onChange={(e) => setTeamName(e.target.value)}
									className="h-9 text-xs"
								/>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Description</Label>
								<Textarea
									value={teamDesc}
									onChange={(e) => setTeamDesc(e.target.value)}
									className="text-xs resize-none"
									rows={2}
								/>
							</div>

							<div className="space-y-2">
								<Label className="text-xs font-semibold">Team Members:</Label>
								<div className="max-h-36 overflow-y-auto space-y-1.5 border border-border/60 rounded-lg p-2 bg-muted/20">
									{activeOrgMembers.map((m) => {
										const isChecked = selectedMembers.includes(m.user.id);
										return (
											<div
												key={m.user.id}
												onClick={() => toggleMember(m.user.id)}
												className="flex items-center justify-between p-1.5 rounded-md hover:bg-card cursor-pointer"
											>
												<div className="flex items-center gap-2">
													<Checkbox checked={isChecked} />
													<Avatar className="w-5 h-5">
														<AvatarImage src={m.user.avatar} />
														<AvatarFallback className="text-[10px]">{m.user.name.charAt(0)}</AvatarFallback>
													</Avatar>
													<span className="text-xs">{m.user.name}</span>
												</div>
												<Badge variant="outline" className="text-[9px] uppercase">
													{m.membership.role}
												</Badge>
											</div>
										);
									})}
								</div>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Assign Team Lead:</Label>
								<Select
									value={selectedLead || "none"}
									onValueChange={(val) => setSelectedLead(val === "none" ? "" : val)}
								>
									<SelectTrigger className="h-9 text-xs">
										<SelectValue placeholder="Select from team members" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">No Team Lead</SelectItem>
										{selectedMembers.map((memberId) => {
											const u = users.find((user) => user.id === memberId);
											if (!u) return null;
											return (
												<SelectItem key={u.id} value={u.id}>
													{u.name}
												</SelectItem>
											);
										})}
									</SelectContent>
								</Select>
							</div>

							<DialogFooter className="pt-3 gap-2">
								<Button variant="outline" size="sm" onClick={() => setManageTeam(null)}>
									Cancel
								</Button>
								<Button size="sm" onClick={handleUpdateTeam} className="bg-primary hover:bg-primary/90">
									Save Changes
								</Button>
							</DialogFooter>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
