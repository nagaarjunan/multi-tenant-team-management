import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useOrgStore } from '@/store';
import { Button } from '@/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/ui/dropdown-menu';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/ui/dialog';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import { Building2, Check, ChevronDown, Plus, Globe } from 'lucide-react';

export const OrgHeaderSwitcher: React.FC = observer(() => {
	const orgStore = useOrgStore();
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [slug, setSlug] = useState('');

	const currentOrg = orgStore.currentOrganization;

	const handleCreateOrg = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;
		try {
			await orgStore.createOrganization({
				name: name.trim(),
				slug: slug.trim() || undefined,
				description: description.trim() || undefined,
			});
			setCreateModalOpen(false);
			setName('');
			setSlug('');
			setDescription('');
		} catch {
			// Toast handled in store
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="gap-2 h-9 px-3 bg-card border-border/80 hover:bg-accent/60 font-medium text-xs shadow-2xs"
					>
						<Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
						<span className="font-semibold text-foreground max-w-[140px] truncate">
							{currentOrg ? currentOrg.name : 'Select Organization'}
						</span>
						<ChevronDown className="w-3 h-3 text-muted-foreground ml-auto opacity-70" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="start" className="w-64 p-1">
					<DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-2 py-1.5">
						Organizations
					</DropdownMenuLabel>

					{orgStore.organizations.map((org) => {
						const orgId = org._id || org.id;
						const isSelected = (currentOrg?._id || currentOrg?.id) === orgId;
						return (
							<DropdownMenuItem
								key={orgId}
								onClick={() => orgStore.selectOrganization(orgId)}
								className="flex items-center justify-between px-2.5 py-2 text-xs rounded-md cursor-pointer"
							>
								<div className="flex items-center gap-2 min-w-0">
									<div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
										{org.name.charAt(0).toUpperCase()}
									</div>
									<div className="min-w-0">
										<p className="font-medium text-foreground truncate text-xs">{org.name}</p>
										<p className="text-[10px] text-muted-foreground truncate">/{org.slug}</p>
									</div>
								</div>
								{isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />}
							</DropdownMenuItem>
						);
					})}

					{orgStore.organizations.length === 0 && (
						<div className="text-center py-3 text-xs text-muted-foreground">
							No organizations found
						</div>
					)}

					<DropdownMenuSeparator className="my-1" />

					<DropdownMenuItem
						onClick={() => setCreateModalOpen(true)}
						className="gap-2 text-xs font-medium text-primary cursor-pointer px-2.5 py-1.5 focus:text-primary focus:bg-primary/10"
					>
						<Plus className="w-3.5 h-3.5" />
						Create Organization
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Create Organization Dialog */}
			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				<DialogContent className="sm:max-w-[420px]">
					<DialogHeader>
						<DialogTitle className="text-base font-bold flex items-center gap-2">
							<Building2 className="w-4 h-4 text-primary" /> Create New Organization
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Organizations are top-level containers for teams, projects, and tasks.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleCreateOrg} className="space-y-3.5 py-2">
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Organization Name *</Label>
							<Input
								placeholder="e.g. Acme Corporation"
								value={name}
								onChange={(e) => {
									setName(e.target.value);
									if (!slug) {
										setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
									}
								}}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>

						<div className="space-y-1">
							<Label className="text-xs font-semibold">Slug (URL Identifier)</Label>
							<Input
								placeholder="e.g. acme-corporation"
								value={slug}
								onChange={(e) => setSlug(e.target.value)}
								className="h-9 text-xs font-mono"
							/>
						</div>

						<div className="space-y-1">
							<Label className="text-xs font-semibold">Description</Label>
							<Textarea
								placeholder="Brief description of the organization..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="text-xs resize-none h-16"
							/>
						</div>

						<DialogFooter className="gap-2 pt-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								Create Organization
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
});

export default OrgHeaderSwitcher;
