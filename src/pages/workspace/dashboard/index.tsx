import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
	useAuthStore,
	useOrgStore,
	useTeamStore,
	useProjectStore,
	useTaskStore,
	useMembershipStore,
} from '@/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Progress } from '@/ui/progress';
import {
	Building2,
	Users,
	FolderKanban,
	CheckSquare,
	ArrowUpRight,
	Plus,
	CheckCircle2,
	Clock,
	Layers,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import OrgHeaderSwitcher from '../components/OrgHeaderSwitcher';

export const WorkspaceDashboard: React.FC = observer(() => {
	const navigate = useNavigate();
	const authStore = useAuthStore();
	const orgStore = useOrgStore();
	const teamStore = useTeamStore();
	const projectStore = useProjectStore();
	const taskStore = useTaskStore();
	const membershipStore = useMembershipStore();

	const currentOrg = orgStore.currentOrganization;
	const orgId = currentOrg?._id || currentOrg?.id;

	useEffect(() => {
		authStore.fetchMe();
		orgStore.fetchMyOrganizations();
		taskStore.fetchMyTasks();
	}, []);

	useEffect(() => {
		if (orgId) {
			teamStore.fetchOrgTeams(orgId);
			projectStore.fetchOrgProjects(orgId);
			membershipStore.fetchOrgMembers(orgId);
		}
	}, [orgId]);

	const myPendingTasks = taskStore.myTasks.filter((t) => t.status !== 'done');
	const myCompletedTasks = taskStore.myTasks.filter((t) => t.status === 'done');

	return (
		<div className="space-y-6 pb-12">
			{/* Top Bar with Organization Switcher & Greeting */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 shadow-xs">
				<div className="space-y-1.5">
					<div className="flex items-center gap-2">
						<OrgHeaderSwitcher />
						{currentOrg && (
							<Badge variant="outline" className="text-[11px] font-mono text-muted-foreground">
								ID: {(currentOrg._id || currentOrg.id || '').slice(-6)}
							</Badge>
						)}
					</div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						Welcome back, {authStore.userDisplayName}! 👋
					</h1>
					<p className="text-xs text-muted-foreground max-w-xl">
						Manage your agile teams, allocate projects with designated leads, and track sprint tasks in real time.
					</p>
				</div>

				<div className="flex items-center gap-2.5 flex-wrap">
					<Button
						variant="outline"
						size="sm"
						onClick={() => navigate('/projects')}
						className="gap-1.5 text-xs h-9 bg-card"
					>
						<FolderKanban className="w-3.5 h-3.5 text-primary" /> View Projects
					</Button>
					<Button
						size="sm"
						onClick={() => navigate('/tasks')}
						className="gap-1.5 text-xs h-9 bg-primary hover:bg-primary/90 shadow-xs"
					>
						<CheckSquare className="w-3.5 h-3.5" /> Tasks Board
					</Button>
				</div>
			</div>

			{/* KPI Metric Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Teams Card */}
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Teams in Org
						</CardTitle>
						<div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center">
							<Users className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{teamStore.teamCount}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{membershipStore.memberCount} active member{membershipStore.memberCount === 1 ? '' : 's'}
						</p>
						<div className="mt-3 flex items-center justify-between text-[11px] text-info font-medium">
							<Link to="/teams" className="hover:underline flex items-center gap-1">
								Manage teams <ArrowUpRight className="w-3 h-3" />
							</Link>
						</div>
					</CardContent>
				</Card>

				{/* Projects Card */}
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Active Projects
						</CardTitle>
						<div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
							<FolderKanban className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{projectStore.projects.length}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{projectStore.activeProjectsCount} in planning / progress
						</p>
						<div className="mt-3 flex items-center justify-between text-[11px] text-primary font-medium">
							<Link to="/projects" className="hover:underline flex items-center gap-1">
								View all projects <ArrowUpRight className="w-3 h-3" />
							</Link>
						</div>
					</CardContent>
				</Card>

				{/* My Tasks Card */}
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							My Assigned Tasks
						</CardTitle>
						<div className="w-8 h-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
							<CheckSquare className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{myPendingTasks.length}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{myCompletedTasks.length} completed tasks
						</p>
						<div className="mt-3 flex items-center justify-between text-[11px] text-success font-medium">
							<Link to="/tasks" className="hover:underline flex items-center gap-1">
								Open tasks board <ArrowUpRight className="w-3 h-3" />
							</Link>
						</div>
					</CardContent>
				</Card>

				{/* Task Completion Progress */}
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
						<CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
							Sprint Completion
						</CardTitle>
						<div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
							<CheckCircle2 className="w-4 h-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{taskStore.completionPercentage}%</div>
						<div className="text-xs text-muted-foreground mt-1">
							{taskStore.completedCount} of {taskStore.tasks.length} total tasks
						</div>
						<Progress value={taskStore.completionPercentage} className="h-1.5 mt-3" />
					</CardContent>
				</Card>
			</div>

			{/* Middle Section: My Immediate Tasks & Organization Teams */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* My Assigned Tasks List */}
				<div className="lg:col-span-2 space-y-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-3">
							<div>
								<CardTitle className="text-sm font-semibold">My Assigned Tasks</CardTitle>
								<CardDescription className="text-xs">
									Tasks across projects assigned directly to you
								</CardDescription>
							</div>
							<Link to="/tasks">
								<Button variant="ghost" size="sm" className="gap-1 text-xs text-primary">
									View All <ArrowUpRight className="w-3.5 h-3.5" />
								</Button>
							</Link>
						</CardHeader>
						<CardContent>
							{taskStore.myTasks.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground text-xs">
									<CheckCircle2 className="w-8 h-8 text-success/60 mx-auto mb-2" />
									You are all caught up! No tasks assigned to your account.
								</div>
							) : (
								<div className="space-y-2.5">
									{taskStore.myTasks.slice(0, 5).map((task) => {
										const tId = task._id || task.id;
										return (
											<div
												key={tId}
												className="flex items-center justify-between p-3 rounded-xl border border-border/70 hover:bg-muted/40 transition-colors gap-3"
											>
												<div className="min-w-0">
													<div className="text-xs font-semibold text-foreground truncate">
														{task.title}
													</div>
													<div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
														<span className="uppercase text-[10px] font-medium text-primary">
															{task.type}
														</span>
														<span>•</span>
														<span>Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
													</div>
												</div>

												<div className="flex items-center gap-2 shrink-0">
													<Badge
														variant={
															task.priority === 'urgent' || task.priority === 'high'
																? 'destructive'
																: 'secondary'
														}
														className="text-[10px] uppercase font-bold"
													>
														{task.priority}
													</Badge>
													<Badge
														variant={task.status === 'done' ? 'success' : 'outline'}
														className="text-[10px] uppercase font-semibold"
													>
														{task.status.replace('-', ' ')}
													</Badge>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Active Teams in Org */}
				<div className="space-y-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-3">
							<div>
								<CardTitle className="text-sm font-semibold">Teams in Organization</CardTitle>
								<CardDescription className="text-xs">
									Functional teams & leads
								</CardDescription>
							</div>
							<Link to="/teams">
								<Button variant="ghost" size="sm" className="gap-1 text-xs text-primary">
									<Plus className="w-3.5 h-3.5" />
								</Button>
							</Link>
						</CardHeader>
						<CardContent>
							{teamStore.teams.length === 0 ? (
								<div className="text-center py-6 text-muted-foreground text-xs">
									No teams created yet in this organization.
								</div>
							) : (
								<div className="space-y-3">
									{teamStore.teams.map((team) => {
										const teamId = team._id || team.id;
										const leader = typeof team.leaderId === 'object' ? (team.leaderId as any)?.name : null;
										return (
											<div key={teamId} className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
												<div className="flex items-center justify-between">
													<span className="font-semibold text-xs text-foreground">{team.name}</span>
													<Badge variant="outline" className="text-[10px]">
														{team.members?.length || 0} members
													</Badge>
												</div>
												{team.description && (
													<p className="text-[11px] text-muted-foreground line-clamp-1">{team.description}</p>
												)}
												{leader && (
													<p className="text-[10px] text-primary font-medium">Lead: {leader}</p>
												)}
											</div>
										);
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
});

export default WorkspaceDashboard;
