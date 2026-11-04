const { TaskModel } = require('./task.model');
const { ProjectModel } = require('../projects/project.model');
const AppError = require('../../utils/AppError');

const VALID_STATUSES = ['todo', 'in-progress', 'in-review', 'done'];

// Helper to get allowed assignees from a project (members + lead)
const getProjectMemberIdStrings = (project) => {
  const ids = (project.members || []).map((m) => (m._id ? m._id.toString() : m.toString()));
  if (project.leadId) {
    ids.push(project.leadId._id ? project.leadId._id.toString() : project.leadId.toString());
  }
  return ids;
};

const createTask = async (reporterId, data) => {
  const { title, description, projectId, assigneeId, type, priority, dueDate } = data;

  if (!title || !projectId) {
    throw AppError.badRequest('Task title and projectId are required');
  }

  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw AppError.notFound('Project not found');
  }

  // If assignee is provided, verify they are part of the project
  if (assigneeId) {
    const projectMemberIds = getProjectMemberIdStrings(project);
    if (!projectMemberIds.includes(assigneeId.toString())) {
      throw AppError.badRequest('The assignee must be an allocated member of this project');
    }
  }

  return TaskModel.create({
    title,
    description,
    projectId,
    organizationId: project.organizationId,
    reporterId,
    assigneeId: assigneeId || null,
    type: type || 'task',
    priority: priority || 'medium',
    dueDate: dueDate ? new Date(dueDate) : undefined,
  });
};

const getTaskById = async (id) => {
  const task = await TaskModel.findById(id)
    .populate('projectId', 'name status leadId')
    .populate('assigneeId', 'name email role')
    .populate('reporterId', 'name email role');

  if (!task) {
    throw AppError.notFound('Task not found');
  }
  return task;
};

const getProjectTasks = async (projectId, filter = {}) => {
  const query = { projectId };

  if (filter.status) query.status = filter.status;
  if (filter.priority) query.priority = filter.priority;
  if (filter.type) query.type = filter.type;
  if (filter.assigneeId) query.assigneeId = filter.assigneeId;

  return TaskModel.find(query)
    .populate('assigneeId', 'name email')
    .populate('reporterId', 'name email')
    .sort({ createdAt: -1 });
};

const getMyAssignedTasks = async (userId, status) => {
  const query = { assigneeId: userId };
  if (status) query.status = status;

  return TaskModel.find(query)
    .populate('projectId', 'name status')
    .populate('reporterId', 'name email')
    .sort({ dueDate: 1, createdAt: -1 });
};

const updateTask = async (id, updateData) => {
  const task = await TaskModel.findById(id);
  if (!task) {
    throw AppError.notFound('Task not found');
  }

  if (updateData.assigneeId) {
    const project = await ProjectModel.findById(task.projectId);
    if (project) {
      const projectMemberIds = getProjectMemberIdStrings(project);
      if (!projectMemberIds.includes(updateData.assigneeId.toString())) {
        throw AppError.badRequest('The new assignee must be an allocated member of this project');
      }
    }
  }

  return TaskModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('assigneeId', 'name email')
    .populate('reporterId', 'name email');
};

const updateTaskStatus = async (id, status) => {
  if (!VALID_STATUSES.includes(status)) {
    throw AppError.badRequest(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const updated = await TaskModel.findByIdAndUpdate(id, { status }, { new: true })
    .populate('assigneeId', 'name email');

  if (!updated) {
    throw AppError.notFound('Task not found');
  }
  return updated;
};

const assignTask = async (id, assigneeId) => {
  const task = await TaskModel.findById(id);
  if (!task) {
    throw AppError.notFound('Task not found');
  }

  if (assigneeId) {
    const project = await ProjectModel.findById(task.projectId);
    if (project) {
      const projectMemberIds = getProjectMemberIdStrings(project);
      if (!projectMemberIds.includes(assigneeId.toString())) {
        throw AppError.badRequest('Assignee must be an allocated member of this project');
      }
    }
  }

  return TaskModel.findByIdAndUpdate(
    id,
    { assigneeId: assigneeId || null },
    { new: true }
  ).populate('assigneeId', 'name email');
};

const deleteTask = async (id) => {
  const deleted = await TaskModel.findByIdAndDelete(id);
  if (!deleted) {
    throw AppError.notFound('Task not found');
  }
  return { message: 'Task deleted successfully' };
};

module.exports = {
  createTask,
  getTaskById,
  getProjectTasks,
  getMyAssignedTasks,
  updateTask,
  updateTaskStatus,
  assignTask,
  deleteTask,
};
