const taskService = require('./task.service');

const createTask = async (req, res, next) => {
  try {
    const reporterId = req.user?.userId;
    if (!reporterId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const task = await taskService.createTask(reporterId, req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, priority, type, assigneeId } = req.query;

    const tasks = await taskService.getProjectTasks(projectId, {
      status,
      priority,
      type,
      assigneeId,
    });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

const getMyAssignedTasks = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { status } = req.query;
    const tasks = await taskService.getMyAssignedTasks(userId, status);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const updated = await taskService.updateTask(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    const updated = await taskService.updateTaskStatus(req.params.id, status);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const assignTask = async (req, res, next) => {
  try {
    const { assigneeId } = req.body;
    const updated = await taskService.assignTask(req.params.id, assigneeId);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
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
