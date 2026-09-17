import { useAuthorization } from "@/hooks/useAuthorization";
import { Button } from "@/ui/button";
import { Sparkles, Crown } from "lucide-react";
import { useNavigate } from "react-router";

export default function UpgradeButton() {
	const { organization } = useAuthorization();
	const navigate = useNavigate();

	const isEnterprise = organization?.plan === "enterprise";

	return (
		<Button
			onClick={() => navigate("/subscription")}
			size="sm"
			className={`h-9 px-3 text-xs font-semibold gap-1.5 rounded-md transition-all ${
				isEnterprise
					? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
					: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
			}`}
		>
			{isEnterprise ? (
				<>
					<Crown className="w-3.5 h-3.5 text-amber-500" />
					<span className="hidden sm:inline">Enterprise</span>
					<span className="sm:hidden">Plan</span>
				</>
			) : (
				<>
					<Sparkles className="w-3.5 h-3.5 text-amber-200 fill-amber-200 animate-pulse" />
					<span>Upgrade</span>
				</>
			)}
		</Button>
	);
}
