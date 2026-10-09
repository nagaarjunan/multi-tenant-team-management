const { Router } = require('express');
const { taskController } = require('./task.controller');
const authenticate = require('../../middleware/authenticate');

const router = Router();

router.use(authenticate);

// Create task in a project
router.post('/', taskController.createTask);

// Get my assigned tasks across projects
router.get('/my', taskController.getMyAssignedTasks);

// Get tasks belonging to a specific project (with optional query filters: ?status=todo&priority=high)
router.get('/project/:projectId', taskController.getProjectTasks);

// Get task details by ID
router.get('/:id', taskController.getTaskById);

// Update full task details
router.put('/:id', taskController.updateTask);

// Quick status change: todo -> in-progress -> in-review -> done
router.patch('/:id/status', taskController.updateTaskStatus);

// Quick assign/reassign to another project member
router.patch('/:id/assign', taskController.assignTask);

// Delete task
router.delete('/:id', taskController.deleteTask);

module.exports = {
  taskRoutes: router,
};
