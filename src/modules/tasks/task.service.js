const mongoose = require('mongoose');
const { taskRepository } = require('./task.repository');
const { projectRepository } = require('../projects/project.repository');

const VALID_STATUSES = ['todo', 'in-progress', 'in-review', 'done'];

class TaskService {
  constructor(
    taskRepo = taskRepository,
    projectRepo = projectRepository
  ) {
    this.taskRepo = taskRepo;
    this.projectRepo = projectRepo;
  }

  async createTask(reporterId, data) {
    const { title, description, projectId, assigneeId, type, priority, dueDate } = data;

    if (!title || !projectId) {
      const error = new Error('Task title and projectId are required');
      error.statusCode = 400;
      throw error;
    }

    // Verify project exists
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    const organizationId = project.organizationId?._id || project.organizationId;

    // If an assignee is selected, verify they are an allocated member of the project
    if (assigneeId) {
      const projectMemberIds = (project.members || []).map((m) => (m._id ? m._id.toString() : m.toString()));
      if (project.leadId) {
        projectMemberIds.push(project.leadId._id ? project.leadId._id.toString() : project.leadId.toString());
      }

      if (!projectMemberIds.includes(assigneeId.toString())) {
        const error = new Error('The assignee must be an allocated member of this project');
        error.statusCode = 400;
        throw error;
      }
    }

    return this.taskRepo.create({
      title,
      description,
      projectId: new mongoose.Types.ObjectId(projectId),
      organizationId: new mongoose.Types.ObjectId(organizationId),
      reporterId: new mongoose.Types.ObjectId(reporterId),
      assigneeId: assigneeId ? new mongoose.Types.ObjectId(assigneeId) : null,
      type: type || 'task',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
  }

  async getTaskById(id) {
    const task = await this.taskRepo.findById(id);
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    return task;
  }

  async getProjectTasks(projectId, filter = {}) {
    return this.taskRepo.findByProject(projectId, filter);
  }

  async getMyAssignedTasks(userId, status) {
    return this.taskRepo.findByAssignee(userId, status);
  }

  async updateTask(id, updateData) {
    const task = await this.taskRepo.findById(id);
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    // If changing assignee, verify new assignee belongs to the project
    if (updateData.assigneeId) {
      const project = await this.projectRepo.findById(task.projectId._id || task.projectId);
      if (project) {
        const projectMemberIds = (project.members || []).map((m) => (m._id ? m._id.toString() : m.toString()));
        if (project.leadId) {
          projectMemberIds.push(project.leadId._id ? project.leadId._id.toString() : project.leadId.toString());
        }
        if (!projectMemberIds.includes(updateData.assigneeId.toString())) {
          const error = new Error('The new assignee must be an allocated member of this project');
          error.statusCode = 400;
          throw error;
        }
      }
    }

    const updated = await this.taskRepo.update(id, updateData);
    return updated;
  }

  async updateTaskStatus(id, status) {
    if (!VALID_STATUSES.includes(status)) {
      const error = new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const updated = await this.taskRepo.updateStatus(id, status);
    if (!updated) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    return updated;
  }

  async assignTask(id, assigneeId) {
    const task = await this.taskRepo.findById(id);
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    if (assigneeId) {
      const project = await this.projectRepo.findById(task.projectId._id || task.projectId);
      if (project) {
        const projectMemberIds = (project.members || []).map((m) => (m._id ? m._id.toString() : m.toString()));
        if (project.leadId) {
          projectMemberIds.push(project.leadId._id ? project.leadId._id.toString() : project.leadId.toString());
        }
        if (!projectMemberIds.includes(assigneeId.toString())) {
          const error = new Error('Assignee must be an allocated member of this project');
          error.statusCode = 400;
          throw error;
        }
      }
    }

    return this.taskRepo.assignTask(id, assigneeId);
  }

  async deleteTask(id) {
    const deleted = await this.taskRepo.delete(id);
    if (!deleted) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }
    return { message: 'Task deleted successfully' };
  }
}

module.exports = {
  TaskService,
  taskService: new TaskService(),
};
