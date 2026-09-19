import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import { Component } from "./utils";

export function getFrontendDashboardRoutes(): RouteObject[] {
	const frontendDashboardRoutes: RouteObject[] = [
		// SaaS Core Execution & Workspace Routes
		{ path: "workbench", element: Component("/pages/saas/dashboard") },
		{ path: "dashboard", element: Component("/pages/saas/dashboard") },
		{ path: "my-work", element: Component("/pages/saas/my-work") },
		{ path: "tasks", element: Component("/pages/saas/tasks") },
		{ path: "daily-execution", element: Component("/pages/saas/daily-execution") },
		{ path: "blockers", element: Component("/pages/saas/blockers") },
		{ path: "teams", element: Component("/pages/saas/teams") },
		{ path: "products", element: Component("/pages/saas/products") },
		{ path: "projects", element: Component("/pages/saas/projects") },
		{ path: "projects/:id", element: Component("/pages/saas/projects/detail") },
		{ path: "reports", element: Component("/pages/saas/reports") },
		{ path: "subscription", element: Component("/pages/saas/subscription") },
		{ path: "billing", element: Component("/pages/saas/subscription") },
		{ path: "org-onboarding", element: Component("/pages/saas/org-creation") },

		// SaaS Organization Settings Routes
		{
			path: "settings",
			children: [
				{ index: true, element: Component("/pages/saas/settings") },
				{ path: "general", element: Component("/pages/saas/settings") },
				{ path: "members", element: Component("/pages/saas/settings") },
				{ path: "invitations", element: Component("/pages/saas/settings") },
				{ path: "roles", element: Component("/pages/saas/settings") },
				{ path: "security", element: Component("/pages/saas/settings") },
				{ path: "billing", element: Component("/pages/saas/settings") },
				{ path: "danger-zone", element: Component("/pages/saas/settings") },
			],
		},

		// Super Admin Platform Console
		{ path: "super-admin", element: Component("/pages/saas/super-admin") },

		// System & Component Demo Routes
		{ path: "analysis", element: Component("/pages/dashboard/analysis") },
		{
			path: "components",
			children: [
				{ index: true, element: <Navigate to="animate" replace /> },
				{ path: "animate", element: Component("/pages/components/animate") },
				{ path: "scroll", element: Component("/pages/components/scroll") },
				{ path: "multi-language", element: Component("/pages/components/multi-language") },
				{ path: "icon", element: Component("/pages/components/icon") },
				{ path: "upload", element: Component("/pages/components/upload") },
				{ path: "chart", element: Component("/pages/components/chart") },
				{ path: "toast", element: Component("/pages/components/toast") },
			],
		},
		{
			path: "functions",
			children: [
				{ index: true, element: <Navigate to="clipboard" replace /> },
				{ path: "clipboard", element: Component("/pages/functions/clipboard") },
				{ path: "token_expired", element: Component("/pages/functions/token-expired") },
			],
		},
		{
			path: "management",
			children: [
				{ index: true, element: <Navigate to="user" replace /> },
				{
					path: "user",
					children: [
						{ index: true, element: <Navigate to="profile" replace /> },
						{ path: "profile", element: Component("/pages/management/user/profile") },
						{ path: "account", element: Component("/pages/management/user/account") },
					],
				},
				{
					path: "system",
					children: [
						{ index: true, element: <Navigate to="permission" replace /> },
						{ path: "permission", element: Component("/pages/management/system/permission") },
						{ path: "role", element: Component("/pages/management/system/role") },
						{ path: "user", element: Component("/pages/management/system/user") },
						{ path: "user/:id", element: Component("/pages/management/system/user/detail") },
					],
				},
			],
		},
		{
			path: "error",
			children: [
				{ index: true, element: <Navigate to="403" replace /> },
				{ path: "403", element: Component("/pages/sys/error/Page403") },
				{ path: "404", element: Component("/pages/sys/error/Page404") },
				{ path: "500", element: Component("/pages/sys/error/Page500") },
			],
		},
		{ path: "blank", element: Component("/pages/sys/others/blank") },
	];
	return frontendDashboardRoutes;
}
