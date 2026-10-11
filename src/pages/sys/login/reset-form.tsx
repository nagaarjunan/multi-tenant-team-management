import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { ArrowLeft, KeyRound, Mail, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

export function ResetForm() {
	const { t } = useTranslation();
	const { loginState, backToLogin } = useLoginStateContext();
	const [sent, setSent] = useState(false);
	const [loading, setLoading] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
		},
	});

	if (loginState !== LoginStateEnum.RESET_PASSWORD) return null;

	const onFinish = (values: any) => {
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			setSent(true);
			toast.success("Reset link sent!", {
				description: `Password recovery instructions have been sent to ${values.email || "your email"}.`,
			});
		}, 800);
	};

	return (
		<div className="flex flex-col gap-5 text-left">
			{/* Icon and Header */}
			<div className="space-y-3">
				<div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
					<KeyRound className="h-5 w-5" />
				</div>
				<div className="space-y-1">
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						{t("sys.login.forgetFormTitle") || "Reset your password"}
					</h1>
					<p className="text-sm text-muted-foreground">
						{t("sys.login.forgetFormSecondTitle") ||
							"Enter your work email address and we will send you secure instructions to reset your password."}
					</p>
				</div>
			</div>

			{sent ? (
				<div className="space-y-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
					<p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
						Check your inbox for a password reset email!
					</p>
					<p className="text-xs text-muted-foreground">Didn't receive an email? Check your spam folder or try again.</p>
					<Button type="button" variant="outline" onClick={() => setSent(false)} className="w-full text-xs">
						Try another email
					</Button>
				</div>
			) : (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							rules={{
								required: t("sys.login.emaildPlaceholder") || "Email is required",
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: "Please enter a valid email address",
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

						<Button
							type="submit"
							disabled={loading}
							className="w-full h-10 font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all gap-2"
						>
							<Send className="h-4 w-4" />
							{t("sys.login.sendEmailButton") || "Send Reset Link"}
						</Button>
					</form>
				</Form>
			)}

			<div className="pt-2 border-t border-border">
				<Button
					type="button"
					variant="ghost"
					onClick={backToLogin}
					className="w-full text-xs text-muted-foreground hover:text-foreground gap-1.5"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					{t("sys.login.backSignIn") || "Back to sign in"}
				</Button>
			</div>
		</div>
	);
}

export default ResetForm;
