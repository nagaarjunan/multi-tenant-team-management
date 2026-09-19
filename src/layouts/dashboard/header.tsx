import { useSettings } from "@/store/settingStore";
import { cn } from "@/utils";
import type { ReactNode } from "react";
import AccountDropdown from "../components/account-dropdown";
import BreadCrumb from "../components/bread-crumb";
import NoticeButton from "../components/notice";
import SettingButton from "../components/setting-button";
import OrgSwitcher from "../components/org-switcher";

import TimeTrackerWidget from "../components/time-tracker-widget";
import QuickActions from "../components/quick-actions";
import GlobalSearch from "../components/global-search";

interface HeaderProps {
	leftSlot?: ReactNode;
}

export default function Header({ leftSlot }: HeaderProps) {
	const { breadCrumb } = useSettings();
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
			<div className="flex items-center gap-2 sm:gap-3 min-w-0">
				{leftSlot}
				<OrgSwitcher />
				<div className="hidden xl:block ml-1">{breadCrumb && <BreadCrumb />}</div>
			</div>

			<div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
				<GlobalSearch />
				<TimeTrackerWidget />
				<QuickActions />
				<NoticeButton />
				<SettingButton />
				<AccountDropdown />
			</div>
		</header>
	);
}
