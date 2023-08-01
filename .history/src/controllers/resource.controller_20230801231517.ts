import { Router, Request, Response } from 'express';
import { Resource } from '../models/resource.model';
import { authenticateJWT } from '../middlewares/auth.middleware';

const resourceRouter = Router();

// Middleware for authentication
resourceRouter.use(authenticateJWT);

// Create a new resource
resourceRouter.post('/', async (req: Request, res: Response) => {
  try {
    // Your resource creation logic here
    const { name, description } = req.body;
    const resource = await Resource.create({ name, description });
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all resources with pagination and sorting
resourceRouter.get('/', async (req: Request, res: Response) => {
  try {
    // Your pagination and sorting logic here
    const { page, limit, sortBy } = req.query;
    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const sortKey = sortBy || 'createdAt';
    const skip = (pageNumber - 1) * pageSize;

    const totalCount = await Resource.countDocuments();
    const resources = await Resource.find().sort(sortKey).skip(skip).limit(pageSize);

    res.json({
      total: totalCount,
      page: pageNumber,
      pageSize,
      data: resources,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update a resource
resourceRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    // Your resource update logic here
    const resourceId = req.params.id;
    const { name, description } = req.body;

    const resource = await Resource.findByIdAndUpdate(resourceId, { name, description }, { new: true });

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a resource
resourceRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    // Your resource deletion logic here
    const resourceId = req.params.id;

    const resource = await Resource.findByIdAndDelete(resourceId);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export { resourceRouter };
