import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useOrgStore, useMembershipStore, useAuthStore } from '@/store';
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
	Building2,
	Users,
	Plus,
	Shield,
	Trash2,
	UserPlus,
	Settings,
	Calendar,
	Mail,
} from 'lucide-react';
import OrgHeaderSwitcher from '../components/OrgHeaderSwitcher';
import type { BackendOrgRole } from '@/types/backend';

export const OrganizationsPage: React.FC = observer(() => {
	const orgStore = useOrgStore();
	const membershipStore = useMembershipStore();
	const authStore = useAuthStore();

	const currentOrg = orgStore.currentOrganization;
	const orgId = currentOrg?._id || currentOrg?.id;

	// Edit Org State
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editName, setEditName] = useState('');
	const [editDescription, setEditDescription] = useState('');

	// Add Member State
	const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
	const [newMemberUserId, setNewMemberUserId] = useState('');
	const [newMemberRole, setNewMemberRole] = useState<BackendOrgRole>('member');

	useEffect(() => {
		orgStore.fetchMyOrganizations();
	}, []);

	useEffect(() => {
		if (orgId) {
			membershipStore.fetchOrgMembers(orgId);
		}
	}, [orgId]);

	const handleOpenEdit = () => {
		if (currentOrg) {
			setEditName(currentOrg.name);
			setEditDescription(currentOrg.description || '');
			setEditModalOpen(true);
		}
	};

	const handleSaveEdit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!orgId || !editName.trim()) return;
		await orgStore.updateOrganization(orgId, {
			name: editName.trim(),
			description: editDescription.trim(),
		});
		setEditModalOpen(false);
	};

	const handleDeleteOrg = async () => {
		if (!orgId) return;
		if (confirm(`Are you sure you want to delete organization "${currentOrg?.name}"? All associated data will be removed.`)) {
			await orgStore.deleteOrganization(orgId);
		}
	};

	const handleAddMember = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!orgId || !newMemberUserId.trim()) return;
		try {
			await membershipStore.addMember({
				userId: newMemberUserId.trim(),
				organizationId: orgId,
				role: newMemberRole,
			});
			setAddMemberModalOpen(false);
			setNewMemberUserId('');
			setNewMemberRole('member');
		} catch {
			// Toast handled in store
		}
	};

	const handleRoleChange = async (membershipId: string, newRole: BackendOrgRole) => {
		await membershipStore.updateMemberRole(membershipId, newRole);
	};

	const handleRemoveMember = async (membershipId: string, memberName: string) => {
		if (confirm(`Remove ${memberName} from this organization?`)) {
			await membershipStore.removeMember(membershipId);
		}
	};

	return (
		<div className="space-y-6 pb-12">
			{/* Top Bar */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<Building2 className="w-5 h-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							Organization Settings & Roster
						</h1>
					</div>
					<p className="text-xs text-muted-foreground">
						Manage tenant identity, member privileges, and organization boundaries.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<OrgHeaderSwitcher />
					<Button
						variant="outline"
						size="sm"
						onClick={handleOpenEdit}
						className="gap-1.5 text-xs h-9"
					>
						<Settings className="w-3.5 h-3.5" /> Edit Org
					</Button>
				</div>
			</div>

			{!currentOrg ? (
				<Card className="border-dashed p-12 text-center">
					<Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
					<h3 className="font-semibold text-foreground text-sm">No Organization Selected</h3>
					<p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
						Please create or select an organization to view its members and settings.
					</p>
				</Card>
			) : (
				<>
					{/* Active Organization Info Banner */}
					<Card className="border-border/80 bg-card/60 backdrop-blur-xs">
						<CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div className="space-y-1.5">
								<div className="flex items-center gap-2.5">
									<h2 className="text-xl font-bold text-foreground">{currentOrg.name}</h2>
									<Badge variant="outline" className="text-xs font-mono">
										/{currentOrg.slug}
									</Badge>
									<Badge variant="default" className="text-[10px] uppercase font-bold">
										Active Tenant
									</Badge>
								</div>
								<p className="text-xs text-muted-foreground max-w-2xl">
									{currentOrg.description || 'No description provided for this organization.'}
								</p>
							</div>

							<div className="flex items-center gap-2 shrink-0">
								<Button
									variant="destructive"
									size="sm"
									onClick={handleDeleteOrg}
									className="gap-1.5 text-xs h-8"
								>
									<Trash2 className="w-3.5 h-3.5" /> Delete Organization
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Members Roster Section */}
					<Card>
						<CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2">
							<div>
								<CardTitle className="text-base font-semibold flex items-center gap-2">
									<Users className="w-4 h-4 text-primary" /> Members & Roles ({membershipStore.memberCount})
								</CardTitle>
								<CardDescription className="text-xs">
									Users with access to projects and teams within {currentOrg.name}
								</CardDescription>
							</div>

							<Button
								size="sm"
								onClick={() => setAddMemberModalOpen(true)}
								className="gap-1.5 text-xs h-8 bg-primary hover:bg-primary/90"
							>
								<UserPlus className="w-3.5 h-3.5" /> Add Member
							</Button>
						</CardHeader>

						<CardContent className="p-0">
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse text-xs">
									<thead>
										<tr className="border-y border-border/80 bg-muted/40 text-muted-foreground font-semibold">
											<th className="py-2.5 px-4">Member</th>
											<th className="py-2.5 px-3">Email</th>
											<th className="py-2.5 px-3">Role</th>
											<th className="py-2.5 px-3">Joined Date</th>
											<th className="py-2.5 px-4 text-right">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border/60">
										{membershipStore.members.map((m) => {
											const memId = m._id || m.id;
											const userObj = typeof m.userId === 'object' ? (m.userId as any) : null;
											const memberName = userObj?.name || 'User ' + (m.userId as string).slice(-4);
											const memberEmail = userObj?.email || '—';

											return (
												<tr key={memId} className="hover:bg-muted/30 transition-colors">
													<td className="py-3 px-4 font-semibold text-foreground">
														<div className="flex items-center gap-2.5">
															<div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
																{memberName.charAt(0).toUpperCase()}
															</div>
															<span>{memberName}</span>
														</div>
													</td>
													<td className="py-3 px-3 text-muted-foreground">{memberEmail}</td>
													<td className="py-3 px-3">
														<Select
															value={m.role}
															onValueChange={(val) => handleRoleChange(memId, val as BackendOrgRole)}
														>
															<SelectTrigger className="h-7 text-xs w-28 uppercase font-semibold">
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="owner">OWNER</SelectItem>
																<SelectItem value="admin">ADMIN</SelectItem>
																<SelectItem value="member">MEMBER</SelectItem>
															</SelectContent>
														</Select>
													</td>
													<td className="py-3 px-3 text-muted-foreground">
														{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}
													</td>
													<td className="py-3 px-4 text-right">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleRemoveMember(memId, memberName)}
															className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 rounded-md"
															title="Remove member"
														>
															<Trash2 className="w-3.5 h-3.5" />
														</Button>
													</td>
												</tr>
											);
										})}

										{membershipStore.members.length === 0 && (
											<tr>
												<td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">
													No members found in this organization.
												</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</>
			)}

			{/* Edit Org Modal */}
			<Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
				<DialogContent className="sm:max-w-[420px]">
					<DialogHeader>
						<DialogTitle className="text-base font-bold">Edit Organization</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Update organization display name and description.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSaveEdit} className="space-y-3.5 py-2">
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Organization Name *</Label>
							<Input
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>

						<div className="space-y-1">
							<Label className="text-xs font-semibold">Description</Label>
							<Textarea
								value={editDescription}
								onChange={(e) => setEditDescription(e.target.value)}
								className="text-xs resize-none h-20"
							/>
						</div>

						<DialogFooter className="gap-2 pt-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm">
								Save Changes
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Add Member Modal */}
			<Dialog open={addMemberModalOpen} onOpenChange={setAddMemberModalOpen}>
				<DialogContent className="sm:max-w-[420px]">
					<DialogHeader>
						<DialogTitle className="text-base font-bold flex items-center gap-2">
							<UserPlus className="w-4 h-4 text-primary" /> Add Member to Organization
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Grant a registered user access to this organization.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleAddMember} className="space-y-3.5 py-2">
						<div className="space-y-1">
							<Label className="text-xs font-semibold">User ID *</Label>
							<Input
								placeholder="Paste 24-character MongoDB User ID"
								value={newMemberUserId}
								onChange={(e) => setNewMemberUserId(e.target.value)}
								className="h-9 text-xs font-mono"
								autoFocus
							/>
						</div>

						<div className="space-y-1">
							<Label className="text-xs font-semibold">Organization Role</Label>
							<Select value={newMemberRole} onValueChange={(v) => setNewMemberRole(v as BackendOrgRole)}>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="member">MEMBER — standard contributor</SelectItem>
									<SelectItem value="admin">ADMIN — manage teams and projects</SelectItem>
									<SelectItem value="owner">OWNER — full organization ownership</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<DialogFooter className="gap-2 pt-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setAddMemberModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								Add Member
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
});

export default OrganizationsPage;
