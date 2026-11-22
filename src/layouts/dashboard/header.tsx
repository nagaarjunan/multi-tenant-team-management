import Logo from "@/components/logo";
import { useSettings } from "@/store/settingStore";
import { cn } from "@/utils";
import type { ReactNode } from "react";
import AccountDropdown from "../components/account-dropdown";
import SettingButton from "../components/setting-button";
import { Link, useLocation } from "react-router";
import {
	LayoutDashboard,
	Building2,
	Users,
	FolderKanban,
	CheckSquare,
} from "lucide-react";

interface HeaderProps {
	leftSlot?: ReactNode;
}

const navItems = [
	{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
	{ label: "Organizations", path: "/organizations", icon: Building2 },
	{ label: "Teams", path: "/teams", icon: Users },
	{ label: "Projects", path: "/projects", icon: FolderKanban },
	{ label: "Tasks Board", path: "/tasks", icon: CheckSquare },
];

export default function Header({ leftSlot }: HeaderProps) {
	const location = useLocation();

	return (
		<header
			data-slot="slash-layout-header"
			className={cn(
				"sticky top-0 left-0 right-0 z-app-bar",
				"flex items-center justify-between px-3 sm:px-4 lg:px-6 grow-0 shrink-0 gap-2 sm:gap-3",
				"bg-card/95 backdrop-blur-md border-b border-border/70",
				"h-[var(--layout-header-height)]",
			)}
		>
			{/* Left: Logo & Navigation Tabs */}
			<div className="flex items-center gap-3 sm:gap-5 min-w-0">
				{leftSlot || <Logo />}

				{/* Top Navigation Bar */}
				<nav className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
					{navItems.map((item) => {
						const IconComp = item.icon;
						const isActive =
							location.pathname === item.path ||
							(item.path !== "/dashboard" && location.pathname.startsWith(item.path));

						return (
							<Link
								key={item.path}
								to={item.path}
								className={cn(
									"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0",
									isActive
										? "bg-primary/10 text-primary font-semibold shadow-2xs"
										: "text-muted-foreground hover:text-foreground hover:bg-accent/60"
								)}
							>
								<IconComp className="w-3.5 h-3.5 shrink-0" />
								<span>{item.label}</span>
							</Link>
						);
					})}
				</nav>
			</div>

			{/* Right: Actions & User Dropdown */}
			<div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
				<SettingButton />
				<AccountDropdown />
			</div>
		</header>
	);
}
