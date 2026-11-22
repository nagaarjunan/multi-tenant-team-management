import type { RouteObject } from "react-router";
import { Component } from "./utils";

export function getFrontendDashboardRoutes(): RouteObject[] {
	const frontendDashboardRoutes: RouteObject[] = [
		{ path: "dashboard", element: Component("/pages/workspace/dashboard") },
		{ path: "organizations", element: Component("/pages/workspace/organizations") },
		{ path: "teams", element: Component("/pages/workspace/teams") },
		{ path: "projects", element: Component("/pages/workspace/projects") },
		{ path: "tasks", element: Component("/pages/workspace/tasks") },
		{ path: "blank", element: Component("/pages/sys/others/blank") },
	];
	return frontendDashboardRoutes;
}
