import type { NavProps } from "@/components/nav";
import { Icon } from "@/components/icon";

export const frontendNavData: NavProps["data"] = [
	{
		name: "Workspace",
		items: [
			{
				title: "Dashboard",
				path: "/dashboard",
				icon: <Icon icon="solar:widget-5-bold-duotone" size={20} />,
			},
			{
				title: "Organizations",
				path: "/organizations",
				icon: <Icon icon="solar:buildings-3-bold-duotone" size={20} />,
			},
			{
				title: "Teams",
				path: "/teams",
				icon: <Icon icon="solar:users-group-two-rounded-bold-duotone" size={20} />,
			},
			{
				title: "Projects",
				path: "/projects",
				icon: <Icon icon="solar:folder-with-files-bold-duotone" size={20} />,
			},
			{
				title: "Tasks Board",
				path: "/tasks",
				icon: <Icon icon="solar:checklist-minimalistic-bold-duotone" size={20} />,
			},
		],
	},
];
