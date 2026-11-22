import { useUserInfo, userStore } from "@/store/userStore";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router";

type Props = {
	children: React.ReactNode;
};

/**
 * Route Guard that verifies active backend session.
 * Caches authentication state and only verifies when unauthenticated.
 */
const LoginAuthGuard = observer(function LoginAuthGuard({ children }: Props) {
	const userInfo = useUserInfo();
	const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">(() =>
		userInfo?.id ? "authenticated" : "loading",
	);

	useEffect(() => {
		let isMounted = true;

		// If user is already authenticated in store, no need to check backend
		if (userInfo?.id) {
			setStatus("authenticated");
			return;
		}

		// Initial session check on mount / hard reload
		userStore
			.checkAuth()
			.then((user) => {
				if (!isMounted) return;
				if (user && user.id) {
					setStatus("authenticated");
				} else {
					setStatus("unauthenticated");
				}
			})
			.catch(() => {
				if (!isMounted) return;
				setStatus("unauthenticated");
			});

		return () => {
			isMounted = false;
		};
	}, [userInfo?.id]);

	// While checking session with backend, show loading spinner — DO NOT render dashboard!
	if (status === "loading") {
		return (
			<div className="flex h-screen w-screen items-center justify-center bg-background">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	// If unauthenticated or no valid session cookie, redirect immediately to login
	if (status === "unauthenticated" || !userInfo?.id) {
		return <Navigate to="/auth/login" replace />;
	}

	return <>{children}</>;
});

export default LoginAuthGuard;
