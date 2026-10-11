import LocalePicker from "@/components/locale-picker";
import Logo from "@/components/logo";
import { GLOBAL_CONFIG } from "@/global-config";
import SettingButton from "@/layouts/components/setting-button";
import { useUserToken } from "@/store/userStore";
import { Navigate } from "react-router";
import AuthShowcase from "./components/auth-showcase";
import LoginForm from "./login-form";
import { LoginProvider } from "./providers/login-provider";
import RegisterForm from "./register-form";
import ResetForm from "./reset-form";

function LoginPage() {
	const token = useUserToken();

	if (token.accessToken) {
		return <Navigate to={GLOBAL_CONFIG.defaultRoute} replace />;
	}

	return (
		<div className="h-screen w-full bg-background grid lg:grid-cols-2 overflow-hidden">
			{/* Left Column: 50% width balanced form section */}
			<div className="flex flex-col justify-between h-full p-6 sm:p-10 lg:p-12 xl:p-16 bg-card border-r border-border/50 overflow-y-auto">
				{/* Top Branding & Utilities */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2.5 font-bold tracking-tight text-base text-foreground cursor-pointer">
						<Logo size={28} />
						<span>{GLOBAL_CONFIG.appName}</span>
					</div>

					<div className="flex items-center gap-1">
						<LocalePicker />
						<SettingButton />
					</div>
				</div>

				{/* Center Form with balanced 380px width */}
				<div className="my-auto flex w-full flex-col items-center justify-center py-6">
					<div className="w-full max-w-[380px]">
						<LoginProvider>
							<LoginForm />
							<RegisterForm />
							<ResetForm />
						</LoginProvider>
					</div>
				</div>

				{/* Bottom Footer Info */}
				<div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/40">
					<span>
						© {new Date().getFullYear()} {GLOBAL_CONFIG.appName}
					</span>
					<div className="flex items-center gap-3">
						<a href="#privacy" className="hover:text-foreground transition-colors">
							Privacy
						</a>
						<span>•</span>
						<a href="#terms" className="hover:text-foreground transition-colors">
							Terms
						</a>
					</div>
				</div>
			</div>

			{/* Right Column: 50% width full-bleed agile team banner */}
			<AuthShowcase />
		</div>
	);
}

export default LoginPage;
