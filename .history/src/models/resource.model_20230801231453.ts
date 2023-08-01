import { Schema, model } from 'mongoose';

const resourceSchema = new Schema({
  // Define your resource schema here
  // For example:
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Resource = model('Resource', resourceSchema);
