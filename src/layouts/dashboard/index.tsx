import Logo from "@/components/logo";
import Header from "./header";
import Main from "./main";

export default function DashboardLayout() {
	return (
		<div data-slot="slash-layout-root" className="w-full min-h-screen bg-background flex flex-col">
			<Header leftSlot={<Logo />} />
			<Main />
		</div>
	);
}
