import React, { useState } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useSaaSStore } from "@/store/saasStore";
import { Button } from "@/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Badge } from "@/ui/badge";
import { Building2, Check, ChevronDown, Globe, Plus, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import type { PlanTier } from "@/types/saas";

export default function OrgSwitcher() {
	const { user, organization, userOrganizations, isPersonalWorkspace, switchWorkspace } = useAuthorization();
	const createOrganization = useSaaSStore((s) => s.createOrganization);
	const [createModalOpen, setCreateModalOpen] = useState(false);

	// New Org Form State
	const [orgName, setOrgName] = useState("");
	const [country, setCountry] = useState("India");
	const [timezone, setTimezone] = useState("Asia/Kolkata");
	const [currency, setCurrency] = useState("INR");
	const [plan, setPlan] = useState<PlanTier>("professional");

	const handleCountryChange = (c: string) => {
		setCountry(c);
		if (c === "India") {
			setTimezone("Asia/Kolkata");
			setCurrency("INR");
		} else if (c === "Japan") {
			setTimezone("Asia/Tokyo");
			setCurrency("JPY");
		} else if (c === "United Kingdom") {
			setTimezone("Europe/London");
			setCurrency("GBP");
		} else if (c === "United States") {
			setTimezone("America/New_York");
			setCurrency("USD");
		}
	};

	const handleCreateOrg = (e: React.FormEvent) => {
		e.preventDefault();
		if (!orgName.trim()) {
			toast.error("Please enter an organization name");
			return;
		}

		const currencySymbol = currency === "INR" ? "₹" : currency === "JPY" ? "¥" : currency === "GBP" ? "£" : "$";
		const countryCode = country === "India" ? "IN" : country === "Japan" ? "JP" : country === "United Kingdom" ? "GB" : "US";
		const dateFormat = country === "Japan" ? "YYYY/MM/DD" : country === "United States" ? "MM/DD/YYYY" : "DD/MM/YYYY";
		const timeFormat = country === "United States" || country === "India" ? "hh:mm A" : "HH:mm";

		const newOrg = createOrganization({
			name: orgName.trim(),
			slug: orgName.trim().toLowerCase().replace(/[^a-z0-9]/g, "-"),
			logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(orgName)}`,
			country,
			countryCode,
			timezone,
			locale: country === "India" ? "en-IN" : country === "Japan" ? "ja-JP" : country === "United Kingdom" ? "en-GB" : "en-US",
			currency,
			currencySymbol,
			dateFormat,
			timeFormat,
			weekStartDay: "MONDAY",
			plan,
			planStatus: "active",
		});

		toast.success(`Organization '${newOrg.name}' created! Switched to Organization Workspace.`);
		setCreateModalOpen(false);
		setOrgName("");
	};

	const getPlanBadgeVariant = (tier: string) => {
		switch (tier) {
			case "enterprise":
				return "default";
			case "professional":
				return "info";
			default:
				return "secondary";
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						className="flex items-center gap-2.5 px-3 py-1.5 h-9 bg-card/80 backdrop-blur-sm border-border/80 hover:bg-accent hover:text-accent-foreground rounded-lg transition-all shadow-xs"
					>
						<div className="flex items-center justify-center w-5 h-5 rounded-md bg-primary/10 text-primary shrink-0">
							{isPersonalWorkspace ? <User className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
						</div>
						<div className="flex items-center gap-1.5 text-left max-w-[150px] sm:max-w-[200px] truncate">
							<span className="font-semibold text-xs sm:text-sm tracking-tight truncate">
								{isPersonalWorkspace ? "Personal Workspace" : organization?.name || "Select Organization"}
							</span>
							<Badge
								variant={isPersonalWorkspace ? "secondary" : getPlanBadgeVariant(organization?.plan || "starter")}
								className="text-[10px] px-1.5 py-0 h-4 uppercase font-semibold hidden md:inline-flex"
							>
								{isPersonalWorkspace ? "Personal" : organization?.plan}
							</Badge>
						</div>
						<ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-70" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent className="w-68 p-1.5" align="start">
					{/* Personal Workspace Section */}
					<DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground px-2 py-1 tracking-wider uppercase">
						Personal Workspace
					</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={() => {
							switchWorkspace("personal");
							toast.success("Switched to Personal Workspace");
						}}
						className="flex items-center justify-between px-2.5 py-2 cursor-pointer rounded-md focus:bg-accent mb-1"
					>
						<div className="flex items-center gap-2.5 min-w-0">
							<div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
								<User className="w-3.5 h-3.5" />
							</div>
							<div className="flex flex-col min-w-0">
								<span className={`text-xs truncate ${isPersonalWorkspace ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
									Personal Workspace
								</span>
								<span className="text-[10px] text-muted-foreground">
									{user?.name}'s private projects & tasks
								</span>
							</div>
						</div>
						{isPersonalWorkspace && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					{/* Organizations Section */}
					<DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground px-2 py-1.5 tracking-wider uppercase flex items-center justify-between">
						<span>Organization Workspaces</span>
						<span className="text-[10px] lowercase font-normal">{userOrganizations.length} available</span>
					</DropdownMenuLabel>

					<DropdownMenuGroup>
						{userOrganizations.map((org) => {
							const isSelected = !isPersonalWorkspace && org.id === organization?.id;
							return (
								<DropdownMenuItem
									key={org.id}
									onClick={() => {
										switchWorkspace("organization", org.id);
										toast.success(`Switched active tenant to ${org.name}`);
									}}
									className="flex items-center justify-between px-2.5 py-2 cursor-pointer rounded-md focus:bg-accent"
								>
									<div className="flex items-center gap-2.5 min-w-0">
										<div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
											{org.name.charAt(0)}
										</div>
										<div className="flex flex-col min-w-0">
											<span className={`text-xs truncate ${isSelected ? "font-bold text-foreground" : "font-medium text-foreground/80"}`}>
												{org.name}
											</span>
											<span className="text-[10px] text-muted-foreground flex items-center gap-1">
												<Globe className="w-2.5 h-2.5" /> {org.country} • {org.timezone.split("/")[1] || org.timezone}
											</span>
										</div>
									</div>
									<div className="flex items-center gap-1.5 shrink-0">
										<Badge variant={getPlanBadgeVariant(org.plan)} className="text-[9px] px-1 py-0 h-3.5 uppercase font-medium">
											{org.plan}
										</Badge>
										{isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
									</div>
								</DropdownMenuItem>
							);
						})}
					</DropdownMenuGroup>

					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={() => setCreateModalOpen(true)}
						className="flex items-center gap-2 px-2.5 py-2 text-primary font-medium cursor-pointer rounded-md focus:bg-primary/10"
					>
						<Plus className="w-4 h-4" />
						<span className="text-xs">Create New Organization</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Create Organization Modal */}
			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				<DialogContent className="sm:max-w-[480px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-lg">
							<Building2 className="w-5 h-5 text-primary" />
							Create New Organization
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Create an isolated SaaS workspace. You will automatically become the organization <strong>OWNER</strong>.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleCreateOrg} className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label htmlFor="orgName" className="text-xs font-semibold">Organization Name *</Label>
							<Input
								id="orgName"
								placeholder="e.g. Acme Corporation, Tokyo Tech Labs"
								value={orgName}
								onChange={(e) => setOrgName(e.target.value)}
								className="h-9 text-sm"
								autoFocus
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Primary Country</Label>
								<Select value={country} onValueChange={handleCountryChange}>
									<SelectTrigger className="h-9 text-xs">
										<SelectValue placeholder="Select country" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="India">🇮🇳 India</SelectItem>
										<SelectItem value="Japan">🇯🇵 Japan</SelectItem>
										<SelectItem value="United Kingdom">🇬🇧 United Kingdom</SelectItem>
										<SelectItem value="United States">🇺🇸 United States</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Timezone</Label>
								<Input value={timezone} disabled className="h-9 text-xs bg-muted/50" />
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Billing Currency</Label>
								<Input value={currency} disabled className="h-9 text-xs bg-muted/50" />
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Subscription Plan</Label>
								<Select value={plan} onValueChange={(v) => setPlan(v as PlanTier)}>
									<SelectTrigger className="h-9 text-xs">
										<SelectValue placeholder="Select plan" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="starter">Starter (Free / 5 users)</SelectItem>
										<SelectItem value="professional">Professional (Pro / 25 users)</SelectItem>
										<SelectItem value="enterprise">Enterprise (Unlimited)</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<DialogFooter className="pt-3 gap-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								<Sparkles className="w-3.5 h-3.5 mr-1" /> Create Workspace
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
