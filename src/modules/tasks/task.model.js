const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['feature', 'bug', 'task'],
      default: 'task',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'in-review', 'done'],
      default: 'todo',
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assigneeId: 1, status: 1 });

const TaskModel = mongoose.model('Task', taskSchema);

module.exports = {
  TaskModel,
};
