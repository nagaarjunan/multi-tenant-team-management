import React, { useState, useMemo } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useSaaSStore } from "@/store/saasStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import {
	CalendarClock,
	Clock,
	AlertOctagon,
	Send,
	Sparkles,
	Globe,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export default function DailyExecutionPage() {
	const { user, organization } = useAuthorization();
	const dailyUpdates = useSaaSStore((s) => s.dailyUpdates);
	const saveDailyUpdate = useSaaSStore((s) => s.saveDailyUpdate);
	const users = useSaaSStore((s) => s.users);

	// Current selected date (default: 2026-09-16)
	const [selectedDate, setSelectedDate] = useState("2026-09-16");

	// Find user's daily update for selectedDate
	const myUpdate = useMemo(() => {
		return dailyUpdates.find((d) => d.orgId === organization?.id && d.userId === user?.id && d.date === selectedDate);
	}, [dailyUpdates, organization?.id, user?.id, selectedDate]);

	// Form States
	const [yesterday, setYesterday] = useState(myUpdate?.yesterday || "");
	const [today, setToday] = useState(myUpdate?.today || "");
	const [blockers, setBlockers] = useState(myUpdate?.blockers || "");

	// Sync form when selected date or myUpdate changes
	React.useEffect(() => {
		if (myUpdate) {
			setYesterday(myUpdate.yesterday);
			setToday(myUpdate.today);
			setBlockers(myUpdate.blockers);
		} else {
			setYesterday("");
			setToday("");
			setBlockers("");
		}
	}, [myUpdate, selectedDate]);

	// Filter all updates for selected date in current org
	const allDateUpdates = useMemo(() => {
		return dailyUpdates.filter((d) => d.orgId === organization?.id && d.date === selectedDate);
	}, [dailyUpdates, organization?.id, selectedDate]);

	const handleSave = (status: "DRAFT" | "PUBLISHED") => {
		if (!organization || !user) return;
		if (!yesterday.trim() && !today.trim()) {
			toast.error("Please fill in at least yesterday or today's activities.");
			return;
		}

		saveDailyUpdate({
			orgId: organization.id,
			userId: user.id,
			date: selectedDate,
			yesterday: yesterday.trim(),
			today: today.trim(),
			blockers: blockers.trim(),
			status,
		});

		toast.success(status === "PUBLISHED" ? "Daily update published to team feed!" : "Draft saved.");
	};

	return (
		<div className="space-y-6 pb-12">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<CalendarClock className="w-5 h-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">Daily Execution & Standups</h1>
					</div>
					<p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
						<Globe className="w-3.5 h-3.5" />
						Operating in <strong>{organization?.name}</strong> timezone: <strong>{organization?.timezone}</strong>
					</p>
				</div>

				{/* Date Selector */}
				<div className="flex items-center gap-2 bg-card p-1.5 rounded-xl border border-border/60 shadow-xs">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setSelectedDate("2026-09-15")}
						className="h-7 w-7 p-0"
					>
						<ChevronLeft className="w-4 h-4" />
					</Button>
					<span className="text-xs font-semibold px-2">{selectedDate}</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setSelectedDate("2026-09-16")}
						className="h-7 w-7 p-0"
					>
						<ChevronRight className="w-4 h-4" />
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Left Form: My Daily Standup Entry (5 cols) */}
				<div className="lg:col-span-5 space-y-4">
					<Card className="border-primary/30 shadow-sm">
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<CardTitle className="text-base font-semibold flex items-center gap-1.5">
									<Sparkles className="w-4 h-4 text-primary" /> Your Daily Update
								</CardTitle>
								{myUpdate && (
									<Badge variant={myUpdate.status === "PUBLISHED" ? "success" : "warning"} className="text-[10px]">
										{myUpdate.status}
									</Badge>
								)}
							</div>
							<CardDescription className="text-xs">
								Post your progress for {selectedDate} ({organization?.timezone})
							</CardDescription>
						</CardHeader>

						<CardContent className="space-y-4">
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold text-foreground">
									1. Yesterday — What did you complete?
								</Label>
								<Textarea
									placeholder="e.g. Completed API endpoint tests, merged PR #104..."
									value={yesterday}
									onChange={(e) => setYesterday(e.target.value)}
									className="text-xs resize-none"
									rows={3}
								/>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold text-primary">
									2. Today — What are you working on?
								</Label>
								<Textarea
									placeholder="e.g. Implementing payment webhook handler, reviewing code..."
									value={today}
									onChange={(e) => setToday(e.target.value)}
									className="text-xs resize-none"
									rows={3}
								/>
							</div>

							<div className="space-y-1.5">
								<Label className="text-xs font-semibold text-destructive">
									3. Blockers — Anything blocking you?
								</Label>
								<Textarea
									placeholder="e.g. Waiting on API credentials from vendor (or type 'None')..."
									value={blockers}
									onChange={(e) => setBlockers(e.target.value)}
									className="text-xs resize-none"
									rows={2}
								/>
							</div>

							<div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleSave("DRAFT")}
									className="text-xs h-8"
								>
									Save Draft
								</Button>
								<Button
									size="sm"
									onClick={() => handleSave("PUBLISHED")}
									className="bg-primary hover:bg-primary/90 text-xs h-8 gap-1.5"
								>
									<Send className="w-3.5 h-3.5" /> Publish Standup
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right: Team-Wide Daily Execution Feed (7 cols) */}
				<div className="lg:col-span-7 space-y-4">
					<Card>
						<CardHeader className="pb-3">
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-base font-semibold">Team Standup Feed</CardTitle>
									<CardDescription className="text-xs">
										Aggregated daily execution reports for {selectedDate}
									</CardDescription>
								</div>
								<Badge variant="outline" className="text-xs font-medium">
									{allDateUpdates.length} Submissions
								</Badge>
							</div>
						</CardHeader>

						<CardContent className="space-y-4">
							{allDateUpdates.length === 0 ? (
								<div className="text-center py-12 text-muted-foreground text-xs">
									<Clock className="w-8 h-8 mx-auto mb-2 opacity-60" />
									No standup entries submitted for {selectedDate} yet.
								</div>
							) : (
								allDateUpdates.map((upd) => {
									const memberUser = users.find((u) => u.id === upd.userId);
									const hasBlocker = upd.blockers && upd.blockers.toLowerCase() !== "none" && upd.blockers.trim() !== "";

									return (
										<div
											key={upd.id}
											className="p-4 rounded-xl border border-border/60 bg-card/60 hover:bg-card transition-all space-y-3 shadow-xs"
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2.5">
													<Avatar className="w-7 h-7">
														<AvatarImage src={memberUser?.avatar} />
														<AvatarFallback className="text-xs">{memberUser?.name?.charAt(0)}</AvatarFallback>
													</Avatar>
													<div>
														<div className="text-xs font-semibold text-foreground">{memberUser?.name}</div>
														<div className="text-[10px] text-muted-foreground">{memberUser?.title}</div>
													</div>
												</div>

												<div className="flex items-center gap-1.5">
													{hasBlocker && (
														<Badge variant="destructive" className="text-[9px] gap-1 uppercase font-bold">
															<AlertOctagon className="w-3 h-3" /> Has Blocker
														</Badge>
													)}
													<Badge variant="outline" className="text-[9px]">
														{new Date(upd.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
													</Badge>
												</div>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
												<div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 space-y-1">
													<div className="text-[10px] font-semibold text-muted-foreground uppercase">Yesterday</div>
													<p className="text-foreground text-[11px]">{upd.yesterday || "None"}</p>
												</div>
												<div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
													<div className="text-[10px] font-semibold text-primary uppercase">Today</div>
													<p className="text-foreground text-[11px]">{upd.today || "None"}</p>
												</div>
												<div
													className={`p-2.5 rounded-lg border space-y-1 ${
														hasBlocker
															? "bg-destructive/10 border-destructive/30"
															: "bg-muted/30 border-border/40"
													}`}
												>
													<div
														className={`text-[10px] font-semibold uppercase ${
															hasBlocker ? "text-destructive font-bold" : "text-muted-foreground"
														}`}
													>
														Blockers
													</div>
													<p className="text-foreground text-[11px]">{upd.blockers || "None"}</p>
												</div>
											</div>
										</div>
									);
								})
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
