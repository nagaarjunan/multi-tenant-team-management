import { makeAutoObservable, runInAction } from 'mobx';
import taskService, {
	type CreateTaskReq,
	type UpdateTaskReq,
	type TaskFilterParams,
} from '@/api/services/taskService';
import type { BackendTask, BackendTaskStatus } from '@/types/backend';
import type { RootStore } from '../RootStore';
import { toast } from 'sonner';

export class TaskStore {
	rootStore: RootStore;
	tasks: BackendTask[] = [];
	myTasks: BackendTask[] = [];
	selectedTaskId: string | null = null;
	filterStatus: string = 'ALL';
	filterPriority: string = 'ALL';
	isLoading = false;
	error: string | null = null;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this, { rootStore: false });
	}

	get selectedTask(): BackendTask | null {
		if (!this.selectedTaskId) return null;
		return (
			this.tasks.find((t) => (t._id || t.id) === this.selectedTaskId) ||
			this.myTasks.find((t) => (t._id || t.id) === this.selectedTaskId) ||
			null
		);
	}

	get filteredTasks(): BackendTask[] {
		return this.tasks.filter((t) => {
			if (this.filterStatus !== 'ALL' && t.status !== this.filterStatus) return false;
			if (this.filterPriority !== 'ALL' && t.priority !== this.filterPriority) return false;
			return true;
		});
	}

	get tasksByStatus(): Record<BackendTaskStatus, BackendTask[]> {
		const grouped: Record<BackendTaskStatus, BackendTask[]> = {
			todo: [],
			'in-progress': [],
			'in-review': [],
			done: [],
		};
		for (const t of this.filteredTasks) {
			if (grouped[t.status]) {
				grouped[t.status].push(t);
			} else {
				grouped.todo.push(t);
			}
		}
		return grouped;
	}

	get completedCount(): number {
		return this.tasks.filter((t) => t.status === 'done').length;
	}

	get completionPercentage(): number {
		if (this.tasks.length === 0) return 0;
		return Math.round((this.completedCount / this.tasks.length) * 100);
	}

	setSelectedTaskId(id: string | null) {
		this.selectedTaskId = id;
	}

	setFilterStatus(status: string) {
		this.filterStatus = status;
	}

	setFilterPriority(priority: string) {
		this.filterPriority = priority;
	}

	async fetchProjectTasks(projectId: string, params?: TaskFilterParams) {
		if (!projectId) return [];
		this.isLoading = true;
		try {
			const tasks = await taskService.getProjectTasks(projectId, params);
			runInAction(() => {
				this.tasks = Array.isArray(tasks) ? tasks : [];
				this.isLoading = false;
			});
			return this.tasks;
		} catch (err: any) {
			runInAction(() => {
				this.error = err.message || 'Failed to fetch tasks';
				this.isLoading = false;
			});
			return [];
		}
	}

	async fetchMyTasks(status?: string) {
		try {
			const my = await taskService.getMyAssignedTasks(status);
			runInAction(() => {
				this.myTasks = Array.isArray(my) ? my : [];
			});
			return this.myTasks;
		} catch {
			return [];
		}
	}

	async createTask(data: CreateTaskReq) {
		try {
			const created = await taskService.createTask(data);
			runInAction(() => {
				this.tasks.unshift(created);
			});
			toast.success(`Task "${created.title}" created!`);
			return created;
		} catch (err: any) {
			toast.error(err.message || 'Failed to create task');
			throw err;
		}
	}

	async updateTask(id: string, data: UpdateTaskReq) {
		try {
			const updated = await taskService.updateTask(id, data);
			runInAction(() => {
				const idx = this.tasks.findIndex((t) => (t._id || t.id) === id);
				if (idx !== -1) this.tasks[idx] = updated;
				const myIdx = this.myTasks.findIndex((t) => (t._id || t.id) === id);
				if (myIdx !== -1) this.myTasks[myIdx] = updated;
			});
			toast.success('Task updated.');
			return updated;
		} catch (err: any) {
			toast.error(err.message || 'Failed to update task');
			throw err;
		}
	}

	async updateTaskStatus(id: string, status: BackendTaskStatus) {
		try {
			const updated = await taskService.updateTaskStatus(id, status);
			runInAction(() => {
				const idx = this.tasks.findIndex((t) => (t._id || t.id) === id);
				if (idx !== -1) this.tasks[idx] = updated;
				const myIdx = this.myTasks.findIndex((t) => (t._id || t.id) === id);
				if (myIdx !== -1) this.myTasks[myIdx] = updated;
			});
			toast.success(`Task moved to ${status}`);
			return updated;
		} catch (err: any) {
			toast.error(err.message || 'Failed to update status');
			throw err;
		}
	}

	async assignTask(id: string, assigneeId: string | null) {
		try {
			const updated = await taskService.assignTask(id, assigneeId);
			runInAction(() => {
				const idx = this.tasks.findIndex((t) => (t._id || t.id) === id);
				if (idx !== -1) this.tasks[idx] = updated;
			});
			toast.success('Task assignment updated.');
			return updated;
		} catch (err: any) {
			toast.error(err.message || 'Failed to assign task');
			throw err;
		}
	}

	async deleteTask(id: string) {
		try {
			await taskService.deleteTask(id);
			runInAction(() => {
				this.tasks = this.tasks.filter((t) => (t._id || t.id) !== id);
				this.myTasks = this.myTasks.filter((t) => (t._id || t.id) !== id);
				if (this.selectedTaskId === id) this.selectedTaskId = null;
			});
			toast.success('Task deleted.');
		} catch (err: any) {
			toast.error(err.message || 'Failed to delete task');
			throw err;
		}
	}
}
