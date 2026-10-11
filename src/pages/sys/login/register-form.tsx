import userService from "@/api/services/userService";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { cn } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { Briefcase, Eye, EyeOff, Loader2, Lock, Mail, User as UserIcon, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

export function RegisterForm() {
	const { t } = useTranslation();
	const { loginState, backToLogin } = useLoginStateContext();
	const [showPassword, setShowPassword] = useState(false);
	const [agreeTerms, setAgreeTerms] = useState(true);

	const signUpMutation = useMutation({
		mutationFn: userService.signup,
	});

	const form = useForm({
		defaultValues: {
			username: "",
			email: "",
			workspaceName: "",
			password: "",
			confirmPassword: "",
		},
		mode: "onChange",
	});

	const watchedPassword = form.watch("password") || "";

	// Live password strength computation
	const passwordStrength = useMemo(() => {
		if (!watchedPassword) return 0;
		let score = 0;
		if (watchedPassword.length >= 8) score += 1;
		if (/[A-Z]/.test(watchedPassword) && /[a-z]/.test(watchedPassword)) score += 1;
		if (/[0-9]/.test(watchedPassword)) score += 1;
		if (/[^A-Za-z0-9]/.test(watchedPassword)) score += 1;
		return score;
	}, [watchedPassword]);

	const strengthLabel = useMemo(() => {
		switch (passwordStrength) {
			case 1:
				return { text: "Weak", color: "text-red-500", bar: "bg-red-500" };
			case 2:
				return { text: "Fair", color: "text-amber-500", bar: "bg-amber-500" };
			case 3:
				return { text: "Good", color: "text-blue-500", bar: "bg-blue-500" };
			case 4:
				return { text: "Strong", color: "text-emerald-500", bar: "bg-emerald-500" };
			default:
				return { text: "Too short", color: "text-muted-foreground", bar: "bg-muted" };
		}
	}, [passwordStrength]);

	if (loginState !== LoginStateEnum.REGISTER) return null;

	const onFinish = async (values: any) => {
		if (!agreeTerms) {
			toast.error("Please agree to the Terms of Service to continue.");
			return;
		}

		try {
			await signUpMutation.mutateAsync({
				username: values.username,
				email: values.email,
				password: values.password,
			});
			toast.success("Account created successfully!", {
				description: `Welcome to Nexus, ${values.username}. Please sign in to continue.`,
			});
			backToLogin();
		} catch (error: any) {
			toast.error("Registration failed", {
				description: error?.message || "An error occurred while creating your account.",
			});
		}
	};

	return (
		<div className="flex flex-col gap-5">
			{/* Header */}
			<div className="space-y-1.5 text-left">
				<h1 className="text-2xl font-bold tracking-tight text-foreground">
					{t("sys.login.signUpFormTitle") || "Create your workspace"}
				</h1>
				<p className="text-sm text-muted-foreground">
					Start collaborating with your agile team. Free 14-day trial included.
				</p>
			</div>

			{/* Enterprise Social Quick Sign-up */}
			<div className="space-y-2.5">
				<Button
					type="button"
					variant="outline"
					className="w-full justify-center gap-2.5 h-10 font-medium hover:bg-accent/60 transition-all border-border text-foreground"
					onClick={() => toast.info("Connecting to Google for single-click registration...")}
				>
					<svg className="h-4 w-4" viewBox="0 0 24 24">
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
					Sign up with Google
				</Button>
			</div>

			{/* Divider */}
			<div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
				<span className="relative z-10 bg-background px-3 text-muted-foreground uppercase font-medium tracking-wider text-[11px]">
					Or sign up with work email
				</span>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onFinish)} className="space-y-3.5">
					{/* Username */}
					<FormField
						control={form.control}
						name="username"
						rules={{ required: t("sys.login.accountPlaceholder") || "Username is required" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-semibold text-foreground">
									{t("sys.login.userName") || "Full Name or Username"}
								</FormLabel>
								<FormControl>
									<div className="relative">
										<UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="e.g. Alex Morgan"
											className="pl-9 h-10 border-border bg-background/50 focus-visible:ring-1 focus-visible:ring-primary text-sm"
											{...field}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Work Email */}
					<FormField
						control={form.control}
						name="email"
						rules={{
							required: t("sys.login.emaildPlaceholder") || "Email is required",
							pattern: {
								value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
								message: "Invalid email address",
							},
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-semibold text-foreground">
									{t("sys.login.email") || "Work Email"}
								</FormLabel>
								<FormControl>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											type="email"
											placeholder="alex@company.com"
											className="pl-9 h-10 border-border bg-background/50 focus-visible:ring-1 focus-visible:ring-primary text-sm"
											{...field}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Workspace / Organization Name */}
					<FormField
						control={form.control}
						name="workspaceName"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-semibold text-foreground flex items-center justify-between">
									<span>Workspace / Team Name</span>
									<span className="text-[10px] text-muted-foreground font-normal">Optional</span>
								</FormLabel>
								<FormControl>
									<div className="relative">
										<Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="e.g. Acme Product Engineering"
											className="pl-9 h-10 border-border bg-background/50 focus-visible:ring-1 focus-visible:ring-primary text-sm"
											{...field}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Password */}
					<FormField
						control={form.control}
						name="password"
						rules={{
							required: t("sys.login.passwordPlaceholder") || "Password is required",
							minLength: { value: 6, message: "Password must be at least 6 characters" },
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-semibold text-foreground">
									{t("sys.login.password") || "Password"}
								</FormLabel>
								<FormControl>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											type={showPassword ? "text" : "password"}
											placeholder="Minimum 8 characters"
											className="pl-9 pr-10 h-10 border-border bg-background/50 focus-visible:ring-1 focus-visible:ring-primary text-sm"
											{...field}
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

								{/* Live Password Strength Meter */}
								{watchedPassword && (
									<div className="space-y-1.5 pt-1">
										<div className="flex items-center justify-between text-[11px]">
											<span className="text-muted-foreground">Password strength:</span>
											<span className={cn("font-medium", strengthLabel.color)}>{strengthLabel.text}</span>
										</div>
										<div className="grid grid-cols-4 gap-1.5 h-1.5">
											{[1, 2, 3, 4].map((step) => (
												<div
													key={step}
													className={cn(
														"rounded-full transition-all duration-300",
														passwordStrength >= step ? strengthLabel.bar : "bg-muted",
													)}
												/>
											))}
										</div>
									</div>
								)}
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Confirm Password */}
					<FormField
						control={form.control}
						name="confirmPassword"
						rules={{
							required: t("sys.login.confirmPasswordPlaceholder") || "Please confirm your password",
							validate: (val) =>
								val === form.getValues("password") || t("sys.login.diffPwd") || "Passwords do not match",
						}}
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-semibold text-foreground">
									{t("sys.login.confirmPassword") || "Confirm Password"}
								</FormLabel>
								<FormControl>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											type="password"
											placeholder="Re-enter password"
											className="pl-9 h-10 border-border bg-background/50 focus-visible:ring-1 focus-visible:ring-primary text-sm"
											{...field}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Terms and Privacy Policy Checkbox */}
					<div className="flex items-start space-x-2 pt-1">
						<Checkbox
							id="terms"
							checked={agreeTerms}
							onCheckedChange={(c) => setAgreeTerms(c === true)}
							className="mt-0.5"
						/>
						<label htmlFor="terms" className="text-xs text-muted-foreground leading-snug cursor-pointer select-none">
							{t("sys.login.registerAndAgree") || "By signing up, I agree to the"}{" "}
							<a href="#terms" className="text-primary font-medium hover:underline">
								{t("sys.login.termsOfService") || "Terms of Service"}
							</a>{" "}
							and{" "}
							<a href="#privacy" className="text-primary font-medium hover:underline">
								{t("sys.login.privacyPolicy") || "Privacy Policy"}
							</a>
							.
						</label>
					</div>

					{/* Submit Button */}
					<Button
						type="submit"
						disabled={signUpMutation.isPending}
						className="w-full h-10 font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all gap-2 mt-2"
					>
						{signUpMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
						{t("sys.login.registerButton") || "Create Workspace & Account"}
					</Button>

					{/* Back to sign in */}
					<div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-3 border-t border-border/50">
						<span>Already have an account?</span>
						<Button
							type="button"
							variant="link"
							size="sm"
							onClick={backToLogin}
							className="p-0 h-auto text-xs font-semibold"
						>
							Sign in
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

export default RegisterForm;
