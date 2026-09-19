import { useState, useMemo, useEffect } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useSaaSStore } from "@/store/saasStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import { Input } from "@/ui/input";
import {
	CalendarClock,
	AlertOctagon,
	Send,
	Sparkles,
	Globe,
	CheckCircle2,
	TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

export default function DailyExecutionPage() {
	const { user, organization, isPersonalWorkspace } = useAuthorization();
	const dailyUpdates = useSaaSStore((s) => s.dailyUpdates);
	const saveDailyUpdate = useSaaSStore((s) => s.saveDailyUpdate);
	const users = useSaaSStore((s) => s.users);

	const todayDefault = new Date().toISOString().split("T")[0];
	const [selectedDate, setSelectedDate] = useState(todayDefault);

	const targetOrgId = isPersonalWorkspace ? "personal" : organization?.id || "";

	// Find user's daily update for selectedDate
	const myUpdate = useMemo(() => {
		return dailyUpdates.find((d) => d.orgId === targetOrgId && d.userId === user?.id && d.date === selectedDate);
	}, [dailyUpdates, targetOrgId, user?.id, selectedDate]);

	// 4 Form States matching PRD Section 23: Yesterday, Today, Blockers, Progress
	const [yesterday, setYesterday] = useState(myUpdate?.yesterday || "");
	const [today, setToday] = useState(myUpdate?.today || "");
	const [blockers, setBlockers] = useState(myUpdate?.blockers || "");
	const [progress, setProgress] = useState("");

	useEffect(() => {
		if (myUpdate) {
			setYesterday(myUpdate.yesterday);
			setToday(myUpdate.today);
			setBlockers(myUpdate.blockers);
		} else {
			setYesterday("");
			setToday("");
			setBlockers("");
			setProgress("");
		}
	}, [myUpdate, selectedDate]);

	// Filter all updates for selected date
	const allDateUpdates = useMemo(() => {
		return dailyUpdates.filter((d) => d.orgId === targetOrgId && d.date === selectedDate);
	}, [dailyUpdates, targetOrgId, selectedDate]);

	const handleSave = (status: "DRAFT" | "PUBLISHED") => {
		if (!today.trim()) {
			toast.error("Please fill in what you will work on today.");
			return;
		}

		saveDailyUpdate({
			orgId: targetOrgId,
			userId: user.id,
			date: selectedDate,
			yesterday: yesterday.trim() || "No previous tasks recorded",
			today: today.trim(),
			blockers: blockers.trim() || "None",
			status,
		});

		toast.success(status === "PUBLISHED" ? "Daily update submitted successfully!" : "Draft saved.");
	};

	return (
		<div className="space-y-6 pb-16">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<CalendarClock className="w-5 h-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">Daily Execution</h1>
					</div>
					<p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
						<Globe className="w-3.5 h-3.5" />
						{isPersonalWorkspace
							? "Personal daily standup and reflection log"
							: `Operating in ${organization?.name} • Timezone: ${organization?.timezone || "UTC"}`}
					</p>
				</div>

				{/* Date Selector */}
				<div className="flex items-center gap-2 bg-card p-1.5 rounded-xl border border-border/80 shadow-2xs">
					<Input
						type="date"
						value={selectedDate}
						onChange={(e) => setSelectedDate(e.target.value)}
						className="h-8 text-xs font-mono"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* 1. Daily Standup Form (4 PRD Sections) */}
				<Card className="lg:col-span-5 h-fit border-border/80 shadow-xs">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm font-bold flex items-center gap-1.5">
								<Sparkles className="w-4 h-4 text-primary" />
								Your Daily Update ({selectedDate})
							</CardTitle>
							{myUpdate && (
								<Badge variant={myUpdate.status === "PUBLISHED" ? "success" : "secondary"} className="text-[10px]">
									{myUpdate.status}
								</Badge>
							)}
						</div>
						<CardDescription className="text-xs">
							Flow: Yesterday → Today → Blockers → Progress → Submit
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-4">
						{/* 1. Yesterday */}
						<div className="space-y-1">
							<Label className="text-xs font-bold text-foreground flex items-center gap-1">
								<CheckCircle2 className="w-3.5 h-3.5 text-success" /> 1. Yesterday
							</Label>
							<p className="text-[11px] text-muted-foreground">What was completed?</p>
							<Textarea
								placeholder="Summarize your completed tasks and achievements..."
								value={yesterday}
								onChange={(e) => setYesterday(e.target.value)}
								className="text-xs resize-none h-18"
							/>
						</div>

						{/* 2. Today */}
						<div className="space-y-1">
							<Label className="text-xs font-bold text-foreground flex items-center gap-1">
								<CalendarClock className="w-3.5 h-3.5 text-primary" /> 2. Today *
							</Label>
							<p className="text-[11px] text-muted-foreground">What will be worked on?</p>
							<Textarea
								placeholder="Target priorities, deliverables, and focus areas for today..."
								value={today}
								onChange={(e) => setToday(e.target.value)}
								className="text-xs resize-none h-20"
								required
							/>
						</div>

						{/* 3. Blockers */}
						<div className="space-y-1">
							<Label className="text-xs font-bold text-foreground flex items-center gap-1">
								<AlertOctagon className="w-3.5 h-3.5 text-destructive" /> 3. Blockers
							</Label>
							<p className="text-[11px] text-muted-foreground">What is preventing progress?</p>
							<Input
								placeholder="Enter 'None' or describe blocker..."
								value={blockers}
								onChange={(e) => setBlockers(e.target.value)}
								className="h-9 text-xs"
							/>
						</div>

						{/* 4. Progress */}
						<div className="space-y-1">
							<Label className="text-xs font-bold text-foreground flex items-center gap-1">
								<TrendingUp className="w-3.5 h-3.5 text-info" /> 4. Progress
							</Label>
							<p className="text-[11px] text-muted-foreground">Important progress or information.</p>
							<Input
								placeholder="Key highlights, milestones reached, or updates..."
								value={progress}
								onChange={(e) => setProgress(e.target.value)}
								className="h-9 text-xs"
							/>
						</div>

						<div className="flex items-center gap-2 pt-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => handleSave("DRAFT")}
								className="text-xs flex-1"
							>
								Save Draft
							</Button>
							<Button
								type="button"
								size="sm"
								onClick={() => handleSave("PUBLISHED")}
								className="text-xs flex-1 bg-primary hover:bg-primary/90"
							>
								<Send className="w-3.5 h-3.5 mr-1" /> Submit
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* 2. Team Standups Feed for Selected Date */}
				<Card className="lg:col-span-7 border-border/80 shadow-xs">
					<CardHeader className="pb-3 border-b border-border/70">
						<CardTitle className="text-sm font-bold">
							Daily Standup Feed ({selectedDate})
						</CardTitle>
						<CardDescription className="text-xs">
							Submitted updates from members for this date.
						</CardDescription>
					</CardHeader>

					<CardContent className="p-4 space-y-4">
						{allDateUpdates.map((update) => {
							const author = users.find((u) => u.id === update.userId);
							const hasBlocker = update.blockers && update.blockers.toLowerCase() !== "none";

							return (
								<div
									key={update.id}
									className="p-4 rounded-xl border border-border/80 bg-card hover:border-primary/40 transition-all space-y-3 shadow-2xs"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2.5">
											<Avatar className="w-8 h-8">
												<AvatarImage src={author?.avatar} />
												<AvatarFallback>{author?.name[0] || "U"}</AvatarFallback>
											</Avatar>
											<div>
												<h4 className="font-semibold text-xs text-foreground">{author?.name}</h4>
												<span className="text-[10px] text-muted-foreground">{author?.title || "Member"}</span>
											</div>
										</div>
										<Badge variant="outline" className="text-[10px] uppercase font-semibold">
											{new Date(update.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
										</Badge>
									</div>

									<div className="space-y-2 text-xs">
										<div className="p-2.5 rounded-lg bg-muted/40 space-y-0.5">
											<span className="text-[10px] font-bold text-success uppercase tracking-wider">Yesterday:</span>
											<p className="text-foreground/90">{update.yesterday}</p>
										</div>

										<div className="p-2.5 rounded-lg bg-primary/5 border border-primary/15 space-y-0.5">
											<span className="text-[10px] font-bold text-primary uppercase tracking-wider">Today:</span>
											<p className="text-foreground/90 font-medium">{update.today}</p>
										</div>

										{hasBlocker ? (
											<div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 space-y-0.5">
												<span className="text-[10px] font-bold text-destructive uppercase tracking-wider flex items-center gap-1">
													<AlertOctagon className="w-3 h-3" /> Blocker:
												</span>
												<p className="text-destructive font-medium">{update.blockers}</p>
											</div>
										) : null}
									</div>
								</div>
							);
						})}

						{allDateUpdates.length === 0 && (
							<div className="text-center py-16 text-muted-foreground">
								<CalendarClock className="w-10 h-10 mx-auto mb-2 opacity-30" />
								<p className="text-xs font-semibold">No updates submitted for {selectedDate}.</p>
								<p className="text-[11px]">Submit your update on the left to start the feed.</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
