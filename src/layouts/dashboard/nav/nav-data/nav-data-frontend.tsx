import type { NavProps } from "@/components/nav";
import {
	LayoutDashboard,
	Briefcase,
	Users,
	Package,
	FolderKanban,
	CheckSquare,
	CalendarClock,
	AlertOctagon,
	BarChart3,
	ShieldAlert,
} from "lucide-react";

export const frontendNavData: NavProps["data"] = [
	{
		name: "Execution & Work",
		items: [
			{
				title: "Dashboard",
				path: "/workbench",
				icon: <LayoutDashboard className="w-5 h-5" />,
				auth: ["dashboard.view"],
			},
			{
				title: "My Work",
				path: "/my-work",
				icon: <Briefcase className="w-5 h-5" />,
				auth: ["my_work.view"],
			},
			{
				title: "Tasks",
				path: "/tasks",
				icon: <CheckSquare className="w-5 h-5" />,
				auth: ["task.view"],
			},
			{
				title: "Daily Execution",
				path: "/daily-execution",
				icon: <CalendarClock className="w-5 h-5" />,
				auth: ["daily_update.view"],
			},
			{
				title: "Blockers",
				path: "/blockers",
				icon: <AlertOctagon className="w-5 h-5" />,
				auth: ["blocker.view"],
			},
		],
	},
	{
		name: "Structure & Delivery",
		items: [
			{
				title: "Teams",
				path: "/teams",
				icon: <Users className="w-5 h-5" />,
				auth: ["team.view"],
			},
			{
				title: "Products",
				path: "/products",
				icon: <Package className="w-5 h-5" />,
				auth: ["product.view"],
			},
			{
				title: "Projects",
				path: "/projects",
				icon: <FolderKanban className="w-5 h-5" />,
				auth: ["project.view"],
			},
			{
				title: "Reports & Analytics",
				path: "/reports",
				icon: <BarChart3 className="w-5 h-5" />,
				auth: ["report.view"],
			},
		],
	},
	{
		name: "Platform Administration",
		items: [
			{
				title: "Super Admin Console",
				path: "/super-admin",
				icon: <ShieldAlert className="w-5 h-5 text-destructive" />,
				auth: ["super_admin.access"],
			},
		],
	},
];
