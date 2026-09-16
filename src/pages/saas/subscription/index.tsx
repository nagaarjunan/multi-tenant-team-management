import { useState, useMemo } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useSaaSStore } from "@/store/saasStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import { Separator } from "@/ui/separator";
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
import {
	CreditCard,
	Sparkles,
	Check,
	Download,
	Receipt,
	ShieldCheck,
	Zap,
	HelpCircle,
	Plus,
} from "lucide-react";
import { toast } from "sonner";
import type { PlanTier } from "@/types/saas";

export default function SubscriptionBillingPage() {
	const { organization, activeOrgMembers, isOwner } = useAuthorization();
	const teams = useSaaSStore((s) => s.teams);
	const projects = useSaaSStore((s) => s.projects);
	const upgradePlan = useSaaSStore((s) => s.upgradePlan);

	const [annualBilling, setAnnualBilling] = useState(false);
	const [cardModalOpen, setCardModalOpen] = useState(false);
	const [confirmTierModalOpen, setConfirmTierModalOpen] = useState(false);
	const [selectedTier, setSelectedTier] = useState<PlanTier>("professional");

	// Quotas
	const orgTeams = useMemo(() => teams.filter((t) => t.orgId === organization?.id), [teams, organization?.id]);
	const orgProjects = useMemo(() => projects.filter((p) => p.orgId === organization?.id), [projects, organization?.id]);

	const memberLimit = organization?.plan === "starter" ? 5 : organization?.plan === "professional" ? 25 : 500;
	const teamLimit = organization?.plan === "starter" ? 2 : organization?.plan === "professional" ? 10 : 100;
	const projectLimit = organization?.plan === "starter" ? 5 : organization?.plan === "professional" ? 20 : 200;

	const memberUsagePercent = Math.min(100, Math.round((activeOrgMembers.length / memberLimit) * 100));
	const teamUsagePercent = Math.min(100, Math.round((orgTeams.length / teamLimit) * 100));
	const projectUsagePercent = Math.min(100, Math.round((orgProjects.length / projectLimit) * 100));

	const handleSelectTier = (tier: PlanTier) => {
		if (!isOwner) {
			toast.error("Permission Denied: Only Organization Owners can manage subscription plans.");
			return;
		}
		setSelectedTier(tier);
		setConfirmTierModalOpen(true);
	};

	const handleConfirmTierChange = () => {
		if (!organization) return;
		upgradePlan(organization.id, selectedTier);
		toast.success(`Successfully switched subscription to ${selectedTier.toUpperCase()} plan!`);
		setConfirmTierModalOpen(false);
	};

	// Mock Invoices
	const mockInvoices = [
		{ id: "INV-2026-009", date: "Sep 01, 2026", amount: organization?.currencySymbol + (organization?.plan === "enterprise" ? "19,999" : organization?.plan === "professional" ? "4,999" : "0"), status: "PAID", tier: organization?.plan },
		{ id: "INV-2026-008", date: "Aug 01, 2026", amount: organization?.currencySymbol + (organization?.plan === "enterprise" ? "19,999" : organization?.plan === "professional" ? "4,999" : "0"), status: "PAID", tier: organization?.plan },
		{ id: "INV-2026-007", date: "Jul 01, 2026", amount: organization?.currencySymbol + (organization?.plan === "enterprise" ? "19,999" : organization?.plan === "professional" ? "4,999" : "0"), status: "PAID", tier: organization?.plan },
		{ id: "INV-2026-006", date: "Jun 01, 2026", amount: organization?.currencySymbol + (organization?.plan === "enterprise" ? "19,999" : organization?.plan === "professional" ? "4,999" : "0"), status: "PAID", tier: organization?.plan },
	];

	return (
		<div className="space-y-8 pb-16 max-w-6xl mx-auto">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<CreditCard className="w-6 h-6" />
						</div>
						<h1 className="text-2xl font-extrabold tracking-tight text-foreground">Subscription & Billing</h1>
					</div>
					<p className="text-xs text-muted-foreground mt-1">
						Manage subscription tier, team capacity quotas, payment methods, and historical invoices for <strong>{organization?.name}</strong>.
					</p>
				</div>

				<div className="flex items-center gap-3">
					<Badge
						variant={organization?.plan === "enterprise" ? "default" : organization?.plan === "professional" ? "info" : "secondary"}
						className="px-3 py-1 text-xs uppercase font-extrabold tracking-wider"
					>
						{organization?.plan} PLAN
					</Badge>
				</div>
			</div>

			{/* Current Subscription Status & Quota Card */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Active Plan Overview */}
				<Card className="lg:col-span-2 border-border/80 bg-gradient-to-br from-card via-card to-primary/5 shadow-xs">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<CardTitle className="text-base font-bold flex items-center gap-2">
									<Zap className="w-4 h-4 text-amber-500" /> Active Plan Details
								</CardTitle>
								<CardDescription className="text-xs">
									Next billing cycle: <strong>October 1, 2026</strong> • Auto-renew enabled
								</CardDescription>
							</div>
							<Badge variant="success" className="text-[10px] font-bold">
								ACTIVE SUBSCRIPTION
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-2xs">
								<span className="text-[10px] uppercase font-bold text-muted-foreground">Current Plan</span>
								<div className="text-lg font-black text-foreground uppercase mt-0.5">{organization?.plan}</div>
								<span className="text-[10px] text-muted-foreground">Billed monthly</span>
							</div>

							<div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-2xs">
								<span className="text-[10px] uppercase font-bold text-muted-foreground">Recurring Charge</span>
								<div className="text-lg font-black text-foreground mt-0.5">
									{organization?.currencySymbol}
									{organization?.plan === "enterprise" ? "19,999" : organization?.plan === "professional" ? "4,999" : "0"}
									<span className="text-xs font-normal text-muted-foreground"> / mo</span>
								</div>
								<span className="text-[10px] text-muted-foreground">{organization?.currency} currency</span>
							</div>

							<div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-2xs">
								<span className="text-[10px] uppercase font-bold text-muted-foreground">Payment Method</span>
								<div className="text-sm font-bold text-foreground mt-1 flex items-center gap-1.5">
									<CreditCard className="w-4 h-4 text-primary" />
									<span>•••• 4242</span>
								</div>
								<span className="text-[10px] text-muted-foreground">Expires 12/28</span>
							</div>
						</div>

						{/* Quota Progress Meters */}
						<div className="space-y-3 pt-2">
							<div className="text-xs font-bold text-foreground">Capacity & Utilization Quotas</div>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border/60">
									<div className="flex justify-between text-xs">
										<span className="text-muted-foreground">Team Members</span>
										<span className="font-bold text-foreground">{activeOrgMembers.length} / {memberLimit}</span>
									</div>
									<Progress value={memberUsagePercent} className="h-2" />
								</div>

								<div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border/60">
									<div className="flex justify-between text-xs">
										<span className="text-muted-foreground">Active Teams</span>
										<span className="font-bold text-foreground">{orgTeams.length} / {teamLimit}</span>
									</div>
									<Progress value={teamUsagePercent} className="h-2" />
								</div>

								<div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-border/60">
									<div className="flex justify-between text-xs">
										<span className="text-muted-foreground">Active Projects</span>
										<span className="font-bold text-foreground">{orgProjects.length} / {projectLimit}</span>
									</div>
									<Progress value={projectUsagePercent} className="h-2" />
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Payment Method Card */}
				<Card className="border-border/80 shadow-xs flex flex-col justify-between">
					<CardHeader className="pb-3">
						<CardTitle className="text-base font-bold flex items-center gap-2">
							<ShieldCheck className="w-4 h-4 text-primary" /> Payment Method
						</CardTitle>
						<CardDescription className="text-xs">
							Cards on file for automated renewal.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="p-4 rounded-xl border border-border bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-3 shadow-md">
							<div className="flex justify-between items-center">
								<span className="text-[10px] font-mono tracking-widest uppercase opacity-75">Corporate Visa</span>
								<Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[9px] font-bold">DEFAULT</Badge>
							</div>
							<div className="text-base font-mono tracking-wider font-bold">•••• •••• •••• 4242</div>
							<div className="flex justify-between items-center text-[10px] font-mono opacity-80">
								<span>{organization?.name}</span>
								<span>12 / 28</span>
							</div>
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={() => setCardModalOpen(true)}
							className="w-full text-xs h-8.5 gap-1.5"
						>
							<Plus className="w-3.5 h-3.5" /> Update Payment Method
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Plan Comparison & Tiers */}
			<div className="space-y-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
							<Sparkles className="w-5 h-5 text-primary" /> Choose the Right Plan for Your Team
						</h2>
						<p className="text-xs text-muted-foreground mt-0.5">
							Upgrade or downgrade at any time. Prorated billing is automatically calculated.
						</p>
					</div>

					{/* Billing Cycle Switch */}
					<div className="flex items-center gap-2 p-1.5 rounded-xl bg-card border border-border/80 shadow-xs text-xs self-start sm:self-auto">
						<button
							onClick={() => setAnnualBilling(false)}
							className={`px-3 py-1.5 rounded-lg transition-all ${!annualBilling ? "bg-primary text-primary-foreground font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
						>
							Monthly Billing
						</button>
						<button
							onClick={() => setAnnualBilling(true)}
							className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${annualBilling ? "bg-primary text-primary-foreground font-bold shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
						>
							<span>Annual Billing</span>
							<Badge variant="success" className="text-[9px] px-1.5 py-0 h-4 font-extrabold uppercase">
								Save 20%
							</Badge>
						</button>
					</div>
				</div>

				{/* Pricing Cards Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Starter Plan */}
					<div className={`p-6 rounded-2xl border transition-all flex flex-col justify-between bg-card ${organization?.plan === "starter" ? "border-primary/80 ring-2 ring-primary/20 shadow-md" : "border-border/70 hover:border-border hover:shadow-sm"}`}>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-bold text-lg text-foreground">Starter</h3>
								{organization?.plan === "starter" && <Badge variant="default" className="font-bold">CURRENT PLAN</Badge>}
							</div>
							<div className="text-3xl font-black text-foreground">
								{organization?.currencySymbol}0
								<span className="text-xs font-normal text-muted-foreground"> / month</span>
							</div>
							<p className="text-xs text-muted-foreground">Essential collaboration tools for bootstrap squads and personal projects.</p>
							<Separator />
							<ul className="text-xs text-muted-foreground space-y-2.5">
								<li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-4 h-4 text-emerald-500" /> Up to 5 team members</li>
								<li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 2 Active Teams</li>
								<li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 5 Products & Projects</li>
								<li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Kanban Task Boards</li>
								<li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Daily Standup Feed</li>
								<li className="flex items-center gap-2 text-muted-foreground/60 line-through"><Check className="w-4 h-4 text-muted-foreground/40" /> CSV/PDF Report Export</li>
								<li className="flex items-center gap-2 text-muted-foreground/60 line-through"><Check className="w-4 h-4 text-muted-foreground/40" /> Security Audit Logs</li>
							</ul>
						</div>

						<div className="pt-8">
							{organization?.plan === "starter" ? (
								<Button disabled variant="outline" className="w-full text-xs font-bold">Current Tier</Button>
							) : (
								<Button variant="outline" className="w-full text-xs" onClick={() => handleSelectTier("starter")}>
									Downgrade to Starter
								</Button>
							)}
						</div>
					</div>

					{/* Professional Plan (Highlighted) */}
					<div className={`p-6 rounded-2xl border transition-all flex flex-col justify-between relative bg-gradient-to-b from-card to-primary/5 ${organization?.plan === "professional" ? "border-primary ring-2 ring-primary shadow-lg" : "border-primary/40 hover:border-primary shadow-md"}`}>
						<div className="absolute -top-3 left-1/2 -translate-x-1/2">
							<Badge className="bg-primary text-primary-foreground font-extrabold text-[10px] tracking-wider uppercase px-3 py-0.5 shadow-sm">
								MOST POPULAR
							</Badge>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between pt-1">
								<h3 className="font-bold text-lg text-foreground flex items-center gap-1.5">
									<span>Professional</span>
									<Sparkles className="w-4 h-4 text-primary" />
								</h3>
								{organization?.plan === "professional" && <Badge variant="default" className="font-bold">CURRENT PLAN</Badge>}
							</div>
							<div className="text-3xl font-black text-foreground">
								{organization?.currencySymbol}{annualBilling ? (organization?.currency === "JPY" ? "3,999" : "3,999") : (organization?.currency === "JPY" ? "4,999" : "4,999")}
								<span className="text-xs font-normal text-muted-foreground"> / month</span>
							</div>
							<p className="text-xs text-muted-foreground">For scaling engineering teams that require analytics, report export, and audit compliance.</p>
							<Separator />
							<ul className="text-xs text-muted-foreground space-y-2.5">
								<li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-4 h-4 text-emerald-500" /> Up to 25 team members</li>
								<li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-4 h-4 text-emerald-500" /> 10 Teams & 20 Projects</li>
								<li className="flex items-center gap-2 text-primary font-bold"><Sparkles className="w-4 h-4 text-primary" /> CSV & PDF Operational Reports Export</li>
								<li className="flex items-center gap-2 text-primary font-bold"><Sparkles className="w-4 h-4 text-primary" /> Immutable Security Audit Logs</li>
								<li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Multi-Timezone Standup Rollup</li>
								<li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Priority Email & Ticket Support</li>
							</ul>
						</div>

						<div className="pt-8">
							{organization?.plan === "professional" ? (
								<Button disabled variant="outline" className="w-full text-xs font-bold border-primary text-primary">Current Tier</Button>
							) : (
								<Button className="w-full text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" onClick={() => handleSelectTier("professional")}>
									{organization?.plan === "enterprise" ? "Switch to Professional" : "Upgrade to Professional"}
								</Button>
							)}
						</div>
					</div>

					{/* Enterprise Plan */}
					<div className={`p-6 rounded-2xl border transition-all flex flex-col justify-between bg-card ${organization?.plan === "enterprise" ? "border-primary/80 ring-2 ring-primary/20 shadow-md" : "border-border/70 hover:border-border hover:shadow-sm"}`}>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-bold text-lg text-foreground">Enterprise</h3>
								{organization?.plan === "enterprise" && <Badge variant="default" className="font-bold">CURRENT PLAN</Badge>}
							</div>
							<div className="text-3xl font-black text-foreground">
								{organization?.currencySymbol}{annualBilling ? (organization?.currency === "JPY" ? "15,999" : "15,999") : (organization?.currency === "JPY" ? "19,999" : "19,999")}
								<span className="text-xs font-normal text-muted-foreground"> / month</span>
							</div>
							<p className="text-xs text-muted-foreground">Unlimited capacity, enterprise SLA, single sign-on, and dedicated compliance support.</p>
							<Separator />
							<ul className="text-xs text-muted-foreground space-y-2.5">
								<li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-4 h-4 text-emerald-500" /> Unlimited Team Members</li>
								<li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-4 h-4 text-emerald-500" /> Unlimited Teams & Projects</li>
								<li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-4 h-4 text-emerald-500" /> Okta / SAML Single Sign-On (SSO)</li>
								<li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-4 h-4 text-emerald-500" /> 99.99% Uptime Guarantee & SLA</li>
								<li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-4 h-4 text-emerald-500" /> Dedicated Technical Account Manager</li>
								<li className="flex items-center gap-2 text-foreground font-medium"><Check className="w-4 h-4 text-emerald-500" /> Custom Multi-Tenant Isolation Policies</li>
							</ul>
						</div>

						<div className="pt-8">
							{organization?.plan === "enterprise" ? (
								<Button disabled variant="outline" className="w-full text-xs font-bold">Current Tier</Button>
							) : (
								<Button className="w-full text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" onClick={() => handleSelectTier("enterprise")}>
									Upgrade to Enterprise
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Invoices History Table */}
			<Card className="border-border/80 shadow-xs">
				<CardHeader className="border-b border-border/50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<CardTitle className="text-lg font-bold flex items-center gap-2">
							<Receipt className="w-5 h-5 text-primary" /> Billing History & Invoices
						</CardTitle>
						<CardDescription className="text-xs mt-0.5">
							Download past tax invoices and payment receipts for bookkeeping.
						</CardDescription>
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={() => toast.success("Exported all invoices to ZIP archive.")}
						className="gap-1.5 text-xs h-8.5"
					>
						<Download className="w-3.5 h-3.5" /> Download All Receipts
					</Button>
				</CardHeader>
				<CardContent className="p-4">
					<div className="rounded-xl border border-border/70 overflow-hidden">
						<table className="w-full text-xs text-left">
							<thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-semibold">
								<tr>
									<th className="p-3">Invoice Number</th>
									<th className="p-3">Billing Date</th>
									<th className="p-3">Subscription Tier</th>
									<th className="p-3">Amount</th>
									<th className="p-3">Status</th>
									<th className="p-3 text-right">Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/40">
								{mockInvoices.map((inv) => (
									<tr key={inv.id} className="hover:bg-accent/40 transition-colors">
										<td className="p-3 font-mono font-bold text-foreground">{inv.id}</td>
										<td className="p-3 text-muted-foreground">{inv.date}</td>
										<td className="p-3 uppercase font-semibold text-foreground">{inv.tier}</td>
										<td className="p-3 font-extrabold text-foreground">{inv.amount}</td>
										<td className="p-3">
											<Badge variant="success" className="text-[10px] font-bold">
												{inv.status}
											</Badge>
										</td>
										<td className="p-3 text-right">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => toast.success(`Downloaded ${inv.id}.pdf`)}
												className="h-7 text-xs gap-1 hover:bg-muted"
											>
												<Download className="w-3.5 h-3.5" /> PDF
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* FAQ Section */}
			<div className="p-6 rounded-2xl border border-border/70 bg-card/60 shadow-xs space-y-4">
				<h3 className="text-base font-bold text-foreground flex items-center gap-2">
					<HelpCircle className="w-5 h-5 text-primary" /> Frequently Asked Billing Questions
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
					<div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1">
						<span className="font-bold text-foreground">How does seat upgrading work?</span>
						<p className="text-muted-foreground">When you upgrade your tier, new member seat capacity is added instantly, and charges are prorated for the current billing cycle.</p>
					</div>
					<div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1">
						<span className="font-bold text-foreground">Can I switch between monthly and annual plans?</span>
						<p className="text-muted-foreground">Yes! Switching to annual billing applies an immediate 20% discount across all active seats and tiers.</p>
					</div>
					<div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1">
						<span className="font-bold text-foreground">What payment methods are supported?</span>
						<p className="text-muted-foreground">We accept all major credit and debit cards (Visa, MasterCard, Amex) as well as regional gateways like Razorpay in India and PayPay in Japan.</p>
					</div>
					<div className="p-3 rounded-xl bg-muted/20 border border-border/50 space-y-1">
						<span className="font-bold text-foreground">What happens if I downgrade my plan?</span>
						<p className="text-muted-foreground">Your plan remains active until the end of the current billing period, after which limits will adjust to the selected tier.</p>
					</div>
				</div>
			</div>

			{/* Confirm Tier Switch Modal */}
			<Dialog open={confirmTierModalOpen} onOpenChange={setConfirmTierModalOpen}>
				<DialogContent className="sm:max-w-[420px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Sparkles className="w-5 h-5 text-primary" /> Confirm Subscription Change
						</DialogTitle>
						<DialogDescription className="text-xs">
							You are about to switch <strong>{organization?.name}</strong> to the <strong>{selectedTier.toUpperCase()}</strong> plan.
						</DialogDescription>
					</DialogHeader>

					<div className="py-3 text-xs text-muted-foreground space-y-2">
						<div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-foreground space-y-1">
							<div className="font-bold uppercase text-xs">{selectedTier} Plan</div>
							<div>
								New capacity limit: {selectedTier === "starter" ? "5 members" : selectedTier === "professional" ? "25 members" : "Unlimited members"}.
							</div>
						</div>
						<p>Your card on file will be charged on the next billing date.</p>
					</div>

					<DialogFooter className="gap-2">
						<Button variant="outline" size="sm" onClick={() => setConfirmTierModalOpen(false)}>
							Cancel
						</Button>
						<Button size="sm" onClick={handleConfirmTierChange} className="bg-primary hover:bg-primary/90">
							Confirm & Switch Plan
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Update Payment Method Modal */}
			<Dialog open={cardModalOpen} onOpenChange={setCardModalOpen}>
				<DialogContent className="sm:max-w-[420px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<CreditCard className="w-5 h-5 text-primary" /> Update Payment Method
						</DialogTitle>
						<DialogDescription className="text-xs">
							Enter your new credit card details securely.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={(e) => {
						e.preventDefault();
						setCardModalOpen(false);
						toast.success("Payment method updated successfully!");
					}} className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Cardholder Name</Label>
							<Input placeholder="Hiroshi Tanaka" defaultValue={organization?.name} className="h-9 text-xs" required />
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Card Number</Label>
							<Input placeholder="4242 •••• •••• 4242" defaultValue="4242 •••• •••• 4242" className="h-9 text-xs font-mono" required />
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Expiry Date</Label>
								<Input placeholder="MM/YY" defaultValue="12/28" className="h-9 text-xs font-mono" required />
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">CVC / CVV</Label>
								<Input placeholder="•••" defaultValue="123" type="password" maxLength={4} className="h-9 text-xs font-mono" required />
							</div>
						</div>

						<DialogFooter className="pt-2 gap-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setCardModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								Save Card Details
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
