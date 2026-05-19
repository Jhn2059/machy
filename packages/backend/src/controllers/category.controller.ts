import { Request, Response, NextFunction } from 'express';
import { categoryModel } from '../models/category.model';
import { badRequest, notFound, conflict } from '../utils/errors';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  active: z.boolean().optional(),
});

export const categoryController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryModel.findAll();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name } = createSchema.parse(req.body);
      const category = await categoryModel.create(name);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) throw badRequest(error.errors[0].message);
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateSchema.parse(req.body);
      if (Object.keys(data).length === 0) throw badRequest('Debes proporcionar al menos un campo');

      const existing = await categoryModel.findById(req.params.id);
      if (!existing) throw notFound('Categoría no encontrada');

      const category = await categoryModel.update(req.params.id, data);
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) throw badRequest(error.errors[0].message);
      next(error);
    }
  },
};
