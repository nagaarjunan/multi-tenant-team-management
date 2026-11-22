import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useTeamStore, useOrgStore, useMembershipStore } from '@/store';
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
import { Users, Plus, Crown, Trash2, UserPlus, UserMinus, Shield } from 'lucide-react';
import OrgHeaderSwitcher from '../components/OrgHeaderSwitcher';
import type { BackendTeam } from '@/types/backend';

export const TeamsPage: React.FC = observer(() => {
	const teamStore = useTeamStore();
	const orgStore = useOrgStore();
	const membershipStore = useMembershipStore();

	const currentOrg = orgStore.currentOrganization;
	const orgId = currentOrg?._id || currentOrg?.id;

	// Create Team Modal State
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [leaderId, setLeaderId] = useState('');

	// Manage Members Modal State
	const [selectedTeam, setSelectedTeam] = useState<BackendTeam | null>(null);
	const [addMemberUserId, setAddMemberUserId] = useState('');

	useEffect(() => {
		if (orgId) {
			teamStore.fetchOrgTeams(orgId);
			membershipStore.fetchOrgMembers(orgId);
		}
	}, [orgId]);

	const handleCreateTeam = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!orgId || !name.trim()) return;
		try {
			await teamStore.createTeam({
				name: name.trim(),
				description: description.trim() || undefined,
				organizationId: orgId,
				leaderId: leaderId || undefined,
			});
			setCreateModalOpen(false);
			setName('');
			setDescription('');
			setLeaderId('');
		} catch {
			// Toast handled in store
		}
	};

	const handleDeleteTeam = async (teamId: string, teamName: string) => {
		if (confirm(`Are you sure you want to delete team "${teamName}"?`)) {
			await teamStore.deleteTeam(teamId);
		}
	};

	const handleAddTeamMember = async () => {
		if (!selectedTeam || !addMemberUserId) return;
		const teamId = selectedTeam._id || selectedTeam.id;
		await teamStore.addMember(teamId, addMemberUserId);
		// Update selected team reference
		const updated = teamStore.teams.find((t) => (t._id || t.id) === teamId);
		if (updated) setSelectedTeam(updated);
		setAddMemberUserId('');
	};

	const handleRemoveTeamMember = async (userId: string) => {
		if (!selectedTeam) return;
		const teamId = selectedTeam._id || selectedTeam.id;
		await teamStore.removeMember(teamId, userId);
		// Update selected team reference
		const updated = teamStore.teams.find((t) => (t._id || t.id) === teamId);
		if (updated) setSelectedTeam(updated);
	};

	return (
		<div className="space-y-6 pb-12">
			{/* Top Bar */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-info/10 text-info">
							<Users className="w-5 h-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">Teams</h1>
					</div>
					<p className="text-xs text-muted-foreground">
						Operational and functional teams in {currentOrg ? currentOrg.name : 'your organization'}.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<OrgHeaderSwitcher />
					<Button
						size="sm"
						onClick={() => setCreateModalOpen(true)}
						className="gap-1.5 text-xs h-9 bg-primary hover:bg-primary/90 shadow-xs"
					>
						<Plus className="w-3.5 h-3.5" /> Create Team
					</Button>
				</div>
			</div>

			{/* Teams Grid */}
			{teamStore.teams.length === 0 ? (
				<Card className="border-dashed p-12 text-center">
					<Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
					<h3 className="font-semibold text-foreground text-sm">No teams found in this organization</h3>
					<p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
						Teams represent departments or squads (e.g. Backend, Frontend, QA). Projects are allocated from teams.
					</p>
					<Button
						onClick={() => setCreateModalOpen(true)}
						className="mt-4 bg-primary text-xs"
					>
						<Plus className="w-3.5 h-3.5 mr-1.5" /> Create First Team
					</Button>
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
					{teamStore.teams.map((team) => {
						const teamId = team._id || team.id;
						const leaderObj = typeof team.leaderId === 'object' ? (team.leaderId as any) : null;
						const leaderName = leaderObj?.name || 'No lead assigned';

						return (
							<Card key={teamId} className="hover:shadow-md transition-all flex flex-col justify-between">
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between gap-2">
										<CardTitle className="text-base font-semibold text-foreground">
											{team.name}
										</CardTitle>
										<Badge variant="outline" className="text-[10px] shrink-0">
											{team.members?.length || 0} members
										</Badge>
									</div>
									<CardDescription className="text-xs line-clamp-2 mt-1">
										{team.description || 'No description provided.'}
									</CardDescription>
								</CardHeader>

								<CardContent className="space-y-4">
									{/* Leader Info */}
									<div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs">
										<Crown className="w-4 h-4 text-warning shrink-0" />
										<div className="min-w-0">
											<p className="text-[10px] text-muted-foreground">Team Leader</p>
											<p className="font-semibold text-foreground truncate">{leaderName}</p>
										</div>
									</div>

									{/* Action Footer */}
									<div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setSelectedTeam(team)}
											className="h-7 text-xs gap-1.5"
										>
											<Users className="w-3.5 h-3.5" /> Manage Members
										</Button>

										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleDeleteTeam(teamId, team.name)}
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

			{/* Create Team Modal */}
			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				<DialogContent className="sm:max-w-[440px]">
					<DialogHeader>
						<DialogTitle className="text-base font-bold flex items-center gap-2">
							<Users className="w-4 h-4 text-primary" /> Create New Team
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Create a functional team inside {currentOrg?.name}.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleCreateTeam} className="space-y-3.5 py-2">
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Team Name *</Label>
							<Input
								placeholder="e.g. Backend Engineering"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>

						<div className="space-y-1">
							<Label className="text-xs font-semibold">Description</Label>
							<Textarea
								placeholder="What does this team focus on?"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="text-xs resize-none h-16"
							/>
						</div>

						<div className="space-y-1">
							<Label className="text-xs font-semibold">Team Leader</Label>
							<Select value={leaderId} onValueChange={setLeaderId}>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue placeholder="Select team leader" />
								</SelectTrigger>
								<SelectContent>
									{membershipStore.members.map((m) => {
										const u = typeof m.userId === 'object' ? (m.userId as any) : null;
										const uId = u?._id || u?.id || (m.userId as string);
										const uName = u?.name || 'Member ' + uId.slice(-4);
										return (
											<SelectItem key={uId} value={uId}>
												{uName} ({m.role})
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
						</div>

						<DialogFooter className="gap-2 pt-2">
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

			{/* Manage Team Members Modal */}
			<Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle className="text-base font-bold flex items-center gap-2">
							<Users className="w-4 h-4 text-primary" /> Members of {selectedTeam?.name}
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Add or remove members for this team.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-2">
						{/* Add member select */}
						<div className="flex items-center gap-2">
							<Select value={addMemberUserId} onValueChange={setAddMemberUserId}>
								<SelectTrigger className="h-8 text-xs flex-1">
									<SelectValue placeholder="Select member from organization" />
								</SelectTrigger>
								<SelectContent>
									{membershipStore.members.map((m) => {
										const u = typeof m.userId === 'object' ? (m.userId as any) : null;
										const uId = u?._id || u?.id || (m.userId as string);
										const uName = u?.name || 'Member ' + uId.slice(-4);
										return (
											<SelectItem key={uId} value={uId}>
												{uName}
											</SelectItem>
										);
									})}
								</SelectContent>
							</Select>
							<Button size="sm" onClick={handleAddTeamMember} className="h-8 text-xs gap-1">
								<UserPlus className="w-3.5 h-3.5" /> Add
							</Button>
						</div>

						{/* Existing members list */}
						<div className="border rounded-xl divide-y max-h-60 overflow-y-auto">
							{selectedTeam?.members?.map((mem) => {
								const memObj = typeof mem === 'object' ? (mem as any) : null;
								const mId = memObj?._id || memObj?.id || (mem as string);
								const mName = memObj?.name || 'User ' + mId.slice(-4);
								const mEmail = memObj?.email || '';
								return (
									<div key={mId} className="flex items-center justify-between p-2.5 text-xs">
										<div>
											<p className="font-semibold text-foreground">{mName}</p>
											<p className="text-[10px] text-muted-foreground">{mEmail}</p>
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleRemoveTeamMember(mId)}
											className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 rounded-md"
										>
											<UserMinus className="w-3.5 h-3.5" />
										</Button>
									</div>
								);
							})}

							{(!selectedTeam?.members || selectedTeam.members.length === 0) && (
								<div className="text-center py-6 text-muted-foreground text-xs">
									No members currently assigned to this team.
								</div>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" size="sm" onClick={() => setSelectedTeam(null)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
});

export default TeamsPage;
