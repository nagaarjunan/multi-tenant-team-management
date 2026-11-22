import React, { useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useProjectStore, useTeamStore, useOrgStore, useTaskStore } from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/ui/select';
import {
	FolderKanban,
	Plus,
	Calendar,
	Crown,
	Users,
	Trash2,
	ArrowRight,
	ListFilter,
	CheckSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import OrgHeaderSwitcher from '../components/OrgHeaderSwitcher';
import type { BackendProject, BackendProjectStatus } from '@/types/backend';

export const ProjectsPage: React.FC = observer(() => {
	const navigate = useNavigate();
	const projectStore = useProjectStore();
	const teamStore = useTeamStore();
	const orgStore = useOrgStore();
	const taskStore = useTaskStore();

	const currentOrg = orgStore.currentOrganization;
	const orgId = currentOrg?._id || currentOrg?.id;

	// Create Project Modal State
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [selectedTeamId, setSelectedTeamId] = useState('');
	const [leadId, setLeadId] = useState('');
	const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
	const [status, setStatus] = useState<BackendProjectStatus>('planning');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');

	// Project Member Allocation Modal
	const [allocationModalProject, setAllocationModalProject] = useState<BackendProject | null>(null);
	const [newMemberId, setNewMemberId] = useState('');

	useEffect(() => {
		if (orgId) {
			projectStore.fetchOrgProjects(orgId);
			teamStore.fetchOrgTeams(orgId);
		}
	}, [orgId]);

	// Team selected inside creation modal
	const modalSelectedTeam = useMemo(() => {
		return teamStore.teams.find((t) => (t._id || t.id) === selectedTeamId) || null;
	}, [teamStore.teams, selectedTeamId]);

	// Allowed candidates for Project Lead and Members (must be members of the selected team!)
	const teamCandidates = useMemo(() => {
		if (!modalSelectedTeam) return [];
		const list: Array<{ id: string; name: string }> = [];
		const leaderObj = typeof modalSelectedTeam.leaderId === 'object' ? (modalSelectedTeam.leaderId as any) : null;
		const leaderId = leaderObj?._id || leaderObj?.id || (modalSelectedTeam.leaderId as string);
		if (leaderId) {
			list.push({ id: leaderId, name: (leaderObj?.name || 'Leader ' + leaderId.slice(-4)) + ' (Team Leader)' });
		}
		for (const m of modalSelectedTeam.members || []) {
			const mObj = typeof m === 'object' ? (m as any) : null;
			const mId = mObj?._id || mObj?.id || (m as string);
			if (mId && !list.some((item) => item.id === mId)) {
				list.push({ id: mId, name: mObj?.name || 'Member ' + mId.slice(-4) });
			}
		}
		return list;
	}, [modalSelectedTeam]);

	const handleCreateProject = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!orgId || !name.trim() || !selectedTeamId || !leadId) return;

		try {
			await projectStore.createProject({
				name: name.trim(),
				description: description.trim() || undefined,
				organizationId: orgId,
				teamId: selectedTeamId,
				leadId,
				members: selectedMembers,
				status,
				startDate: startDate || undefined,
				endDate: endDate || undefined,
			});
			setCreateModalOpen(false);
			setName('');
			setDescription('');
			setSelectedTeamId('');
			setLeadId('');
			setSelectedMembers([]);
		} catch {
			// Toast handled in store
		}
	};

	const handleDeleteProject = async (id: string, projName: string) => {
		if (confirm(`Are you sure you want to delete project "${projName}"?`)) {
			await projectStore.deleteProject(id);
		}
	};

	const handleAllocateMember = async () => {
		if (!allocationModalProject || !newMemberId) return;
		const projId = allocationModalProject._id || allocationModalProject.id;
		await projectStore.allocateMembers(projId, [newMemberId]);
		// Refresh selected project in modal
		const updated = projectStore.projects.find((p) => (p._id || p.id) === projId);
		if (updated) setAllocationModalProject(updated);
		setNewMemberId('');
	};

	const handleRemoveMember = async (userId: string) => {
		if (!allocationModalProject) return;
		const projId = allocationModalProject._id || allocationModalProject.id;
		await projectStore.removeMember(projId, userId);
		const updated = projectStore.projects.find((p) => (p._id || p.id) === projId);
		if (updated) setAllocationModalProject(updated);
	};

	return (
		<div className="space-y-6 pb-12">
			{/* Top Bar */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<FolderKanban className="w-5 h-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
					</div>
					<p className="text-xs text-muted-foreground">
						Team-allocated project containers for tracking tasks and delivery.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<OrgHeaderSwitcher />
					<Button
						size="sm"
						onClick={() => {
							if (teamStore.teams.length === 0) {
								alert('Please create a Team first! Projects must be allocated from an existing team.');
								return;
							}
							setSelectedTeamId(teamStore.teams[0]?._id || teamStore.teams[0]?.id || '');
							setCreateModalOpen(true);
						}}
						className="gap-1.5 text-xs h-9 bg-primary hover:bg-primary/90 shadow-xs"
					>
						<Plus className="w-3.5 h-3.5" /> Create Project
					</Button>
				</div>
			</div>

			{/* Filters Bar */}
			<div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-2xs">
				<div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
					<ListFilter className="w-3.5 h-3.5 text-primary" /> Filter:
				</div>

				<Select
					value={projectStore.filterTeamId}
					onValueChange={(val) => projectStore.setFilterTeamId(val)}
				>
					<SelectTrigger className="h-8 text-xs w-40">
						<SelectValue placeholder="Team" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All Teams</SelectItem>
						{teamStore.teams.map((t) => (
							<SelectItem key={t._id || t.id} value={t._id || t.id}>
								{t.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={projectStore.filterStatus}
					onValueChange={(val) => projectStore.setFilterStatus(val)}
				>
					<SelectTrigger className="h-8 text-xs w-36">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All Statuses</SelectItem>
						<SelectItem value="planning">Planning</SelectItem>
						<SelectItem value="in-progress">In Progress</SelectItem>
						<SelectItem value="completed">Completed</SelectItem>
						<SelectItem value="on-hold">On Hold</SelectItem>
					</SelectContent>
				</Select>

				<span className="text-[11px] text-muted-foreground ml-auto">
					Showing {projectStore.filteredProjects.length} of {projectStore.projects.length} projects
				</span>
			</div>

			{/* Projects Grid */}
			{projectStore.filteredProjects.length === 0 ? (
				<Card className="border-dashed p-12 text-center">
					<FolderKanban className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
					<h3 className="font-semibold text-foreground text-sm">No projects found</h3>
					<p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
						Projects belong to a Team and have a designated Project Lead.
					</p>
					<Button
						onClick={() => {
							if (teamStore.teams.length > 0) {
								setSelectedTeamId(teamStore.teams[0]._id || teamStore.teams[0].id);
							}
							setCreateModalOpen(true);
						}}
						className="mt-4 bg-primary text-xs"
					>
						<Plus className="w-3.5 h-3.5 mr-1.5" /> Create Project
					</Button>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
					{projectStore.filteredProjects.map((project) => {
						const projId = project._id || project.id;
						const teamObj = typeof project.teamId === 'object' ? (project.teamId as any) : null;
						const teamName = teamObj?.name || 'Team';

						const leadObj = typeof project.leadId === 'object' ? (project.leadId as any) : null;
						const leadName = leadObj?.name || 'Unassigned';

						return (
							<Card
								key={projId}
								className="hover:border-primary/50 transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs group"
							>
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between gap-2">
										<div>
											<span className="text-[10px] text-primary font-bold uppercase tracking-wider">
												{teamName}
											</span>
											<CardTitle className="text-base font-semibold text-foreground mt-0.5">
												{project.name}
											</CardTitle>
										</div>
										<Badge
											variant={
												project.status === 'completed'
													? 'success'
													: project.status === 'in-progress'
													? 'default'
													: 'secondary'
											}
											className="text-[10px] uppercase font-bold shrink-0"
										>
											{project.status.replace('-', ' ')}
										</Badge>
									</div>
									<CardDescription className="text-xs line-clamp-2 mt-1">
										{project.description || 'No description provided.'}
									</CardDescription>
								</CardHeader>

								<CardContent className="space-y-4">
									{/* Dates & Lead */}
									<div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs">
										<div className="space-y-0.5">
											<div className="text-[10px] text-muted-foreground flex items-center gap-1">
												<Crown className="w-3 h-3 text-warning" /> Project Lead
											</div>
											<div className="font-semibold text-[11px] truncate">{leadName}</div>
										</div>
										<div className="space-y-0.5">
											<div className="text-[10px] text-muted-foreground flex items-center gap-1">
												<Users className="w-3 h-3" /> Allocated
											</div>
											<div className="font-semibold text-[11px]">
												{project.members?.length || 0} members
											</div>
										</div>
									</div>

									{/* Action Footer */}
									<div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => {
													projectStore.selectProject(projId);
													navigate('/tasks');
												}}
												className="h-7 text-xs gap-1 text-primary hover:bg-primary/10 px-2"
											>
												<CheckSquare className="w-3 h-3" /> Tasks
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setAllocationModalProject(project)}
												className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground px-2"
											>
												<Users className="w-3 h-3" /> Members
											</Button>
										</div>

										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDeleteProject(projId, project.name)}
											className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 rounded-md"
										>
											<Trash2 className="w-3.5 h-3.5" />
										</Button>
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
						<DialogTitle className="text-base font-bold flex items-center gap-2">
							<FolderKanban className="w-4 h-4 text-primary" /> Create New Project
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Projects belong to a Team. Lead and allocated members must belong to the selected team.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleCreateProject} className="space-y-3.5 py-2">
						{/* Step 1: Select Team */}
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Assigned Team *</Label>
							<Select
								value={selectedTeamId}
								onValueChange={(val) => {
									setSelectedTeamId(val);
									setLeadId('');
									setSelectedMembers([]);
								}}
							>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue placeholder="Select parent team" />
								</SelectTrigger>
								<SelectContent>
									{teamStore.teams.map((t) => (
										<SelectItem key={t._id || t.id} value={t._id || t.id}>
											{t.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Project Name */}
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Project Name *</Label>
							<Input
								placeholder="e.g. Infrastructure Modernization"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>

						{/* Description */}
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Description</Label>
							<Textarea
								placeholder="Objectives, deliverables, and architecture goals..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="text-xs resize-none h-16"
							/>
						</div>

						{/* Step 2: Select Project Lead (strictly filtered to members of the selected team!) */}
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Project Lead / Product Manager *</Label>
							<Select value={leadId} onValueChange={setLeadId} disabled={!selectedTeamId}>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue
										placeholder={
											!selectedTeamId ? 'Select team first' : 'Select lead from team members'
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{teamCandidates.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{c.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Status */}
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Status</Label>
							<Select value={status} onValueChange={(val) => setStatus(val as BackendProjectStatus)}>
								<SelectTrigger className="h-9 text-xs uppercase font-semibold">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="planning">PLANNING</SelectItem>
									<SelectItem value="in-progress">IN PROGRESS</SelectItem>
									<SelectItem value="completed">COMPLETED</SelectItem>
									<SelectItem value="on-hold">ON HOLD</SelectItem>
								</SelectContent>
							</Select>
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

			{/* Project Member Allocation Modal */}
			<Dialog open={!!allocationModalProject} onOpenChange={() => setAllocationModalProject(null)}>
				<DialogContent className="sm:max-w-[460px]">
					<DialogHeader>
						<DialogTitle className="text-base font-bold flex items-center gap-2">
							<Users className="w-4 h-4 text-primary" /> Members of {allocationModalProject?.name}
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Allocate or remove members. Must belong to the project's parent team.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3.5 py-2">
						{/* Add Member Input */}
						<div className="flex items-center gap-2">
							<Input
								placeholder="Paste team member's User ID"
								value={newMemberId}
								onChange={(e) => setNewMemberId(e.target.value)}
								className="h-8 text-xs font-mono"
							/>
							<Button size="sm" onClick={handleAllocateMember} className="h-8 text-xs">
								Allocate
							</Button>
						</div>

						{/* Existing Members List */}
						<div className="border rounded-xl divide-y max-h-56 overflow-y-auto">
							{allocationModalProject?.members?.map((mem) => {
								const memObj = typeof mem === 'object' ? (mem as any) : null;
								const mId = memObj?._id || memObj?.id || (mem as string);
								const mName = memObj?.name || 'User ' + mId.slice(-4);
								const isLead =
									(typeof allocationModalProject.leadId === 'object'
										? (allocationModalProject.leadId as any)._id
										: allocationModalProject.leadId) === mId;

								return (
									<div key={mId} className="flex items-center justify-between p-2.5 text-xs">
										<div>
											<p className="font-semibold text-foreground flex items-center gap-1.5">
												{mName}
												{isLead && (
													<Badge variant="outline" className="text-[9px] uppercase font-bold text-warning border-warning">
														Lead
													</Badge>
												)}
											</p>
											<p className="text-[10px] text-muted-foreground">{memObj?.email || ''}</p>
										</div>
										{!isLead && (
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleRemoveMember(mId)}
												className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 rounded-md"
											>
												<Trash2 className="w-3.5 h-3.5" />
											</Button>
										)}
									</div>
								);
							})}
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" size="sm" onClick={() => setAllocationModalProject(null)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
});

export default ProjectsPage;
