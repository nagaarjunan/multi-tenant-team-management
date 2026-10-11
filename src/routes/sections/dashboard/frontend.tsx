import type { RouteObject } from "react-router";
import { Component } from "./utils";

export function getFrontendDashboardRoutes(): RouteObject[] {
	const frontendDashboardRoutes: RouteObject[] = [
		{ path: "blank", element: Component("/pages/sys/others/blank") },
	];
	return frontendDashboardRoutes;
}
