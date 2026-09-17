import { useAuthorization } from "@/hooks/useAuthorization";
import { useSaaSStore } from "@/store/saasStore";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/ui/dropdown-menu";
import { RefreshCw, UserCheck } from "lucide-react";
import { toast } from "sonner";

export function RoleTesterMenuItems() {
	const { user, isSuperAdmin, impersonateUser, organization } = useAuthorization();
	const users = useSaaSStore((s) => s.users);
	const memberships = useSaaSStore((s) => s.memberships);
	const resetToSeedData = useSaaSStore((s) => s.resetToSeedData);

	const getRoleBadgeVariant = (value?: string) => {
		if (isSuperAdmin) return "destructive" as const;
		if (value === "OWNER") return "default" as const;
		if (value === "ADMIN") return "info" as const;
		return "secondary" as const;
	};

	return (
		<>
			<DropdownMenuLabel className="px-2 py-1.5">
				<div className="flex items-center justify-between text-xs font-semibold text-foreground">
					<span>RBAC Persona Switcher</span>
					<Badge variant="outline" className="text-[9px] font-normal uppercase">Demo Mode</Badge>
				</div>
				<p className="mt-0.5 text-[10px] font-normal text-muted-foreground">
					Switch personas to preview permission scopes.
				</p>
			</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				{users.map((candidate) => {
					const isCurrent = candidate.id === user?.id;
					const membership = memberships.find((item) => item.orgId === organization?.id && item.userId === candidate.id);
					const userOrgRole = candidate.platformRole === "SUPER_ADMIN" ? "SUPER_ADMIN" : membership?.role || "NO ACCESS";

					return (
						<DropdownMenuItem
							key={candidate.id}
							onClick={() => {
								impersonateUser(candidate.id);
								toast.success(`Switched persona to ${candidate.name} (${userOrgRole})`);
							}}
							className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${isCurrent ? "bg-accent/80 font-medium" : "hover:bg-muted"}`}
						>
							<div className="flex items-center gap-2.5 min-w-0">
								<Avatar className="w-7 h-7">
									<AvatarImage src={candidate.avatar} alt={candidate.name} />
									<AvatarFallback className="text-xs">{candidate.name.charAt(0)}</AvatarFallback>
								</Avatar>
								<div className="flex flex-col min-w-0">
									<span className="text-xs font-semibold text-foreground truncate">{candidate.name}</span>
									<span className="text-[10px] text-muted-foreground truncate">{candidate.title || candidate.email}</span>
								</div>
							</div>
							<div className="flex items-center gap-1 shrink-0">
								<Badge variant={getRoleBadgeVariant(userOrgRole)} className="text-[9px] px-1 py-0 h-4 uppercase font-bold">
									{userOrgRole}
								</Badge>
								{isCurrent && <UserCheck className="w-3.5 h-3.5 text-primary ml-1" />}
							</div>
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuItem
				onClick={() => {
					resetToSeedData();
					toast.info("Database reset to original seed state.");
				}}
				className="flex items-center gap-2 p-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
			>
				<RefreshCw className="w-3.5 h-3.5" />
				<span>Reset Demo Data to Initial State</span>
			</DropdownMenuItem>
		</>
	);
}
