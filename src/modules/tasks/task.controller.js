const { taskService } = require('./task.service');

class TaskController {
  constructor(taskSvc = taskService) {
    this.taskSvc = taskSvc;
  }

  createTask = async (req, res, next) => {
    try {
      const reporterId = req.user?.userId;
      if (!reporterId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const task = await this.taskSvc.createTask(reporterId, req.body);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  };

  getTaskById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const task = await this.taskSvc.getTaskById(id);
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  };

  getProjectTasks = async (req, res, next) => {
    try {
      const { projectId } = req.params;
      const { status, priority, type, assigneeId } = req.query;

      const tasks = await this.taskSvc.getProjectTasks(projectId, {
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

  getMyAssignedTasks = async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { status } = req.query;
      const tasks = await this.taskSvc.getMyAssignedTasks(userId, status);
      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await this.taskSvc.updateTask(id, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  updateTaskStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'status is required' });
      }

      const updated = await this.taskSvc.updateTaskStatus(id, status);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  assignTask = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { assigneeId } = req.body;

      const updated = await this.taskSvc.assignTask(id, assigneeId);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await this.taskSvc.deleteTask(id);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  TaskController,
  taskController: new TaskController(),
};
