import { useEffect, useState } from "react";
import { useSaaSStore } from "@/store/saasStore";
import { useAuthorization } from "@/hooks/useAuthorization";
import { Button } from "@/ui/button";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Play, Pause, Square, Timer } from "lucide-react";
import { toast } from "sonner";

export default function TimeTrackerWidget() {
	const activeTimer = useSaaSStore((s) => s.activeTimer);
	const startTimer = useSaaSStore((s) => s.startTimer);
	const pauseTimer = useSaaSStore((s) => s.pauseTimer);
	const resumeTimer = useSaaSStore((s) => s.resumeTimer);
	const stopTimer = useSaaSStore((s) => s.stopTimer);
	const tickTimer = useSaaSStore((s) => s.tickTimer);
	const tasks = useSaaSStore((s) => s.tasks);
	const projects = useSaaSStore((s) => s.projects);
	const { isPersonalWorkspace, organization } = useAuthorization();

	const [pickerOpen, setPickerOpen] = useState(false);
	const [selectedTaskId, setSelectedTaskId] = useState("");

	// Interval ticker for active timer
	useEffect(() => {
		let interval: any = null;
		if (activeTimer && activeTimer.isRunning) {
			interval = setInterval(() => {
				tickTimer();
			}, 1000);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [activeTimer?.isRunning, tickTimer]);

	// Filter tasks accessible in current workspace
	const accessibleTasks = tasks.filter((t) => {
		if (isPersonalWorkspace) {
			return t.workspaceType === "personal";
		}
		return t.orgId === organization?.id;
	});

	const formatTime = (totalSeconds: number) => {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		const pad = (n: number) => n.toString().padStart(2, "0");
		if (hours > 0) {
			return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
		}
		return `${pad(minutes)}:${pad(seconds)}`;
	};

	const handleStartQuickTimer = () => {
		if (!selectedTaskId) {
			toast.error("Please choose a task to start tracking");
			return;
		}
		startTimer(selectedTaskId);
		const task = tasks.find((t) => t.id === selectedTaskId);
		toast.success(`Timer started for "${task?.title || "Task"}"`);
		setPickerOpen(false);
		setSelectedTaskId("");
	};

	if (!activeTimer) {
		return (
			<>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => {
						if (accessibleTasks.length === 0) {
							toast.info("No tasks available in current workspace. Create a project and task first!");
							return;
						}
						setSelectedTaskId(accessibleTasks[0]?.id || "");
						setPickerOpen(true);
					}}
					className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
					title="Start Timer (built into tasks)"
				>
					<Timer className="w-3.5 h-3.5 text-primary" />
					<span className="hidden md:inline font-medium">Track Time</span>
				</Button>

				{/* Quick Start Picker Dialog */}
				<Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
					<DialogContent className="sm:max-w-[420px]">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2 text-base">
								<Timer className="w-5 h-5 text-primary" />
								Start Task Timer
							</DialogTitle>
							<DialogDescription className="text-xs text-muted-foreground">
								Select a task to begin real-time duration tracking against your daily log.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-3 py-2">
							<div className="space-y-1.5">
								<label className="text-xs font-semibold">Select Task</label>
								<Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
									<SelectTrigger className="h-9 text-xs">
										<SelectValue placeholder="Choose task" />
									</SelectTrigger>
									<SelectContent>
										{accessibleTasks.map((task) => {
											const project = projects.find((p) => p.id === task.projectId);
											return (
												<SelectItem key={task.id} value={task.id} className="text-xs">
													<div className="flex items-center gap-2">
														<span className="font-medium truncate max-w-[220px]">{task.title}</span>
														<span className="text-[10px] text-muted-foreground">({project?.name})</span>
													</div>
												</SelectItem>
											);
										})}
									</SelectContent>
								</Select>
							</div>
						</div>

						<DialogFooter className="gap-2">
							<Button variant="outline" size="sm" onClick={() => setPickerOpen(false)}>
								Cancel
							</Button>
							<Button size="sm" onClick={handleStartQuickTimer} className="bg-primary hover:bg-primary/90">
								<Play className="w-3.5 h-3.5 mr-1 fill-current" /> Start Timer
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</>
		);
	}

	return (
		<div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-lg h-8 animate-in fade-in transition-all">
			<div className="flex items-center gap-1.5 max-w-[140px] sm:max-w-[200px]">
				<span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
				<span className="font-semibold text-xs text-foreground font-mono tracking-tight shrink-0">
					{formatTime(activeTimer.elapsedSeconds)}
				</span>
				<span className="text-[11px] text-muted-foreground truncate hidden sm:inline" title={activeTimer.taskTitle}>
					{activeTimer.taskTitle}
				</span>
			</div>

			<div className="flex items-center gap-0.5 ml-1">
				{activeTimer.isRunning ? (
					<Button
						variant="ghost"
						size="icon"
						onClick={pauseTimer}
						className="w-6 h-6 rounded-md hover:bg-primary/20 text-foreground"
						title="Pause Timer"
					>
						<Pause className="w-3 h-3 fill-current" />
					</Button>
				) : (
					<Button
						variant="ghost"
						size="icon"
						onClick={resumeTimer}
						className="w-6 h-6 rounded-md hover:bg-primary/20 text-primary"
						title="Resume Timer"
					>
						<Play className="w-3 h-3 fill-current" />
					</Button>
				)}

				<Button
					variant="ghost"
					size="icon"
					onClick={() => {
						stopTimer();
						toast.success(`Tracked ${formatTime(activeTimer.elapsedSeconds)} saved to task ledger!`);
					}}
					className="w-6 h-6 rounded-md hover:bg-destructive/20 text-destructive"
					title="Stop & Save Session"
				>
					<Square className="w-3 h-3 fill-current" />
				</Button>
			</div>
		</div>
	);
}
