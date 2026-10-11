import { Button } from "@/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { ArrowLeft, Phone, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

interface CountdownProps {
	value: number;
	onChange: (time: number) => void;
	onFinish: () => void;
}

function Countdown({ value, onChange, onFinish }: CountdownProps) {
	useEffect(() => {
		if (value <= 0) {
			onFinish();
			return;
		}

		const timer = setInterval(() => {
			onChange(value - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [value, onChange, onFinish]);

	return null;
}

interface MobileFormValues {
	phone: string;
	code: string;
}

export function MobileForm() {
	const { t } = useTranslation();
	const [countdown, setCountdown] = useState(0);
	const [second, setSecond] = useState(0);
	const { loginState, backToLogin } = useLoginStateContext();

	const form = useForm<MobileFormValues>({
		defaultValues: {
			phone: "",
			code: "",
		},
	});

	if (loginState !== LoginStateEnum.MOBILE) return null;

	const start = () => {
		const phone = form.getValues("phone");
		if (!phone) {
			toast.error("Please enter a phone number first.");
			return;
		}
		setCountdown(60);
		setSecond(60);
		toast.success(`Verification code sent to ${phone}.`);
	};

	const reset = () => {
		setCountdown(0);
		setSecond(60);
	};

	const onFinish = (_values: MobileFormValues) => {
		toast.success("Mobile authentication successful!");
		backToLogin();
	};

	return (
		<div className="flex flex-col gap-5 text-left">
			<div className="space-y-3">
				<div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
					<Smartphone className="h-5 w-5" />
				</div>
				<div className="space-y-1">
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						{t("sys.login.mobileSignInFormTitle") || "Sign in with SMS"}
					</h1>
					<p className="text-sm text-muted-foreground">
						Enter your mobile phone number to receive a one-time passcode.
					</p>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
					<FormField
						control={form.control}
						name="phone"
						rules={{ required: t("sys.login.mobilePlaceholder") || "Mobile number is required" }}
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-semibold text-foreground">
									{t("sys.login.mobile") || "Mobile Number"}
								</FormLabel>
								<FormControl>
									<div className="relative">
										<Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="+1 (555) 000-0000"
											className="pl-9 h-10 border-border bg-background/50 focus-visible:ring-1 focus-visible:ring-primary text-sm"
											{...field}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="code"
						rules={{ required: t("sys.login.smsPlaceholder") || "Verification code is required" }}
						render={({ field }) => (
							<FormItem>
								<div className="flex items-center justify-between">
									<FormLabel className="text-xs font-semibold text-foreground">
										{t("sys.login.smsCode") || "Verification Code"}
									</FormLabel>
									<button
										type="button"
										onClick={start}
										disabled={countdown > 0}
										className="text-xs font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline cursor-pointer"
									>
										{countdown === 0 ? (
											t("sys.login.sendSmsButton") || "Send SMS code"
										) : (
											<span className="flex items-center gap-1">
												<Countdown
													value={countdown}
													onChange={(time) => {
														setCountdown(time);
														setSecond(time);
													}}
													onFinish={reset}
												/>
												{t("sys.login.sendSmsText", { second }) || `Resend in ${second}s`}
											</span>
										)}
									</button>
								</div>
								<FormControl>
									<div className="flex justify-center py-1">
										<InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} {...field}>
											<InputOTPGroup>
												<InputOTPSlot index={0} />
												<InputOTPSlot index={1} />
												<InputOTPSlot index={2} />
											</InputOTPGroup>
											<InputOTPSeparator />
											<InputOTPGroup>
												<InputOTPSlot index={3} />
												<InputOTPSlot index={4} />
												<InputOTPSlot index={5} />
											</InputOTPGroup>
										</InputOTP>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						type="submit"
						className="w-full h-10 font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all"
					>
						{t("sys.login.loginButton") || "Verify & Sign in"}
					</Button>
				</form>
			</Form>

			<div className="pt-2 border-t border-border">
				<Button
					type="button"
					variant="ghost"
					onClick={() => {
						reset();
						backToLogin();
					}}
					className="w-full text-xs text-muted-foreground hover:text-foreground gap-1.5"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					{t("sys.login.backSignIn") || "Back to sign in"}
				</Button>
			</div>
		</div>
	);
}

export default MobileForm;
