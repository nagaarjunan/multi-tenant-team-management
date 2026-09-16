import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/ui/collapsible";
import { useState } from "react";
import { useLocation } from "react-router";
import type { NavListProps } from "../types";
import { NavItem } from "./nav-item";

export function NavList({ data, depth = 1 }: NavListProps) {
	const location = useLocation();
	const isActive = location.pathname.includes(data.path);
	const [open, setOpen] = useState(isActive);
	const hasChild = data.children && data.children.length > 0;

	const handleClick = () => {
		if (hasChild) {
			setOpen(!open);
		}
	};

	if (data.hidden) {
		return null;
	}

	if (!hasChild) {
		return (
			<NavItem
				title={data.title}
				path={data.path}
				icon={data.icon}
				info={data.info}
				caption={data.caption}
				auth={data.auth}
				open={false}
				active={isActive}
				disabled={data.disabled}
				hasChild={false}
				depth={depth}
			/>
		);
	}

	return (
		<Collapsible open={open} onOpenChange={setOpen} data-nav-type="list">
			<CollapsibleTrigger asChild className="w-full">
				<NavItem
					title={data.title}
					path={data.path}
					icon={data.icon}
					info={data.info}
					caption={data.caption}
					auth={data.auth}
					open={open}
					active={isActive}
					disabled={data.disabled}
					hasChild={hasChild}
					depth={depth}
					onClick={handleClick}
				/>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<div className="ml-4 mt-1 flex flex-col gap-1">
					{data.children?.map((child) => (
						<NavList key={child.title} data={child} depth={depth + 1} />
					))}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
