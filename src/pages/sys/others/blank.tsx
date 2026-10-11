import { Card, CardContent } from "@/ui/card";

export default function BlankPage() {
	return (
		<div className="w-full flex-1 flex flex-col justify-center min-h-[calc(100vh-var(--layout-header-height)-48px)]">
			<Card className="w-full min-h-[500px] border-dashed border-2 border-border/80 bg-card/40 flex items-center justify-center">
				<CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
					<div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center mb-3">
						<span className="text-xl">📄</span>
					</div>
					<h3 className="text-base font-semibold text-foreground">Blank Page</h3>
					<p className="text-xs text-muted-foreground mt-1 max-w-sm">
						This is an empty page. You can customize this layout or add your own components.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
