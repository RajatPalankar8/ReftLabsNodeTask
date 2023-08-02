"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Todo = void 0;
const mongoose_1 = require("mongoose");
const todoSchema = new mongoose_1.Schema({
    // Define your resource schema here
    // For example:
    todo: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
});
exports.Todo = (0, mongoose_1.model)('ToDoTask', todoSchema);
