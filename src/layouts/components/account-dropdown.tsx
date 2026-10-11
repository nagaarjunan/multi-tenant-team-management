import { useAuthorization } from "@/hooks/useAuthorization";
import { useLoginStateContext } from "@/pages/sys/login/providers/login-provider";
import { useRouter } from "@/routes/hooks";
import { useUserActions, useUserInfo } from "@/store/userStore";
import { Button } from "@/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { ChevronDown, LogOut } from "lucide-react";
import { observer } from "mobx-react-lite";

/**
 * Account Dropdown
 */
const AccountDropdown = observer(function AccountDropdown() {
	const { replace } = useRouter();
	const { user: saasUser } = useAuthorization();
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
				<Button variant="outline" size="sm" className="h-9 gap-2 rounded-md border-border/80 bg-card px-2 hover:bg-accent">
					<img className="h-6 w-6 rounded-full object-cover" src={displayAvatar} alt={displayName} />
					<span className="hidden max-w-28 truncate text-xs font-semibold text-foreground sm:inline">{displayName}</span>
					<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-60 p-1.5" align="end">
				<div className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/40">
					<img className="h-9 w-9 rounded-full border border-border" src={displayAvatar} alt={displayName} />
					<div className="flex flex-col items-start min-w-0">
						<div className="text-foreground text-xs font-bold truncate max-w-[150px]">{displayName}</div>
						<div className="text-muted-foreground text-[10px] truncate max-w-[150px]">{displayEmail}</div>
					</div>
				</div>

				<DropdownMenuSeparator className="my-1" />

				<DropdownMenuItem
					className="font-bold text-destructive hover:bg-destructive/10 text-xs py-1.5 flex items-center gap-2 cursor-pointer"
					onClick={logout}
				>
					<LogOut className="w-3.5 h-3.5" />
					<span>{t("sys.login.logout", "Logout")}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
});

export default AccountDropdown;
