import { Button } from "@/ui/button";
import { ArrowLeft, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";

export function QrCodeFrom() {
	const { t } = useTranslation();
	const { loginState, backToLogin } = useLoginStateContext();

	if (loginState !== LoginStateEnum.QR_CODE) return null;

	return (
		<div className="flex flex-col gap-5 text-center">
			<div className="space-y-1.5">
				<div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20 mb-1">
					<QrCode className="h-5 w-5" />
				</div>
				<h1 className="text-2xl font-bold tracking-tight text-foreground">
					{t("sys.login.qrSignInFormTitle") || "Sign in with QR Code"}
				</h1>
				<p className="text-xs text-muted-foreground max-w-xs mx-auto">
					{t("sys.login.scanSign") || "Scan this code with the Nexus mobile app to instantly authenticate."}
				</p>
			</div>

			<div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-border bg-card shadow-xs mx-auto">
				<div className="p-3 bg-white rounded-xl shadow-xs">
					<QRCodeSVG value="https://github.com/d3george/slash-admin" size={180} />
				</div>
				<p className="mt-4 text-[11px] text-muted-foreground">Refreshes automatically every 60 seconds</p>
			</div>

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

export default QrCodeFrom;
