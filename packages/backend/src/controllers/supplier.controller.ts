import { Request, Response, NextFunction } from 'express';
import { supplierModel } from '../models/supplier.model';
import { badRequest, notFound, conflict } from '../utils/errors';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  ruc: z.string().optional(),
  contact: z.string().optional(),
  phone: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  ruc: z.string().optional(),
  contact: z.string().optional(),
  phone: z.string().optional(),
  active: z.boolean().optional(),
});

export const supplierController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const suppliers = await supplierModel.findAll();
      res.json(suppliers);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createSchema.parse(req.body);
      const supplier = await supplierModel.create(data);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) throw badRequest(error.errors[0].message);
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateSchema.parse(req.body);
      if (Object.keys(data).length === 0) throw badRequest('Debes proporcionar al menos un campo');

      const existing = await supplierModel.findById(req.params.id);
      if (!existing) throw notFound('Proveedor no encontrado');

      const supplier = await supplierModel.update(req.params.id, data);
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) throw badRequest(error.errors[0].message);
      next(error);
    }
  },
};
