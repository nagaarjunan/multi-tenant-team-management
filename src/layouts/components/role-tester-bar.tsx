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
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { ChevronDown, UserCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function RoleTesterBar() {
	const { user, role, isSuperAdmin, impersonateUser, organization } = useAuthorization();
	const users = useSaaSStore((s) => s.users);
	const memberships = useSaaSStore((s) => s.memberships);
	const resetToSeedData = useSaaSStore((s) => s.resetToSeedData);

	const getRoleBadgeVariant = (r?: string) => {
		if (isSuperAdmin) return "destructive";
		if (r === "OWNER") return "default";
		if (r === "ADMIN") return "info";
		return "secondary";
	};

	return (
		<div className="flex items-center gap-1.5">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="outline"
						size="sm"
						className="h-9 px-2.5 gap-2 border-border/80 bg-card/80 hover:bg-accent hover:text-accent-foreground rounded-lg transition-all shadow-xs"
					>
						<Avatar className="w-5 h-5">
							<AvatarImage src={user?.avatar} alt={user?.name} />
							<AvatarFallback className="text-[10px]">{user?.name?.charAt(0)}</AvatarFallback>
						</Avatar>

						<div className="flex items-center gap-1.5 text-xs text-left">
							<span className="font-semibold text-foreground hidden sm:inline-block max-w-[90px] truncate">
								{user?.name?.split(" ")[0]}
							</span>
							<Badge
								variant={getRoleBadgeVariant(role)}
								className="text-[10px] px-1.5 py-0 h-4 font-bold uppercase tracking-wider gap-0.5"
							>
								{isSuperAdmin ? "SUPER ADMIN" : role || "GUEST"}
							</Badge>
						</div>

						<ChevronDown className="w-3 h-3 text-muted-foreground opacity-70" />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent className="w-72 p-1.5" align="end">
					<DropdownMenuLabel className="px-2 py-1.5">
						<div className="text-xs font-semibold text-foreground flex items-center justify-between">
							<span>RBAC Persona Switcher</span>
							<Badge variant="outline" className="text-[9px] font-normal uppercase">Demo Mode</Badge>
						</div>
						<p className="text-[10px] font-normal text-muted-foreground mt-0.5">
							Switch personas instantly to experience different permission scopes.
						</p>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />

					<DropdownMenuGroup>
						{users.map((u) => {
							const isCurrent = u.id === user?.id;
							const mem = memberships.find((m) => m.orgId === organization?.id && m.userId === u.id);
							const userOrgRole = u.platformRole === "SUPER_ADMIN" ? "SUPER_ADMIN" : mem?.role || "NO ACCESS";

							return (
								<DropdownMenuItem
									key={u.id}
									onClick={() => {
										impersonateUser(u.id);
										toast.success(`Switched persona to ${u.name} (${userOrgRole})`);
									}}
									className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
										isCurrent ? "bg-accent/80 font-medium" : "hover:bg-muted"
									}`}
								>
									<div className="flex items-center gap-2.5 min-w-0">
										<Avatar className="w-7 h-7">
											<AvatarImage src={u.avatar} alt={u.name} />
											<AvatarFallback className="text-xs">{u.name.charAt(0)}</AvatarFallback>
										</Avatar>
										<div className="flex flex-col min-w-0">
											<span className="text-xs font-semibold text-foreground truncate">{u.name}</span>
											<span className="text-[10px] text-muted-foreground truncate">{u.title || u.email}</span>
										</div>
									</div>

									<div className="flex items-center gap-1 shrink-0">
										<Badge
											variant={
												u.platformRole === "SUPER_ADMIN"
													? "destructive"
													: userOrgRole === "OWNER"
													? "default"
													: userOrgRole === "ADMIN"
													? "info"
													: "secondary"
											}
											className="text-[9px] px-1 py-0 h-4 uppercase font-bold"
										>
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
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
