import { useState } from "react";
import { useSaaSStore } from "@/store/saasStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import {
	Building2,
	Sparkles,
	CheckCircle2,
	ArrowRight,
	Rocket,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import type { PlanTier } from "@/types/saas";

export default function OrgCreationOnboardingPage() {
	const createOrganization = useSaaSStore((s) => s.createOrganization);
	const createTeam = useSaaSStore((s) => s.createTeam);
	const createProduct = useSaaSStore((s) => s.createProduct);
	const user = useSaaSStore((s) => s.users.find((u) => u.id === s.currentUserId));
	const navigate = useNavigate();

	const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

	// Form States
	const [orgName, setOrgName] = useState("");
	const [country, setCountry] = useState("India");
	const [timezone, setTimezone] = useState("Asia/Kolkata");
	const [currency, setCurrency] = useState("INR");
	const [plan, setPlan] = useState<PlanTier>("professional");

	const [initialTeam, setInitialTeam] = useState("Core Engineering");
	const [initialProduct, setInitialProduct] = useState("Main SaaS Product");

	const [createdOrgId, setCreatedOrgId] = useState("");

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

	const handleCreateOrg = () => {
		if (!orgName.trim()) {
			toast.error("Please enter an organization name.");
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

		setCreatedOrgId(newOrg.id);
		toast.success(`Organization '${newOrg.name}' created! Creator is now OWNER.`);
		setStep(2);
	};

	const handleFinishSetup = () => {
		if (!createdOrgId || !user) return;

		// Create default team
		createTeam({
			orgId: createdOrgId,
			name: initialTeam,
			description: "Primary engineering and delivery team.",
			memberIds: [user.id],
			leadId: user.id,
		});

		// Create default product
		createProduct({
			orgId: createdOrgId,
			name: initialProduct,
			description: "Core cloud software solution.",
			memberIds: [user.id],
		});

		toast.success("Workspace initialized! Welcome to your Owner Dashboard.");
		navigate("/workbench");
	};

	return (
		<div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
			{/* Steps Progress */}
			<div className="flex items-center justify-between px-2">
				{[
					{ num: 1, label: "Workspace Details" },
					{ num: 2, label: "Select Plan" },
					{ num: 3, label: "Setup Initial Work" },
					{ num: 4, label: "Ready to Launch" },
				].map((s) => (
					<div key={s.num} className="flex flex-col items-center gap-1">
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
								step === s.num
									? "bg-primary text-primary-foreground shadow-sm"
									: step > s.num
									? "bg-success text-white"
									: "bg-muted text-muted-foreground"
							}`}
						>
							{step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
						</div>
						<span className="text-[10px] font-medium hidden sm:inline text-muted-foreground">
							{s.label}
						</span>
					</div>
				))}
			</div>

			{/* Step 1: Org Details */}
			{step === 1 && (
				<Card className="shadow-md border-primary/20">
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<Building2 className="w-5 h-5 text-primary" /> Create Your SaaS Organization
						</CardTitle>
						<CardDescription className="text-xs">
							Step 1 of 4: Configure your organization name and regional timezone settings.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Organization Name *</Label>
							<Input
								placeholder="e.g. Acme Global, Tokyo Software Labs"
								value={orgName}
								onChange={(e) => setOrgName(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Primary Country</Label>
								<Select value={country} onValueChange={handleCountryChange}>
									<SelectTrigger className="h-9 text-xs">
										<SelectValue />
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
								<Input value={timezone} disabled className="h-9 text-xs bg-muted/40" />
							</div>
						</div>

						<div className="flex justify-end pt-4">
							<Button onClick={handleCreateOrg} className="bg-primary hover:bg-primary/90 gap-1.5 text-xs">
								Continue to Plan Selection <ArrowRight className="w-3.5 h-3.5" />
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Step 2: Plan Selection */}
			{step === 2 && (
				<Card className="shadow-md border-primary/20">
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<Sparkles className="w-5 h-5 text-primary" /> Select Subscription Plan
						</CardTitle>
						<CardDescription className="text-xs">
							Step 2 of 4: Choose the subscription tier for {orgName}.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							{[
								{ id: "starter", name: "Starter", price: "Free", desc: "Up to 5 members & 2 teams" },
								{ id: "professional", name: "Professional", price: "Popular", desc: "Up to 25 members, exports, audit logs" },
								{ id: "enterprise", name: "Enterprise", price: "Unlimited", desc: "Unlimited members, teams & 24/7 SLA" },
							].map((p) => (
								<div
									key={p.id}
									onClick={() => setPlan(p.id as PlanTier)}
									className={`p-4 rounded-xl border cursor-pointer transition-all space-y-1 ${
										plan === p.id ? "border-primary bg-primary/10 shadow-xs" : "border-border/60 hover:bg-accent/40"
									}`}
								>
									<div className="font-bold text-xs">{p.name}</div>
									<div className="text-sm font-semibold text-primary">{p.price}</div>
									<p className="text-[11px] text-muted-foreground">{p.desc}</p>
								</div>
							))}
						</div>

						<div className="flex justify-between pt-4">
							<Button variant="outline" size="sm" onClick={() => setStep(1)} className="text-xs">
								Back
							</Button>
							<Button size="sm" onClick={() => setStep(3)} className="bg-primary hover:bg-primary/90 text-xs gap-1.5">
								Continue <ArrowRight className="w-3.5 h-3.5" />
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Step 3: Initial Setup */}
			{step === 3 && (
				<Card className="shadow-md border-primary/20">
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<Rocket className="w-5 h-5 text-primary" /> Setup Initial Team & Product
						</CardTitle>
						<CardDescription className="text-xs">
							Step 3 of 4: Bootstrap your team structure and first product.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Initial Team Name</Label>
							<Input
								value={initialTeam}
								onChange={(e) => setInitialTeam(e.target.value)}
								className="h-9 text-xs"
							/>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">First Product / Initiative</Label>
							<Input
								value={initialProduct}
								onChange={(e) => setInitialProduct(e.target.value)}
								className="h-9 text-xs"
							/>
						</div>

						<div className="flex justify-between pt-4">
							<Button variant="outline" size="sm" onClick={() => setStep(2)} className="text-xs">
								Back
							</Button>
							<Button size="sm" onClick={handleFinishSetup} className="bg-primary hover:bg-primary/90 text-xs gap-1.5">
								Launch Workspace <Rocket className="w-3.5 h-3.5" />
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
