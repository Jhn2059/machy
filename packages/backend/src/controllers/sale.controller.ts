import { Request, Response, NextFunction } from 'express';
import { saleModel } from '../models/sale.model';
import { badRequest, notFound, unauthorized, forbidden } from '../utils/errors';
import { generateBoletaPDF } from '../utils/pdf';
import { z } from 'zod';

const createSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid('ID de producto inválido'),
        quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
      }),
    )
    .min(1, 'Debe incluir al menos un producto'),
  discount: z.number().min(0).optional().default(0),
});

const voidSchema = z.object({
  reason: z.string().min(5, 'La justificación debe tener al menos 5 caracteres'),
});

export const saleController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createSchema.parse(req.body);

      const sale = await saleModel.createSale({
        userId: req.user!.userId,
        items: data.items,
        discount: data.discount,
      });

      res.status(201).json(sale);
    } catch (error: any) {
      if (error instanceof z.ZodError) throw badRequest(error.errors[0].message);
      if (error.message?.includes('Stock insuficiente') || error.message?.includes('no está disponible')) {
        throw badRequest(error.message);
      }
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, startDate, endDate, status, page, limit } = req.query;

      let filterUserId = userId as string;
      if (req.user!.role === 'SELLER') {
        filterUserId = req.user!.userId;
      }

      const result = await saleModel.findAll({
        userId: filterUserId,
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sale = await saleModel.findById(req.params.id);
      if (!sale) throw notFound('Venta no encontrada');

      if (req.user!.role === 'SELLER' && sale.userId !== req.user!.userId) {
        throw forbidden('No puedes ver ventas de otros vendedores');
      }

      res.json(sale);
    } catch (error) {
      next(error);
    }
  },

  async voidSale(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reason } = voidSchema.parse(req.body);

      const sale = await saleModel.voidSale(req.params.id, reason);
      res.json(sale);
    } catch (error: any) {
      if (error instanceof z.ZodError) throw badRequest(error.errors[0].message);
      if (error.message) throw badRequest(error.message);
      next(error);
    }
  },

  async getBoleta(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sale = await saleModel.findById(req.params.id);
      if (!sale) throw notFound('Venta no encontrada');

      const businessName = (await saleModel.getSystemConfig('business_name')) || 'Librería Machy';
      const businessRuc = (await saleModel.getSystemConfig('business_ruc')) || '10000000001';
      const businessAddress =
        (await saleModel.getSystemConfig('business_address')) || 'Av. Principal 123, Lima';
      const businessPhone = (await saleModel.getSystemConfig('business_phone')) || '01-1234567';

      const pdf = await generateBoletaPDF(sale as any, {
        name: businessName,
        ruc: businessRuc,
        address: businessAddress,
        phone: businessPhone,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="boleta-${String(sale.correlative).padStart(6, '0')}.pdf"`,
      );
      res.send(pdf);
    } catch (error) {
      next(error);
    }
  },

  async dailyStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const stats = await saleModel.getDailyStats(new Date(dateStr));
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },
};
