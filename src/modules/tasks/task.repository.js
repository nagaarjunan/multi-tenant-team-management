const mongoose = require('mongoose');
const { TaskModel } = require('./task.model');

class TaskRepository {
  async findById(id) {
    return TaskModel.findById(id)
      .populate('projectId', 'name status leadId')
      .populate('assigneeId', 'name email role')
      .populate('reporterId', 'name email role')
      .exec();
  }

  async findByProject(projectId, filter = {}) {
    const query = { projectId: new mongoose.Types.ObjectId(projectId) };

    if (filter.status) query.status = filter.status;
    if (filter.priority) query.priority = filter.priority;
    if (filter.type) query.type = filter.type;
    if (filter.assigneeId) query.assigneeId = new mongoose.Types.ObjectId(filter.assigneeId);

    return TaskModel.find(query)
      .populate('assigneeId', 'name email')
      .populate('reporterId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByAssignee(assigneeId, status) {
    const query = { assigneeId: new mongoose.Types.ObjectId(assigneeId) };
    if (status) query.status = status;

    return TaskModel.find(query)
      .populate('projectId', 'name status')
      .populate('reporterId', 'name email')
      .sort({ dueDate: 1, createdAt: -1 })
      .exec();
  }

  async create(taskData) {
    const task = new TaskModel(taskData);
    return task.save();
  }

  async update(id, updateData) {
    return TaskModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('assigneeId', 'name email')
      .populate('reporterId', 'name email')
      .exec();
  }

  async updateStatus(id, status) {
    return TaskModel.findByIdAndUpdate(id, { status }, { new: true })
      .populate('assigneeId', 'name email')
      .exec();
  }

  async assignTask(id, assigneeId) {
    return TaskModel.findByIdAndUpdate(
      id,
      { assigneeId: assigneeId ? new mongoose.Types.ObjectId(assigneeId) : null },
      { new: true }
    )
      .populate('assigneeId', 'name email')
      .exec();
  }

  async delete(id) {
    return TaskModel.findByIdAndDelete(id).exec();
  }
}

module.exports = {
  TaskRepository,
  taskRepository: new TaskRepository(),
};
