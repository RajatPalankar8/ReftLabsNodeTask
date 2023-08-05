"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoRouter = void 0;
const express_1 = require("express");
const Todo_model_1 = require("../models/Todo.model");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const TodoRouter = (0, express_1.Router)();
exports.TodoRouter = TodoRouter;
// Middleware for authentication
TodoRouter.use(auth_middleware_1.authenticateJWT);
// Create a new Todo
TodoRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Your Todo creation logic here
        const { todo, description } = req.body;
        const todoRes = yield Todo_model_1.Todo.create({ todo, description });
        res.status(201).json(todoRes);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// Get all Todos with pagination and sorting
TodoRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Your pagination and sorting logic here
        const { page, limit, sortBy } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 10;
        const sortKey = sortBy || 'createdAt';
        const skip = (pageNumber - 1) * pageSize;
        const totalCount = yield Todo_model_1.Todo.countDocuments();
        const Todos = yield Todo_model_1.Todo.find().sort("createdAt").skip(skip).limit(pageSize);
        res.json({
            total: totalCount,
            page: pageNumber,
            pageSize,
            data: Todos,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// Update a Todo
TodoRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Your Todo update logic here
        const TodoId = req.params.id;
        const { todo, description } = req.body;
        const todoRes = yield Todo_model_1.Todo.findByIdAndUpdate(TodoId, { todo, description }, { new: true });
        if (!todoRes) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json({ todoRes });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// Delete a Todo
TodoRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Your Todo deletion logic here
        const TodoId = req.params.id;
        const todoRes = yield Todo_model_1.Todo.findByIdAndDelete(TodoId);
        if (!todoRes) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json({ success: "record deleted" });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
