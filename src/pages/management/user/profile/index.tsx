import React, { useState, useMemo } from "react";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useSaaSStore } from "@/store/saasStore";
import { useUserInfo, useUserActions } from "@/store/userStore";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Progress } from "@/ui/progress";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import {
	User,
	Mail,
	Briefcase,
	Shield,
	Clock,
	Calendar,
	AlertOctagon,
	CheckSquare,
	Edit3,
	Copy,
	Check,
	Sparkles,
	Building2,
	FolderKanban,
	Users,
} from "lucide-react";
import { toast } from "sonner";

export default function UserProfile() {
	const { user, role, isSuperAdmin, organization } = useAuthorization();
	const { username: fallbackUsername, email: fallbackEmail, avatar: fallbackAvatar } = useUserInfo();
	const { setUserInfo } = useUserActions();

	const tasks = useSaaSStore((s) => s.tasks);
	const teams = useSaaSStore((s) => s.teams);
	const projects = useSaaSStore((s) => s.projects);
	const dailyUpdates = useSaaSStore((s) => s.dailyUpdates);
	const users = useSaaSStore((s) => s.users);

	// Active User Data
	const activeUser = user || {
		id: "usr-current",
		name: fallbackUsername || "Hiroshi Tanaka",
		email: fallbackEmail || "tanaka@acme.com",
		avatar: fallbackAvatar,
		title: "VP of Engineering & Founder",
		bio: "Passionate about building resilient multi-tenant architectures and high-performing engineering teams.",
	};

	// Edit Profile Modal
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [name, setName] = useState(activeUser.name);
	const [title, setTitle] = useState(activeUser.title || "Software Engineer");
	const [bio, setBio] = useState(activeUser.bio || "");
	const [phone, setPhone] = useState("+91 (987) 654-3210");
	const [copiedEmail, setCopiedEmail] = useState(false);

	// Sync state when active user changes
	React.useEffect(() => {
		if (activeUser) {
			setName(activeUser.name);
			setTitle(activeUser.title || "");
			setBio(activeUser.bio || "");
		}
	}, [activeUser.id, activeUser.name]);

	// Filter user-specific SaaS resources
	const userTasks = useMemo(() => {
		return tasks.filter((t) => t.assigneeId === activeUser.id);
	}, [tasks, activeUser.id]);

	const completedTasks = useMemo(() => {
		return userTasks.filter((t) => t.status === "DONE");
	}, [userTasks]);

	const inProgressTasks = useMemo(() => {
		return userTasks.filter((t) => t.status === "IN_PROGRESS");
	}, [userTasks]);

	const userTeams = useMemo(() => {
		return teams.filter((t) => t.memberIds.includes(activeUser.id) || t.leadId === activeUser.id);
	}, [teams, activeUser.id]);

	const userProjects = useMemo(() => {
		return projects.filter((p) => p.memberIds.includes(activeUser.id));
	}, [projects, activeUser.id]);

	const userStandups = useMemo(() => {
		return dailyUpdates.filter((d) => d.userId === activeUser.id);
	}, [dailyUpdates, activeUser.id]);

	const taskCompletionRate = userTasks.length > 0 ? Math.round((completedTasks.length / userTasks.length) * 100) : 100;

	const handleCopyEmail = () => {
		navigator.clipboard.writeText(activeUser.email);
		setCopiedEmail(true);
		toast.success("Email copied to clipboard!");
		setTimeout(() => setCopiedEmail(false), 2000);
	};

	const handleSaveProfile = (e: React.FormEvent) => {
		e.preventDefault();
		// Update userStore and toast
		setUserInfo({
			id: activeUser.id,
			username: name.trim(),
			email: activeUser.email,
			avatar: activeUser.avatar,
		});
		// Also update users array in SaaS store if matching
		const existingIdx = users.findIndex((u) => u.id === activeUser.id);
		if (existingIdx !== -1) {
			users[existingIdx].name = name.trim();
			users[existingIdx].title = title.trim();
			users[existingIdx].bio = bio.trim();
		}
		toast.success("Profile updated successfully!");
		setEditModalOpen(false);
	};

	const getRoleVariant = (r?: string) => {
		if (isSuperAdmin) return "destructive";
		if (r === "OWNER") return "default";
		if (r === "ADMIN") return "info";
		return "secondary";
	};

	return (
		<div className="space-y-6 pb-16 max-w-6xl mx-auto">
			{/* Butter-Smooth Hero Header Banner */}
			<div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-primary/15 via-card to-primary/5 p-6 sm:p-8 shadow-sm">
				{/* Ambient background glow */}
				<div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
				<div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-accent/20 blur-2xl pointer-events-none" />

				<div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
					<div className="flex flex-col sm:flex-row sm:items-center gap-5">
						<div className="relative group self-start sm:self-auto">
							<Avatar className="h-24 w-24 rounded-2xl ring-4 ring-background shadow-lg border border-border/80">
								<AvatarImage src={activeUser.avatar} alt={activeUser.name} className="object-cover" />
								<AvatarFallback className="text-2xl font-black rounded-2xl bg-primary text-primary-foreground">
									{activeUser.name.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background shadow-xs border border-border">
								<span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
							</span>
						</div>

						<div className="space-y-1.5">
							<div className="flex flex-wrap items-center gap-2.5">
								<h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{activeUser.name}</h1>
								<Badge variant={getRoleVariant(role)} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
									{isSuperAdmin ? "SUPER ADMIN" : role || "MEMBER"}
								</Badge>
								<Badge variant="outline" className="text-xs px-2.5 py-0.5 font-semibold gap-1 bg-card/60">
									<Building2 className="w-3 h-3 text-primary" />
									{organization?.name || "Acme SaaS"}
								</Badge>
							</div>

							<p className="text-xs sm:text-sm font-medium text-foreground/80 flex items-center gap-1.5">
								<Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
								<span>{activeUser.title || "Fullstack Engineer"}</span>
								<span className="text-muted-foreground">•</span>
								<span className="text-muted-foreground text-xs">{organization?.timezone || "Asia/Kolkata"}</span>
							</p>

							<p className="text-xs text-muted-foreground max-w-xl line-clamp-2 pt-0.5">
								{activeUser.bio || "Member of the engineering and product execution team."}
							</p>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 self-start md:self-center shrink-0">
						<Button
							variant="outline"
							size="sm"
							onClick={handleCopyEmail}
							className="h-9 px-3 text-xs gap-1.5 bg-card/80 backdrop-blur-xs border-border/80 hover:bg-card shadow-2xs"
						>
							{copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
							<span>{copiedEmail ? "Copied" : "Copy Email"}</span>
						</Button>

						<Button
							size="sm"
							onClick={() => setEditModalOpen(true)}
							className="h-9 px-4 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xs"
						>
							<Edit3 className="w-3.5 h-3.5" />
							<span>Edit Profile</span>
						</Button>
					</div>
				</div>

				{/* Quick Stats Grid Bar */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/50">
					<div className="p-3 rounded-2xl bg-card/60 backdrop-blur-xs border border-border/60">
						<span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
							<CheckSquare className="w-3 h-3 text-primary" /> Assigned Tasks
						</span>
						<div className="text-lg font-black text-foreground mt-0.5">{userTasks.length}</div>
						<span className="text-[10px] text-emerald-500 font-semibold">{completedTasks.length} completed</span>
					</div>

					<div className="p-3 rounded-2xl bg-card/60 backdrop-blur-xs border border-border/60">
						<span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
							<Users className="w-3 h-3 text-info" /> Teams
						</span>
						<div className="text-lg font-black text-foreground mt-0.5">{userTeams.length}</div>
						<span className="text-[10px] text-muted-foreground">
							{userTeams.filter((t) => t.leadId === activeUser.id).length > 0 ? "Team Lead" : "Contributor"}
						</span>
					</div>

					<div className="p-3 rounded-2xl bg-card/60 backdrop-blur-xs border border-border/60">
						<span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
							<FolderKanban className="w-3 h-3 text-amber-500" /> Projects
						</span>
						<div className="text-lg font-black text-foreground mt-0.5">{userProjects.length}</div>
						<span className="text-[10px] text-muted-foreground">Active delivery</span>
					</div>

					<div className="p-3 rounded-2xl bg-card/60 backdrop-blur-xs border border-border/60">
						<span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
							<Clock className="w-3 h-3 text-purple-500" /> Standups
						</span>
						<div className="text-lg font-black text-foreground mt-0.5">{userStandups.length}</div>
						<span className="text-[10px] text-muted-foreground">Daily logs</span>
					</div>
				</div>
			</div>

			{/* Butter-Smooth Tabbed Content */}
			<Tabs defaultValue="overview" className="space-y-6">
				<TabsList className="grid grid-cols-3 max-w-md h-10 p-1 bg-muted/60 rounded-xl border border-border/60">
					<TabsTrigger value="overview" className="text-xs font-bold gap-1.5 rounded-lg">
						<User className="w-3.5 h-3.5" /> Overview
					</TabsTrigger>
					<TabsTrigger value="tasks" className="text-xs font-bold gap-1.5 rounded-lg">
						<CheckSquare className="w-3.5 h-3.5" /> My Tasks ({userTasks.length})
					</TabsTrigger>
					<TabsTrigger value="standups" className="text-xs font-bold gap-1.5 rounded-lg">
						<Clock className="w-3.5 h-3.5" /> Standups ({userStandups.length})
					</TabsTrigger>
				</TabsList>

				{/* TAB 1: OVERVIEW */}
				<TabsContent value="overview" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Left: About Details */}
						<Card className="border-border/80 shadow-xs">
							<CardHeader className="pb-3 border-b border-border/40">
								<CardTitle className="text-sm font-bold flex items-center gap-2">
									<User className="w-4 h-4 text-primary" /> Profile Information
								</CardTitle>
							</CardHeader>
							<CardContent className="p-4 space-y-4 text-xs">
								<div className="space-y-3">
									<div className="flex items-center justify-between py-1 border-b border-border/30">
										<span className="text-muted-foreground flex items-center gap-1.5">
											<User className="w-3.5 h-3.5" /> Full Name
										</span>
										<span className="font-semibold text-foreground">{activeUser.name}</span>
									</div>

									<div className="flex items-center justify-between py-1 border-b border-border/30">
										<span className="text-muted-foreground flex items-center gap-1.5">
											<Mail className="w-3.5 h-3.5" /> Email
										</span>
										<span className="font-semibold text-foreground font-mono text-[11px]">{activeUser.email}</span>
									</div>

									<div className="flex items-center justify-between py-1 border-b border-border/30">
										<span className="text-muted-foreground flex items-center gap-1.5">
											<Shield className="w-3.5 h-3.5" /> Organization Role
										</span>
										<Badge variant={getRoleVariant(role)} className="text-[9px] uppercase font-bold px-1.5 py-0">
											{isSuperAdmin ? "SUPER ADMIN" : role || "MEMBER"}
										</Badge>
									</div>

									<div className="flex items-center justify-between py-1 border-b border-border/30">
										<span className="text-muted-foreground flex items-center gap-1.5">
											<Building2 className="w-3.5 h-3.5" /> Organization
										</span>
										<span className="font-semibold text-foreground">{organization?.name}</span>
									</div>

									<div className="flex items-center justify-between py-1 border-b border-border/30">
										<span className="text-muted-foreground flex items-center gap-1.5">
											<Clock className="w-3.5 h-3.5" /> Timezone
										</span>
										<span className="font-semibold text-foreground">{organization?.timezone}</span>
									</div>

									<div className="flex items-center justify-between py-1">
										<span className="text-muted-foreground flex items-center gap-1.5">
											<Sparkles className="w-3.5 h-3.5" /> Currency
										</span>
										<span className="font-semibold text-foreground">{organization?.currency} ({organization?.currencySymbol})</span>
									</div>
								</div>

								{/* Task Velocity Widget */}
								<div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-2 mt-4">
									<div className="flex justify-between text-xs">
										<span className="font-semibold text-foreground">Task Completion Velocity</span>
										<span className="font-bold text-primary">{taskCompletionRate}%</span>
									</div>
									<Progress value={taskCompletionRate} className="h-2" />
									<p className="text-[10px] text-muted-foreground">
										{completedTasks.length} of {userTasks.length} assigned tasks finished.
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Right: Teams & Projects */}
						<div className="lg:col-span-2 space-y-6">
							{/* Teams Section */}
							<Card className="border-border/80 shadow-xs">
								<CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
									<div>
										<CardTitle className="text-sm font-bold flex items-center gap-2">
											<Users className="w-4 h-4 text-primary" /> Teams & Responsibilities ({userTeams.length})
										</CardTitle>
										<CardDescription className="text-xs">
											Engineering squads and functional groups you are a member of.
										</CardDescription>
									</div>
								</CardHeader>
								<CardContent className="p-4">
									{userTeams.length === 0 ? (
										<div className="p-8 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border/70">
											Not assigned to any teams yet.
										</div>
									) : (
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
											{userTeams.map((team) => {
												const isLead = team.leadId === activeUser.id;
												return (
													<div
														key={team.id}
														className="p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-all space-y-2 shadow-2xs"
													>
														<div className="flex items-center justify-between">
															<h4 className="font-bold text-xs text-foreground">{team.name}</h4>
															{isLead ? (
																<Badge variant="warning" className="text-[9px] px-1.5 py-0 font-bold">
																	★ Team Lead
																</Badge>
															) : (
																<Badge variant="secondary" className="text-[9px] px-1.5 py-0">
																	Member
																</Badge>
															)}
														</div>
														<p className="text-[11px] text-muted-foreground line-clamp-2">
															{team.description || "Active engineering squad."}
														</p>
														<div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
															<Users className="w-3 h-3" />
															<span>{team.memberIds.length} members</span>
														</div>
													</div>
												);
											})}
										</div>
									)}
								</CardContent>
							</Card>

							{/* Projects Section */}
							<Card className="border-border/80 shadow-xs">
								<CardHeader className="pb-3 border-b border-border/40">
									<CardTitle className="text-sm font-bold flex items-center gap-2">
										<FolderKanban className="w-4 h-4 text-primary" /> Active Projects ({userProjects.length})
									</CardTitle>
									<CardDescription className="text-xs">
										Delivery initiatives and roadmap projects you contribute to.
									</CardDescription>
								</CardHeader>
								<CardContent className="p-4">
									{userProjects.length === 0 ? (
										<div className="p-8 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border/70">
											No active projects assigned.
										</div>
									) : (
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
											{userProjects.map((project) => (
												<div
													key={project.id}
													className="p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-all space-y-2 shadow-2xs"
												>
													<div className="flex items-center justify-between">
														<h4 className="font-bold text-xs text-foreground">{project.name}</h4>
														<Badge variant="success" className="text-[9px] px-1.5 py-0 font-bold">
															{project.status}
														</Badge>
													</div>
													<p className="text-[11px] text-muted-foreground line-clamp-2">
														{project.description}
													</p>
													<div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
														<span>Target: {project.targetDate}</span>
														<span>{project.memberIds.length} contributors</span>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</TabsContent>

				{/* TAB 2: MY TASKS */}
				<TabsContent value="tasks" className="space-y-4">
					<Card className="border-border/80 shadow-xs">
						<CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
							<div>
								<CardTitle className="text-base font-bold flex items-center gap-2">
									<CheckSquare className="w-4 h-4 text-primary" /> My Assigned Tasks
								</CardTitle>
								<CardDescription className="text-xs">
									Sprint tasks assigned to {activeUser.name}.
								</CardDescription>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant="secondary" className="text-xs">
									{inProgressTasks.length} In Progress
								</Badge>
								<Badge variant="success" className="text-xs font-bold">
									{completedTasks.length} Completed
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="p-4">
							{userTasks.length === 0 ? (
								<div className="p-12 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border/70">
									No tasks currently assigned.
								</div>
							) : (
								<div className="rounded-xl border border-border/70 overflow-hidden">
									<table className="w-full text-xs text-left">
										<thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px] font-semibold">
											<tr>
												<th className="p-3">Task Title</th>
												<th className="p-3">Status</th>
												<th className="p-3">Priority</th>
												<th className="p-3">Due Date</th>
												<th className="p-3">Labels</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-border/40">
											{userTasks.map((t) => (
												<tr key={t.id} className="hover:bg-accent/40 transition-colors">
													<td className="p-3 font-semibold text-foreground">
														<div>{t.title}</div>
														<div className="text-[10px] text-muted-foreground font-normal line-clamp-1">{t.description}</div>
													</td>
													<td className="p-3">
														<Badge
															variant={
																t.status === "DONE"
																	? "success"
																	: t.status === "IN_PROGRESS"
																	? "info"
																	: t.status === "BLOCKED"
																	? "destructive"
																	: "secondary"
															}
															className="text-[10px] font-bold"
														>
															{t.status}
														</Badge>
													</td>
													<td className="p-3">
														<Badge
															variant={
																t.priority === "URGENT" || t.priority === "HIGH"
																	? "destructive"
																	: t.priority === "MEDIUM"
																	? "warning"
																	: "secondary"
															}
															className="text-[9px] font-semibold"
														>
															{t.priority}
														</Badge>
													</td>
													<td className="p-3 text-muted-foreground">
														{t.dueDate || "No due date"}
													</td>
													<td className="p-3">
														<div className="flex flex-wrap gap-1">
															{t.labels.map((l) => (
																<Badge key={l} variant="outline" className="text-[9px] px-1 py-0">
																	{l}
																</Badge>
															))}
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* TAB 3: STANDUPS */}
				<TabsContent value="standups" className="space-y-4">
					<Card className="border-border/80 shadow-xs">
						<CardHeader className="pb-3 border-b border-border/40">
							<CardTitle className="text-base font-bold flex items-center gap-2">
								<Clock className="w-4 h-4 text-primary" /> Daily Standup Submissions
							</CardTitle>
							<CardDescription className="text-xs">
								Execution logs and blocker updates submitted by {activeUser.name}.
							</CardDescription>
						</CardHeader>
						<CardContent className="p-4 space-y-4">
							{userStandups.length === 0 ? (
								<div className="p-12 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border/70">
									No standup entries submitted yet.
								</div>
							) : (
								<div className="space-y-4">
									{userStandups.map((standup) => (
										<div
											key={standup.id}
											className="p-4 rounded-2xl border border-border/70 bg-card hover:border-primary/40 transition-all space-y-3 shadow-2xs"
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Calendar className="w-4 h-4 text-primary" />
													<span className="font-bold text-xs text-foreground">Date: {standup.date}</span>
												</div>
												<Badge variant="success" className="text-[10px] font-bold">
													{standup.status}
												</Badge>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
												<div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
													<span className="font-bold text-foreground text-[11px]">Yesterday's Accomplishments</span>
													<p className="text-muted-foreground">{standup.yesterday || "No entry."}</p>
												</div>

												<div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
													<span className="font-bold text-foreground text-[11px]">Today's Plan</span>
													<p className="text-muted-foreground">{standup.today || "No entry."}</p>
												</div>

												<div className={`p-3 rounded-xl border space-y-1 ${standup.blockers && standup.blockers !== "None" ? "bg-destructive/5 border-destructive/30" : "bg-muted/30 border-border/50"}`}>
													<span className={`font-bold text-[11px] flex items-center gap-1 ${standup.blockers && standup.blockers !== "None" ? "text-destructive" : "text-foreground"}`}>
														<AlertOctagon className="w-3.5 h-3.5" /> Blockers & Impediments
													</span>
													<p className="text-muted-foreground">{standup.blockers || "None"}</p>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Edit Profile Modal */}
			<Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
				<DialogContent className="sm:max-w-[480px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Edit3 className="w-5 h-5 text-primary" /> Edit Profile
						</DialogTitle>
						<DialogDescription className="text-xs">
							Update your personal information, role title, and biography.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSaveProfile} className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Full Name *</Label>
							<Input value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-xs" required />
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Professional Title / Role</Label>
							<Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Backend Engineer" className="h-9 text-xs" />
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Contact Phone</Label>
							<Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 text-xs" />
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs font-semibold">Bio / Short Summary</Label>
							<Textarea
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								placeholder="Brief description of your expertise and role..."
								rows={3}
								className="text-xs resize-none"
							/>
						</div>

						<DialogFooter className="pt-2 gap-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-xs px-4">
								Save Profile
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
