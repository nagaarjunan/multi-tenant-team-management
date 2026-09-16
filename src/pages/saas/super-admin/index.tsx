import { useState } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useSaaSStore } from "@/store/saasStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import {
	ShieldAlert,
	Lock,
	LogIn,
	Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import type { Organization } from "@/types/saas";

export default function SuperAdminConsolePage() {
	const { isSuperAdmin, supportAccessReason } = useAuthorization();
	const organizations = useSaaSStore((s) => s.organizations);
	const users = useSaaSStore((s) => s.users);
	const auditLogs = useSaaSStore((s) => s.auditLogs);
	const startSuperAdminSupportSession = useSaaSStore((s) => s.startSuperAdminSupportSession);
	const endSuperAdminSupportSession = useSaaSStore((s) => s.endSuperAdminSupportSession);
	const navigate = useNavigate();

	// Support Access Impersonation Modal
	const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
	const [reason, setReason] = useState("");

	if (!isSuperAdmin) {
		return (
			<Card className="max-w-lg mx-auto my-16 text-center p-8 border-destructive/30 bg-destructive/5">
				<div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mx-auto mb-3">
					<Lock className="w-6 h-6" />
				</div>
				<CardTitle className="text-lg font-bold">403 — Platform Access Restricted</CardTitle>
				<CardDescription className="text-xs mt-2">
					The Super Admin Console is strictly reserved for SaaS Platform Operators. Normal customer organization roles (Owner, Admin, Member) cannot access this console.
				</CardDescription>
				<div className="mt-4">
					<Button size="sm" onClick={() => navigate("/workbench")}>
						Return to Organization
					</Button>
				</div>
			</Card>
		);
	}

	const handleStartSupportAccess = () => {
		if (!selectedOrg) return;
		if (!reason.trim()) {
			toast.error("Please provide a valid support access reason for the audit log.");
			return;
		}

		startSuperAdminSupportSession(selectedOrg.id, reason.trim());
		toast.success(`Temporary support access granted for ${selectedOrg.name}. Audit log entry recorded.`);
		setSelectedOrg(null);
		setReason("");
		navigate("/workbench");
	};

	return (
		<div className="space-y-6 pb-12">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-destructive/10 border border-destructive/20">
				<div>
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-destructive text-white">
							<ShieldAlert className="w-5 h-5" />
						</div>
						<div>
							<h1 className="text-2xl font-bold tracking-tight text-foreground">SaaS Platform Super Admin Console</h1>
							<p className="text-xs text-muted-foreground mt-0.5">
								Global tenant management, subscription health, and audited temporary customer support access.
							</p>
						</div>
					</div>
				</div>

				{supportAccessReason && (
					<div className="flex items-center gap-2">
						<Badge variant="destructive" className="text-xs font-mono">
							Active Support Session
						</Badge>
						<Button size="sm" variant="outline" onClick={endSuperAdminSupportSession} className="text-xs h-8">
							End Session
						</Button>
					</div>
				)}
			</div>

			{/* Metric stats */}
			<div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
				<Card>
					<CardContent className="pt-6">
						<div className="text-xs font-semibold uppercase text-muted-foreground">Total Customer Tenants</div>
						<div className="text-2xl font-bold mt-1">{organizations.length} Organizations</div>
						<div className="text-[11px] text-muted-foreground mt-1">Global regions: India, Japan, UK, US</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="text-xs font-semibold uppercase text-muted-foreground">Platform Users</div>
						<div className="text-2xl font-bold mt-1">{users.length} Registered</div>
						<div className="text-[11px] text-muted-foreground mt-1">Multi-tenant memberships active</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="text-xs font-semibold uppercase text-muted-foreground">Active Subscriptions</div>
						<div className="text-2xl font-bold mt-1 text-success">{organizations.filter((o) => o.planStatus === "active").length} Active</div>
						<div className="text-[11px] text-muted-foreground mt-1">Zero churn across tenants</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="text-xs font-semibold uppercase text-muted-foreground">Audit Trail Events</div>
						<div className="text-2xl font-bold mt-1">{auditLogs.length} Events</div>
						<div className="text-[11px] text-muted-foreground mt-1">Immutable security log recorded</div>
					</CardContent>
				</Card>
			</div>

			{/* Organizations Table */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base font-semibold">Customer Organizations</CardTitle>
					<CardDescription className="text-xs">
						Click "Support Access" to securely enter a tenant workspace with an audited justification.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					<div className="overflow-x-auto">
						<table className="w-full text-xs text-left">
							<thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-semibold">
								<tr>
									<th className="p-3">Organization</th>
									<th className="p-3">Country / Timezone</th>
									<th className="p-3">Plan</th>
									<th className="p-3">Owner</th>
									<th className="p-3">Created</th>
									<th className="p-3 text-right">Support Access</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/40">
								{organizations.map((org) => {
									const owner = users.find((u) => u.id === org.ownerId);
									return (
										<tr key={org.id} className="hover:bg-accent/40">
											<td className="p-3">
												<div className="flex items-center gap-2">
													<div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
														{org.name.charAt(0)}
													</div>
													<span className="font-semibold text-foreground">{org.name}</span>
												</div>
											</td>
											<td className="p-3 text-muted-foreground">
												<span className="flex items-center gap-1">
													<Globe className="w-3 h-3 text-primary" /> {org.country} ({org.timezone})
												</span>
											</td>
											<td className="p-3">
												<Badge variant="outline" className="text-[10px] uppercase font-bold">
													{org.plan}
												</Badge>
											</td>
											<td className="p-3 text-foreground">{owner?.name || "Tanaka"}</td>
											<td className="p-3 text-muted-foreground">
												{new Date(org.createdAt).toLocaleDateString()}
											</td>
											<td className="p-3 text-right">
												<Button
													size="sm"
													variant="outline"
													onClick={() => {
														setSelectedOrg(org);
														setReason("");
													}}
													className="h-7 text-xs gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
												>
													<LogIn className="w-3.5 h-3.5" /> Support Access
												</Button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* Support Access Reason Dialog */}
			{selectedOrg && (
				<Dialog open={!!selectedOrg} onOpenChange={(open) => !open && setSelectedOrg(null)}>
					<DialogContent className="sm:max-w-[480px]">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2 text-destructive">
								<ShieldAlert className="w-5 h-5" /> Temporary Support Impersonation Access
							</DialogTitle>
							<DialogDescription className="text-xs">
								You are requesting emergency support access to customer tenant <strong>{selectedOrg.name}</strong>.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-2">
							<div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-[11px] text-destructive space-y-1">
								<strong>Compliance Notice:</strong> Super Admin access into customer tenants is strictly tracked in the immutable security audit log.
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Support Ticket / Justification Reason *</Label>
								<Textarea
									placeholder="e.g. Investigating Zendesk Ticket #49102 regarding Stripe payment settlement issue..."
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									className="text-xs resize-none"
									rows={3}
									autoFocus
								/>
							</div>

							<DialogFooter className="pt-2 gap-2">
								<Button variant="outline" size="sm" onClick={() => setSelectedOrg(null)}>
									Cancel
								</Button>
								<Button size="sm" onClick={handleStartSupportAccess} className="bg-destructive hover:bg-destructive/90 text-white">
									Grant Support Access & Log Event
								</Button>
							</DialogFooter>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
