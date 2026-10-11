import { cn } from "@/utils";
import { NavLink } from "react-router";
import { Icon } from "../icon";

interface Props {
	size?: number | string;
	className?: string;
}
function Logo({ size = 36, className }: Props) {
	return (
		<NavLink
			to="/"
			className={cn(
				"inline-flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group",
				className,
			)}
		>
			<Icon
				icon="local:ic-logo-badge"
				size={size}
				color="var(--colors-palette-primary-default)"
				className="drop-shadow-sm group-hover:drop-shadow-md transition-all duration-200"
			/>
		</NavLink>
	);
}

export default Logo;
