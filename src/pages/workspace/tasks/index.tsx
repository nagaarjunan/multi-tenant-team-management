import React, { useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useTaskStore, useProjectStore, useOrgStore, useAuthStore } from '@/store';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/ui/select';
import {
	CheckSquare,
	Plus,
	Grid,
	List,
	ListFilter,
	Calendar,
	User,
	Trash2,
	AlertCircle,
	FolderPlus,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import OrgHeaderSwitcher from '../components/OrgHeaderSwitcher';
import type { BackendTask, BackendTaskPriority, BackendTaskStatus, BackendTaskType } from '@/types/backend';

export const TasksPage: React.FC = observer(() => {
	const navigate = useNavigate();
	const taskStore = useTaskStore();
	const projectStore = useProjectStore();
	const orgStore = useOrgStore();
	const authStore = useAuthStore();

	const currentOrg = orgStore.currentOrganization;
	const orgId = currentOrg?._id || currentOrg?.id;

	const [viewMode, setViewMode] = useState<'board' | 'table'>('board');

	// Create Task Modal State
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [selectedProjectId, setSelectedProjectId] = useState('');
	const [assigneeId, setAssigneeId] = useState('');
	const [type, setType] = useState<BackendTaskType>('task');
	const [priority, setPriority] = useState<BackendTaskPriority>('medium');
	const [dueDate, setDueDate] = useState('');

	// Selected Task for Detail Modal
	const [selectedTask, setSelectedTask] = useState<BackendTask | null>(null);

	useEffect(() => {
		if (orgId) {
			projectStore.fetchOrgProjects(orgId);
		}
	}, [orgId]);

	// Automatically load tasks when a project is selected
	useEffect(() => {
		const activeProjId = projectStore.currentProjectId || projectStore.projects[0]?._id || projectStore.projects[0]?.id;
		if (activeProjId) {
			setSelectedProjectId(activeProjId);
			taskStore.fetchProjectTasks(activeProjId);
		}
	}, [projectStore.projects.length, projectStore.currentProjectId]);

	// Extract allowed assignees from the selected project (allocated members + lead!)
	const modalProject = useMemo(() => {
		return projectStore.projects.find((p) => (p._id || p.id) === selectedProjectId) || null;
	}, [projectStore.projects, selectedProjectId]);

	const allowedAssignees = useMemo(() => {
		if (!modalProject) return [];
		const list: Array<{ id: string; name: string }> = [];

		const leadObj = typeof modalProject.leadId === 'object' ? (modalProject.leadId as any) : null;
		const leadId = leadObj?._id || leadObj?.id || (modalProject.leadId as string);
		if (leadId) {
			list.push({ id: leadId, name: (leadObj?.name || 'Lead ' + leadId.slice(-4)) + ' (Project Lead)' });
		}

		for (const m of modalProject.members || []) {
			const mObj = typeof m === 'object' ? (m as any) : null;
			const mId = mObj?._id || mObj?.id || (m as string);
			if (mId && !list.some((item) => item.id === mId)) {
				list.push({ id: mId, name: mObj?.name || 'Member ' + mId.slice(-4) });
			}
		}
		return list;
	}, [modalProject]);

	const handleCreateTask = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !selectedProjectId) return;

		try {
			await taskStore.createTask({
				title: title.trim(),
				description: description.trim() || undefined,
				projectId: selectedProjectId,
				assigneeId: assigneeId || null,
				type,
				priority,
				dueDate: dueDate || undefined,
			});
			setCreateModalOpen(false);
			setTitle('');
			setDescription('');
			setAssigneeId('');
			setDueDate('');
		} catch {
			// Toast handled in store
		}
	};

	const handleStatusChange = async (taskId: string, newStatus: BackendTaskStatus) => {
		await taskStore.updateTaskStatus(taskId, newStatus);
		if (selectedTask && (selectedTask._id || selectedTask.id) === taskId) {
			setSelectedTask({ ...selectedTask, status: newStatus });
		}
	};

	const handleDeleteTask = async (taskId: string, taskTitle: string) => {
		if (confirm(`Delete task "${taskTitle}"?`)) {
			await taskStore.deleteTask(taskId);
			if (selectedTask && (selectedTask._id || selectedTask.id) === taskId) {
				setSelectedTask(null);
			}
		}
	};

	const columns: BackendTaskStatus[] = ['todo', 'in-progress', 'in-review', 'done'];

	return (
		<div className="space-y-6 pb-12">
			{/* Top Bar */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2">
						<div className="p-2 rounded-xl bg-primary/10 text-primary">
							<CheckSquare className="w-5 h-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">Tasks</h1>
					</div>
					<p className="text-xs text-muted-foreground">
						Sprint tasks board, status transitions, and member assignments.
					</p>
				</div>

				<div className="flex items-center gap-2.5">
					<OrgHeaderSwitcher />

					<div className="flex items-center bg-muted/60 p-0.5 rounded-lg border">
						<Button
							variant={viewMode === 'board' ? 'default' : 'ghost'}
							size="sm"
							onClick={() => setViewMode('board')}
							className="h-7 px-2.5 text-xs rounded-md"
						>
							<Grid className="w-3.5 h-3.5 mr-1" /> Board
						</Button>
						<Button
							variant={viewMode === 'table' ? 'default' : 'ghost'}
							size="sm"
							onClick={() => setViewMode('table')}
							className="h-7 px-2.5 text-xs rounded-md"
						>
							<List className="w-3.5 h-3.5 mr-1" /> List
						</Button>
					</div>

					<Button
						onClick={() => {
							if (projectStore.projects.length === 0) {
								alert('No project found! You must create a project first before creating tasks.');
								return;
							}
							setCreateModalOpen(true);
						}}
						className="gap-1.5 bg-primary hover:bg-primary/90 text-xs h-8 shadow-xs"
					>
						<Plus className="w-3.5 h-3.5" /> Create Task
					</Button>
				</div>
			</div>

			{/* Filter Bar */}
			<div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-2xs">
				<div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
					<ListFilter className="w-3.5 h-3.5 text-primary" /> Filter:
				</div>

				{/* Project Selector */}
				<Select
					value={projectStore.currentProjectId || selectedProjectId}
					onValueChange={(val) => {
						projectStore.selectProject(val);
						setSelectedProjectId(val);
					}}
				>
					<SelectTrigger className="h-8 text-xs w-48">
						<SelectValue placeholder="Select Project" />
					</SelectTrigger>
					<SelectContent>
						{projectStore.projects.map((p) => (
							<SelectItem key={p._id || p.id} value={p._id || p.id}>
								{p.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{/* Priority Filter */}
				<Select
					value={taskStore.filterPriority}
					onValueChange={(val) => taskStore.setFilterPriority(val)}
				>
					<SelectTrigger className="h-8 text-xs w-32">
						<SelectValue placeholder="Priority" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All Priorities</SelectItem>
						<SelectItem value="low">Low</SelectItem>
						<SelectItem value="medium">Medium</SelectItem>
						<SelectItem value="high">High</SelectItem>
						<SelectItem value="urgent">Urgent</SelectItem>
					</SelectContent>
				</Select>

				{/* Status Filter */}
				<Select
					value={taskStore.filterStatus}
					onValueChange={(val) => taskStore.setFilterStatus(val)}
				>
					<SelectTrigger className="h-8 text-xs w-36">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All Statuses</SelectItem>
						<SelectItem value="todo">TODO</SelectItem>
						<SelectItem value="in-progress">IN PROGRESS</SelectItem>
						<SelectItem value="in-review">IN REVIEW</SelectItem>
						<SelectItem value="done">DONE</SelectItem>
					</SelectContent>
				</Select>

				<span className="text-[11px] text-muted-foreground ml-auto">
					{taskStore.completedCount} of {taskStore.tasks.length} tasks completed ({taskStore.completionPercentage}%)
				</span>
			</div>

			{/* Gatekeeper Check: "No Project -> No Task" Empty State */}
			{projectStore.projects.length === 0 ? (
				<Card className="border-dashed p-12 text-center">
					<AlertCircle className="w-12 h-12 text-warning mx-auto mb-3" />
					<h3 className="font-bold text-foreground text-base">No Project Found</h3>
					<p className="text-xs text-muted-foreground mt-1.5 max-w-md mx-auto">
						Rule: <strong>No Project → No Task</strong>. Tasks exist inside a parent project container.
						Please create a project first before creating tasks.
					</p>
					<Button onClick={() => navigate('/projects')} className="mt-4 bg-primary text-xs shadow-xs">
						<FolderPlus className="w-4 h-4 mr-1.5" /> Go to Projects Page
					</Button>
				</Card>
			) : viewMode === 'board' ? (
				/* Board View */
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
					{columns.map((colStatus) => {
						const colTasks = taskStore.tasksByStatus[colStatus] || [];
						return (
							<div
								key={colStatus}
								className="flex flex-col rounded-2xl bg-muted/30 border border-border/80 p-3 min-h-[480px]"
							>
								{/* Column Header */}
								<div className="flex items-center justify-between px-2 py-1.5 mb-2">
									<div className="flex items-center gap-2">
										<span className="font-bold text-xs uppercase tracking-wider text-foreground">
											{colStatus.replace('-', ' ')}
										</span>
										<span className="w-5 h-5 rounded-full bg-card flex items-center justify-center text-[10px] font-bold border">
											{colTasks.length}
										</span>
									</div>
								</div>

								{/* Task Cards */}
								<div className="space-y-2.5 flex-1">
									{colTasks.map((task) => {
										const tId = task._id || task.id;
										const assigneeObj = typeof task.assigneeId === 'object' ? (task.assigneeId as any) : null;
										const assigneeName = assigneeObj?.name || 'Unassigned';

										return (
											<div
												key={tId}
												onClick={() => setSelectedTask(task)}
												className="p-3.5 bg-card hover:bg-card/90 rounded-xl border border-border/70 hover:border-primary/40 transition-all cursor-pointer shadow-2xs hover:shadow-xs space-y-2.5"
											>
												<div className="flex items-start justify-between gap-2">
													<h4 className="font-semibold text-xs text-foreground line-clamp-2">
														{task.title}
													</h4>
													<Badge
														variant={
															task.priority === 'urgent' || task.priority === 'high'
																? 'destructive'
																: 'secondary'
														}
														className="text-[9px] uppercase font-bold shrink-0"
													>
														{task.priority}
													</Badge>
												</div>

												{task.description && (
													<p className="text-[11px] text-muted-foreground line-clamp-2">
														{task.description}
													</p>
												)}

												<div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px] text-muted-foreground">
													<div className="flex items-center gap-1.5">
														<User className="w-3 h-3 text-primary" />
														<span className="truncate max-w-[100px]">{assigneeName}</span>
													</div>
													<span>
														{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
													</span>
												</div>

												{/* Quick Status Bar */}
												<div
													className="pt-1 flex items-center gap-1 text-[9px]"
													onClick={(e) => e.stopPropagation()}
												>
													{columns
														.filter((s) => s !== task.status)
														.map((next) => (
															<button
																key={next}
																type="button"
																onClick={() => handleStatusChange(tId, next)}
																className="px-1.5 py-0.5 rounded bg-muted hover:bg-primary hover:text-primary-foreground transition-colors font-semibold uppercase text-[8px]"
															>
																{next === 'in-progress' ? 'PROG' : next === 'in-review' ? 'REV' : next}
															</button>
														))}
												</div>
											</div>
										);
									})}

									{colTasks.length === 0 && (
										<div className="h-20 border border-dashed rounded-xl flex items-center justify-center text-xs text-muted-foreground/60">
											No tasks
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			) : (
				/* Table View */
				<Card>
					<CardContent className="p-0">
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse text-xs">
								<thead>
									<tr className="border-y border-border/80 bg-muted/40 text-muted-foreground font-semibold">
										<th className="py-2.5 px-4">Task</th>
										<th className="py-2.5 px-3">Status</th>
										<th className="py-2.5 px-3">Priority</th>
										<th className="py-2.5 px-3">Assignee</th>
										<th className="py-2.5 px-3">Due Date</th>
										<th className="py-2.5 px-4 text-right">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border/60">
									{taskStore.filteredTasks.map((task) => {
										const tId = task._id || task.id;
										const assigneeObj = typeof task.assigneeId === 'object' ? (task.assigneeId as any) : null;
										const assigneeName = assigneeObj?.name || 'Unassigned';

										return (
											<tr
												key={tId}
												className="hover:bg-muted/30 transition-colors cursor-pointer"
												onClick={() => setSelectedTask(task)}
											>
												<td className="py-3 px-4 font-semibold text-foreground max-w-xs truncate">
													{task.title}
												</td>
												<td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
													<Select
														value={task.status}
														onValueChange={(val) => handleStatusChange(tId, val as BackendTaskStatus)}
													>
														<SelectTrigger className="h-7 text-[11px] w-28 uppercase font-semibold">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="todo">TODO</SelectItem>
															<SelectItem value="in-progress">IN PROGRESS</SelectItem>
															<SelectItem value="in-review">IN REVIEW</SelectItem>
															<SelectItem value="done">DONE</SelectItem>
														</SelectContent>
													</Select>
												</td>
												<td className="py-3 px-3">
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
												</td>
												<td className="py-3 px-3 text-muted-foreground">{assigneeName}</td>
												<td className="py-3 px-3 text-muted-foreground">
													{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
												</td>
												<td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleDeleteTask(tId, task.title)}
														className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 rounded-md"
													>
														<Trash2 className="w-3.5 h-3.5" />
													</Button>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Create Task Modal */}
			<Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
				<DialogContent className="sm:max-w-[460px]">
					<DialogHeader>
						<DialogTitle className="text-base font-bold flex items-center gap-2">
							<CheckSquare className="w-4 h-4 text-primary" /> Create New Task
						</DialogTitle>
						<DialogDescription className="text-xs text-muted-foreground">
							Tasks exist inside projects. Assignee must be allocated to the selected project.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleCreateTask} className="space-y-3.5 py-2">
						{/* Step 1: Select Project */}
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Parent Project *</Label>
							<Select
								value={selectedProjectId}
								onValueChange={(val) => {
									setSelectedProjectId(val);
									setAssigneeId('');
								}}
							>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue placeholder="Select parent project" />
								</SelectTrigger>
								<SelectContent>
									{projectStore.projects.map((p) => (
										<SelectItem key={p._id || p.id} value={p._id || p.id}>
											{p.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Task Title */}
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Task Title *</Label>
							<Input
								placeholder="e.g. Implement webhook signature verification"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="h-9 text-xs"
								autoFocus
							/>
						</div>

						{/* Description */}
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Description</Label>
							<Textarea
								placeholder="Detailed instructions or specifications..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="text-xs resize-none h-16"
							/>
						</div>

						{/* Step 2: Assignee (strictly filtered to members of the selected project!) */}
						<div className="space-y-1">
							<Label className="text-xs font-semibold">Assignee (Project Member)</Label>
							<Select value={assigneeId} onValueChange={setAssigneeId}>
								<SelectTrigger className="h-9 text-xs">
									<SelectValue placeholder="Unassigned" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">Unassigned</SelectItem>
									{allowedAssignees.map((a) => (
										<SelectItem key={a.id} value={a.id}>
											{a.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Priority & Due Date */}
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1">
								<Label className="text-xs font-semibold">Priority</Label>
								<Select value={priority} onValueChange={(v) => setPriority(v as BackendTaskPriority)}>
									<SelectTrigger className="h-9 text-xs uppercase font-semibold">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">LOW</SelectItem>
										<SelectItem value="medium">MEDIUM</SelectItem>
										<SelectItem value="high">HIGH</SelectItem>
										<SelectItem value="urgent">URGENT</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-1">
								<Label className="text-xs font-semibold">Due Date</Label>
								<Input
									type="date"
									value={dueDate}
									onChange={(e) => setDueDate(e.target.value)}
									className="h-9 text-xs"
								/>
							</div>
						</div>

						<DialogFooter className="gap-2 pt-2">
							<Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
								Create Task
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Task Detail Modal */}
			<Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
				<DialogContent className="sm:max-w-[480px]">
					{selectedTask && (
						<div className="space-y-4">
							<DialogHeader>
								<div className="flex items-center gap-2 mb-1">
									<Badge
										variant={selectedTask.status === 'done' ? 'success' : 'secondary'}
										className="text-[10px] uppercase font-bold"
									>
										{selectedTask.status.replace('-', ' ')}
									</Badge>
									<Badge
										variant={
											selectedTask.priority === 'urgent' || selectedTask.priority === 'high'
												? 'destructive'
												: 'outline'
										}
										className="text-[10px] uppercase font-bold"
									>
										{selectedTask.priority}
									</Badge>
								</div>
								<DialogTitle className="text-base font-bold text-foreground">
									{selectedTask.title}
								</DialogTitle>
								<DialogDescription className="text-xs text-muted-foreground">
									Due: {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'None'}
								</DialogDescription>
							</DialogHeader>

							<p className="text-xs text-foreground/90 bg-muted/30 p-3 rounded-lg border">
								{selectedTask.description || 'No description provided.'}
							</p>

							{/* Status update buttons */}
							<div className="space-y-1.5">
								<Label className="text-xs font-semibold">Transition Status</Label>
								<div className="flex items-center gap-2">
									{columns.map((s) => (
										<Button
											key={s}
											type="button"
											variant={selectedTask.status === s ? 'default' : 'outline'}
											size="sm"
											onClick={() => handleStatusChange(selectedTask._id || selectedTask.id, s)}
											className="flex-1 text-xs uppercase h-8"
										>
											{s.replace('-', ' ')}
										</Button>
									))}
								</div>
							</div>

							<DialogFooter className="gap-2 pt-2 border-t">
								<Button
									variant="destructive"
									size="sm"
									onClick={() => handleDeleteTask(selectedTask._id || selectedTask.id, selectedTask.title)}
									className="mr-auto text-xs"
								>
									Delete Task
								</Button>
								<Button variant="outline" size="sm" onClick={() => setSelectedTask(null)}>
									Close
								</Button>
							</DialogFooter>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
});

export default TasksPage;
