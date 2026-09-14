import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";

export const frontendNavData: NavProps["data"] = [
	{
		items: [
			{
				title: "sys.nav.blank",
				path: "/blank",
				icon: <Icon icon="local:ic-blank" size="24" />,
			},
		],
	},
];

