import type { SignInReq } from "@/api/services/userService";
import { GLOBAL_CONFIG } from "@/global-config";
import { useSignIn } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Separator } from "@/ui/separator";
import { cn } from "@/utils";
import { Eye, EyeOff, Loader2, Lock, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [remember, setRemember] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();

	const { loginState, setLoginState } = useLoginStateContext();
	const signIn = useSignIn();

	const form = useForm<SignInReq>({
		defaultValues: {
			username: "",
			password: "",
		},
	});

	if (loginState !== LoginStateEnum.LOGIN) return null;

	const handleFinish = async (values: SignInReq) => {
		setLoading(true);
		try {
			await signIn(values);
			navigate(GLOBAL_CONFIG.defaultRoute, { replace: true });
			toast.success(t("sys.login.loginSuccessTitle") || "Welcome back!", {
				description: "Successfully signed in to your workspace.",
				closeButton: true,
			});
		} catch (error: any) {
			toast.error("Failed to sign in", {
				description: error?.message || "Please check your credentials and try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-5", className)}>
			{/* Form Header */}
			<div className="space-y-1 text-left">
				<h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
				<p className="text-xs text-muted-foreground">Please enter your credentials to access your agile workspace.</p>
			</div>

			{/* Form */}
			<Form {...form} {...props}>
				<form onSubmit={form.handleSubmit(handleFinish)} className="space-y-4">
					<FormField
						control={form.control}
						name="username"
						rules={{ required: t("sys.login.accountPlaceholder") || "Username or email is required" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-medium">Username or Work Email</FormLabel>
								<FormControl>
									<div className="relative">
										<UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
										<Input placeholder="name@company.com" className="pl-9 h-10" {...field} />
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						rules={{ required: t("sys.login.passwordPlaceholder") || "Password is required" }}
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between">
									<FormLabel className="text-xs font-medium">Password</FormLabel>
									<Button
										type="button"
										variant="link"
										size="sm"
										onClick={() => setLoginState(LoginStateEnum.RESET_PASSWORD)}
										className="p-0 h-auto text-xs"
									>
										Forgot password?
									</Button>
								</div>
								<FormControl>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
										<Input
											type={showPassword ? "text" : "password"}
											placeholder="••••••••"
											className="pl-9 pr-10 h-10"
											{...field}
											suppressHydrationWarning
										/>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
										>
											{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
										</Button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Remember me checkbox */}
					<div className="flex items-center space-x-2 pt-0.5">
						<Checkbox
							id="remember"
							checked={remember}
							onCheckedChange={(checked) => setRemember(checked === "indeterminate" ? false : checked)}
						/>
						<label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
							Remember my login on this device
						</label>
					</div>

					{/* Primary Submit Button */}
					<Button
						type="submit"
						variant="default"
						size="lg"
						disabled={loading}
						className="w-full font-semibold gap-2 mt-2"
					>
						{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
						Log In
					</Button>

					{/* Divider */}
					<div className="relative my-2">
						<div className="absolute inset-0 flex items-center">
							<Separator />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-card px-2 text-muted-foreground font-medium text-[11px]">Or continue with</span>
						</div>
					</div>

					{/* Google SSO placed at bottom */}
					<Button
						type="button"
						variant="outline"
						size="lg"
						className="w-full gap-2.5 font-medium hover:bg-accent/60"
						onClick={() => toast.info("Connecting to Google Single Sign-On...")}
					>
						<svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
							/>
						</svg>
						Continue with Google
					</Button>

					{/* Sign Up prompt using UI Button link variant */}
					<div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-3 border-t border-border/50">
						<span>Don't have an account?</span>
						<Button
							type="button"
							variant="link"
							size="sm"
							onClick={() => setLoginState(LoginStateEnum.REGISTER)}
							className="p-0 h-auto text-xs font-semibold"
						>
							Create an account
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

export default LoginForm;
