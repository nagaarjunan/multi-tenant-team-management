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
import { Checkbox } from "@/ui/checkbox";
import {
	Package,
	Plus,
	Trash2,
	ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";

export default function ProductsPage() {
	const { organization, activeOrgMembers, can } = useAuthorization();
	const products = useSaaSStore((s) => s.products);
	const projects = useSaaSStore((s) => s.projects);
	const tasks = useSaaSStore((s) => s.tasks);
	const createProduct = useSaaSStore((s) => s.createProduct);
	const deleteProduct = useSaaSStore((s) => s.deleteProduct);
	const users = useSaaSStore((s) => s.users);

	// Filter products for active organization
	const orgProducts = useMemo(() => products.filter((p) => p.orgId === organization?.id), [products, organization?.id]);

	// Modal States
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [productName, setProductName] = useState("");
	const [productDesc, setProductDesc] = useState("");
	const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

	const handleCreate = (e: React.FormEvent) => {
		e.preventDefault();
		if (!productName.trim()) {
			toast.error("Please enter a product name");
			return;
		}
		if (!organization) return;

		createProduct({
			orgId: organization.id,
			name: productName.trim(),
			description: productDesc.trim(),
			memberIds: selectedMembers,
		});

		toast.success(`Product '${productName}' created!`);
		setCreateModalOpen(false);
		setProductName("");
		setProductDesc("");
	};

	const handleDelete = (prodId: string, name: string) => {
		if (confirm(`Delete product '${name}' and all its associated projects?`)) {
			deleteProduct(prodId);
			toast.success(`Product '${name}' removed.`);
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
							<Package className="w-5 h-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">Products & Services</h1>
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						High-level product lines and platforms. Access is membership-based without artificial 'Product Owner' roles.
					</p>
				</div>

				{can("product.create") && (
					<Button onClick={() => setCreateModalOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 shadow-xs">
						<Plus className="w-4 h-4" /> Create Product
					</Button>
				)}
			</div>

			{/* Products List */}
			{orgProducts.length === 0 ? (
				<Card className="border-dashed p-12 text-center">
					<Package className="w-10 h-10 text-muted-foreground/60 mx-auto mb-3" />
					<h3 className="font-semibold text-foreground text-sm">No products configured</h3>
					<p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
						Add your product portfolio to organize projects, roadmaps, and delivery.
					</p>
					{can("product.create") && (
						<Button onClick={() => setCreateModalOpen(true)} className="mt-4 gap-1.5" size="sm">
							<Plus className="w-4 h-4" /> Create First Product
						</Button>
					)}
				</Card>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{orgProducts.map((product) => {
						const childProjects = projects.filter((p) => p.productId === product.id);
						const projectIds = childProjects.map((p) => p.id);
						const productTasks = tasks.filter((t) => projectIds.includes(t.projectId));
						const completedTasks = productTasks.filter((t) => t.status === "DONE");
						const memberUsers = users.filter((u) => product.memberIds.includes(u.id));

						return (
							<Card key={product.id} className="hover:border-primary/40 transition-all flex flex-col justify-between shadow-xs">
								<CardHeader>
									<div className="flex items-start justify-between gap-2">
										<div>
											<CardTitle className="text-base font-semibold">{product.name}</CardTitle>
											<CardDescription className="text-xs mt-1">
												{product.description || "No description."}
											</CardDescription>
										</div>
										<Badge variant="outline" className="text-[10px] font-medium shrink-0">
											{childProjects.length} Projects
										</Badge>
									</div>
								</CardHeader>

								<CardContent className="space-y-4">
									{/* Progress stats */}
									<div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/20 border border-border/60 text-xs">
										<div>
											<div className="text-[10px] text-muted-foreground uppercase font-semibold">Active Projects</div>
											<div className="font-bold text-sm text-foreground">{childProjects.length}</div>
										</div>
										<div>
											<div className="text-[10px] text-muted-foreground uppercase font-semibold">Tasks Completed</div>
											<div className="font-bold text-sm text-foreground">
												{completedTasks.length} / {productTasks.length}
											</div>
										</div>
									</div>

									{/* Child Projects Links */}
									<div className="space-y-1.5">
										<div className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
											<span>Projects Under This Product:</span>
											<Link to="/projects" className="text-primary text-[10px] hover:underline flex items-center gap-0.5">
												View all <ArrowRight className="w-2.5 h-2.5" />
											</Link>
										</div>
										<div className="space-y-1">
											{childProjects.map((proj) => (
												<div key={proj.id} className="flex items-center justify-between p-2 rounded-md bg-card border border-border/40 text-xs">
													<span className="font-medium truncate max-w-[200px]">{proj.name}</span>
													<Badge variant="outline" className="text-[9px] uppercase">
														{proj.status}
													</Badge>
												</div>
											))}
										</div>
									</div>

									{/* Assigned Members */}
									<div className="space-y-1">
										<div className="text-[11px] font-semibold text-muted-foreground">Team Access:</div>
										<div className="flex items-center gap-1.5 flex-wrap">
											{memberUsers.map((u) => (
												<div key={u.id} className="flex items-center gap-1 bg-muted/40 px-2 py-0.5 rounded text-[11px]">
													<Avatar className="w-3.5 h-3.5">
														<AvatarImage src={u.avatar} />
														<AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
													</Avatar>
													<span>{u.name}</span>
												</div>
											))}
										</div>
									</div>

									{/* Footer Actions */}
									{can("product.delete") && (
										<div className="flex items-center justify-end pt-2 border-t border-border/40">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleDelete(product.id, product.name)}
												className="text-destructive hover:bg-destructive/10 text-xs h-7 gap-1"
											>
												<Trash2 className="w-3 h-3" /> Remove Product
											</Button>
										</div>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{/* Create Product Modal */}
			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				<DialogContent className="sm:max-w-[480px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Package className="w-5 h-5 text-primary" /> Create New Product
						</DialogTitle>
						<DialogDescription className="text-xs">
							Define a product container for projects in {organization?.name}.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleCreate} className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Product Name *</Label>
							<Input
								placeholder="e.g. E-Commerce Platform, Cloud Infrastructure"
								value={productName}
								onChange={(e) => setProductName(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Description</Label>
							<Textarea
								placeholder="Product mission and core objectives"
								value={productDesc}
								onChange={(e) => setProductDesc(e.target.value)}
								className="text-xs resize-none"
								rows={2}
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-xs font-semibold">Assign Organization Members:</Label>
							<div className="max-h-36 overflow-y-auto space-y-1 border border-border/60 rounded-lg p-2 bg-muted/20">
								{activeOrgMembers.map((m) => {
									const isChecked = selectedMembers.includes(m.user.id);
									return (
										<div
											key={m.user.id}
											onClick={() => toggleMember(m.user.id)}
											className="flex items-center justify-between p-1.5 rounded hover:bg-card cursor-pointer"
										>
											<div className="flex items-center gap-2">
												<Checkbox checked={isChecked} />
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

						<DialogFooter className="pt-3 gap-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								Create Product
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
