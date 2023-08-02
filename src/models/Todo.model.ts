import { Schema, model } from 'mongoose';

const todoSchema = new Schema({
  // Define your resource schema here
  // For example:
  todo: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Todo = model('ToDoTask', todoSchema);
