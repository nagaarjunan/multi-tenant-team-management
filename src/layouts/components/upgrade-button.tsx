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
			className={`h-8 px-2.5 sm:px-3 text-xs font-bold gap-1.5 rounded-lg transition-all shadow-xs ${
				isEnterprise
					? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
					: "bg-gradient-to-r from-amber-500 via-rose-500 to-primary text-white hover:opacity-90 hover:shadow-md animate-gradient"
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
