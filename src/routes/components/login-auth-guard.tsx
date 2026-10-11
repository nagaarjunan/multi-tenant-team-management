import { useUserToken } from "@/store/userStore";
import { useCallback, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useRouter } from "../hooks";

type Props = {
	children: React.ReactNode;
};

const LoginAuthGuard = observer(function LoginAuthGuard({ children }: Props) {
	const router = useRouter();
	const { accessToken } = useUserToken();

	const check = useCallback(() => {
		if (!accessToken) {
			router.replace("/auth/login");
		}
	}, [router, accessToken]);

	useEffect(() => {
		check();
	}, [check]);

	return <>{children}</>;
});

export default LoginAuthGuard;
