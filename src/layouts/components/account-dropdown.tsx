import { useAuthorization } from "@/hooks/useAuthorization";
import { useLoginStateContext } from "@/pages/sys/login/providers/login-provider";
import { useRouter } from "@/routes/hooks";
import { useUserActions, useUserInfo } from "@/store/userStore";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { Badge } from "@/ui/badge";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";
import { Settings, User, LogOut } from "lucide-react";

/**
 * Account Dropdown
 */
export default function AccountDropdown() {
	const { replace } = useRouter();
	const { user: saasUser, role, isSuperAdmin, organization } = useAuthorization();
	const { username: fallbackUsername, email: fallbackEmail, avatar: fallbackAvatar } = useUserInfo();
	const { clearUserInfoAndToken } = useUserActions();
	const { backToLogin } = useLoginStateContext();
	const { t } = useTranslation();

	const displayName = saasUser?.name || fallbackUsername;
	const displayEmail = saasUser?.email || fallbackEmail;
	const displayAvatar = saasUser?.avatar || fallbackAvatar;

	const logout = () => {
		try {
			clearUserInfoAndToken();
			backToLogin();
		} catch (error) {
			console.log(error);
		} finally {
			replace("/auth/login");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-full h-8 w-8 ring-1 ring-border/80 p-0 overflow-hidden">
					<img className="h-full w-full object-cover" src={displayAvatar} alt={displayName} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-60 p-1.5" align="end">
				<div className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/40">
					<img className="h-9 w-9 rounded-full border border-border" src={displayAvatar} alt={displayName} />
					<div className="flex flex-col items-start min-w-0">
						<div className="text-foreground text-xs font-bold truncate max-w-[150px]">{displayName}</div>
						<div className="text-muted-foreground text-[10px] truncate max-w-[150px]">{displayEmail}</div>
						<Badge
							variant={isSuperAdmin ? "destructive" : role === "OWNER" ? "default" : role === "ADMIN" ? "info" : "secondary"}
							className="text-[9px] px-1 py-0 h-3.5 uppercase font-bold mt-1"
						>
							{isSuperAdmin ? "SUPER ADMIN" : `${role || "MEMBER"} • ${organization?.name?.slice(0, 10)}`}
						</Badge>
					</div>
				</div>

				<DropdownMenuSeparator className="my-1" />

				<DropdownMenuItem asChild>
					<NavLink to="/management/user/profile" className="flex items-center gap-2 text-xs py-1.5 cursor-pointer">
						<User className="w-3.5 h-3.5 text-muted-foreground" />
						<span>{t("sys.nav.user.profile", "Profile")}</span>
					</NavLink>
				</DropdownMenuItem>

				{/* Organization Settings */}
				<DropdownMenuItem asChild>
					<NavLink to="/settings" className="flex items-center gap-2 text-xs py-1.5 cursor-pointer font-medium text-foreground">
						<Settings className="w-3.5 h-3.5 text-primary" />
						<span>{t("sys.nav.settings", "Settings")}</span>
					</NavLink>
				</DropdownMenuItem>

				<DropdownMenuSeparator className="my-1" />

				<DropdownMenuItem className="font-bold text-destructive hover:bg-destructive/10 text-xs py-1.5 flex items-center gap-2 cursor-pointer" onClick={logout}>
					<LogOut className="w-3.5 h-3.5" />
					<span>{t("sys.login.logout", "Logout")}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
