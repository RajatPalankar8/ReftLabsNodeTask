import { Router, Request, Response } from 'express';
import { Todo } from '../models/Todo.model';
import { authenticateJWT } from '../middlewares/auth.middleware';

const TodoRouter = Router();

// Middleware for authentication
TodoRouter.use(authenticateJWT);

// Create a new Todo
TodoRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Your Todo creation logic here
    const { todo, description } = req.body;
    const todoRes = await Todo.create({ todo, description });
    res.status(201).json(todoRes);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all Todos with pagination and sorting
TodoRouter.get('/', async (req: Request, res: Response) => {
  try {
    // Your pagination and sorting logic here
    const { page, limit, sortBy } = req.query;
    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const sortKey = sortBy || 'createdAt';
    const skip = (pageNumber - 1) * pageSize;

    const totalCount = await Todo.countDocuments();
    const Todos = await Todo.find().sort("createdAt").skip(skip).limit(pageSize);

    res.json({
      total: totalCount,
      page: pageNumber,
      pageSize,
      data: Todos,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update a Todo
TodoRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    // Your Todo update logic here
    const TodoId = req.params.id;
    const { name, description } = req.body;

    const todoRes = await Todo.findByIdAndUpdate(TodoId, { name, description }, { new: true });

    if (!todoRes) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json(Todo);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a Todo
TodoRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    // Your Todo deletion logic here
    const TodoId = req.params.id;

    const todoRes = await Todo.findByIdAndDelete(TodoId);

    if (!todoRes) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export { TodoRouter };
