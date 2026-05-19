import { Request, Response, NextFunction } from 'express';
import { configModel } from '../models/config.model';
import { badRequest } from '../utils/errors';
import { z } from 'zod';

const updateSchema = z.object({
  configs: z
    .array(
      z.object({
        key: z.string().min(1, 'La clave es requerida'),
        value: z.string(),
      }),
    )
    .min(1, 'Debes enviar al menos una configuración'),
});

export const configController = {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const configs = await configModel.getAll();
      res.json(configs);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { configs } = updateSchema.parse(req.body);
      const updated = await configModel.upsertConfigs(configs);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) throw badRequest(error.errors[0].message);
      next(error);
    }
  },
};
