import { type ReactNode } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { PLAN_FEATURE_ACCESS } from "@/auth/authorization";
import type { PermissionCode } from "@/types/saas";
import { Button } from "@/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Lock, Sparkles } from "lucide-react";

interface PermissionGuardProps {
	permission: PermissionCode;
	resource?: any;
	children: ReactNode;
	fallback?: ReactNode;
	showDefaultDenied?: boolean;
}

/**
 * Conditionally renders children if the current user has the required permission.
 */
export function PermissionGuard({
	permission,
	resource,
	children,
	fallback,
	showDefaultDenied = false,
}: PermissionGuardProps) {
	const { can } = useAuthorization();
	const hasPermission = can(permission, resource);

	if (hasPermission) {
		return <>{children}</>;
	}

	if (fallback !== undefined) {
		return <>{fallback}</>;
	}

	if (showDefaultDenied) {
		return (
			<Card className="border-dashed border-border/80 bg-muted/30">
				<CardHeader className="text-center py-8">
					<div className="mx-auto w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-2">
						<Lock className="w-5 h-5" />
					</div>
					<CardTitle className="text-base font-semibold">Access Restricted</CardTitle>
					<CardDescription className="text-sm max-w-sm mx-auto">
						You do not have permission (<code className="text-xs bg-muted px-1 py-0.5 rounded">{permission}</code>) to view this resource. Contact your organization Owner or Admin.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return null;
}

interface PlanGuardProps {
	feature: "reportExport" | "auditLogs" | "advancedAnalytics";
	children: ReactNode;
	fallback?: ReactNode;
	onUpgradeClick?: () => void;
}

/**
 * Plan entitlement guard. If feature is not available on active plan, renders upgrade prompt or fallback.
 */
export function PlanGuard({ feature, children, fallback, onUpgradeClick }: PlanGuardProps) {
	const { organization } = useAuthorization();
	const plan = organization?.plan || "starter";
	const isAllowed = PLAN_FEATURE_ACCESS[plan]?.[feature];

	if (isAllowed) {
		return <>{children}</>;
	}

	if (fallback !== undefined) {
		return <>{fallback}</>;
	}

	return (
		<Card className="border-primary/20 bg-primary/5 p-6 relative overflow-hidden">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<div className="flex items-start gap-3">
					<div className="p-2 rounded-xl bg-primary/10 text-primary mt-0.5">
						<Sparkles className="w-5 h-5" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h4 className="font-semibold text-foreground">Professional Feature</h4>
							<Badge variant="default" className="text-xs font-medium">Upgrade Required</Badge>
						</div>
						<p className="text-xs text-muted-foreground mt-1">
							This feature is available on the <strong>Professional</strong> and <strong>Enterprise</strong> plans. Upgrade to unlock deeper analytics, CSV/PDF export, and compliance logs.
						</p>
					</div>
				</div>
				{onUpgradeClick && (
					<Button onClick={onUpgradeClick} className="shrink-0 gap-2 bg-primary hover:bg-primary/90">
						<Sparkles className="w-4 h-4" /> Upgrade Plan
					</Button>
				)}
			</div>
		</Card>
	);
}
