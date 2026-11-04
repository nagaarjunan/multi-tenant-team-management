const { Router } = require('express');
const taskController = require('./task.controller');
const authenticate = require('../../middleware/authenticate');

const router = Router();

router.use(authenticate);

// Create task
router.post('/', taskController.createTask);

// View assigned tasks
router.get('/my', taskController.getMyAssignedTasks);

// View tasks in a project
router.get('/project/:projectId', taskController.getProjectTasks);

// Single task details and updates
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.patch('/:id/status', taskController.updateTaskStatus);
router.patch('/:id/assign', taskController.assignTask);
router.delete('/:id', taskController.deleteTask);

module.exports = {
  taskRoutes: router,
};
