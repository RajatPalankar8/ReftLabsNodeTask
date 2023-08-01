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
exports.resourceRouter = void 0;
const express_1 = require("express");
const resource_model_1 = require("../models/resource.model");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const resourceRouter = (0, express_1.Router)();
exports.resourceRouter = resourceRouter;
// Middleware for authentication
resourceRouter.use(auth_middleware_1.authenticateJWT);
// Create a new resource
resourceRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Your resource creation logic here
        const { name, description } = req.body;
        const resource = yield resource_model_1.Resource.create({ name, description });
        res.status(201).json(resource);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// Get all resources with pagination and sorting
resourceRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Your pagination and sorting logic here
        const { page, limit, sortBy } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = parseInt(limit, 10) || 10;
        const sortKey = sortBy || 'createdAt';
        const skip = (pageNumber - 1) * pageSize;
        const totalCount = yield resource_model_1.Resource.countDocuments();
        const resources = yield resource_model_1.Resource.find().sort("createdAt").skip(skip).limit(pageSize);
        res.json({
            total: totalCount,
            page: pageNumber,
            pageSize,
            data: resources,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// Update a resource
resourceRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Your resource update logic here
        const resourceId = req.params.id;
        const { name, description } = req.body;
        const resource = yield resource_model_1.Resource.findByIdAndUpdate(resourceId, { name, description }, { new: true });
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        res.json(resource);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// Delete a resource
resourceRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Your resource deletion logic here
        const resourceId = req.params.id;
        const resource = yield resource_model_1.Resource.findByIdAndDelete(resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        res.sendStatus(204);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}));
