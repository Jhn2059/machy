import { Request, Response, NextFunction } from 'express';
import { productModel } from '../models/product.model';
import { badRequest, notFound, conflict } from '../utils/errors';
import { z } from 'zod';

const createSchema = z.object({
  barcode: z.string().min(1, 'El código de barras es requerido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  categoryId: z.string().uuid('Categoría inválida'),
  unit: z.string().optional().default('UNIDAD'),
  costPrice: z.number().min(0, 'El precio de compra debe ser mayor o igual a 0'),
  salePrice: z.number().min(0.01, 'El precio de venta debe ser mayor a 0'),
  stock: z.number().int().min(0).optional().default(0),
  minStock: z.number().int().min(0).optional().default(5),
  supplierId: z.string().uuid().optional(),
  image: z.string().optional(),
});

const updateSchema = z.object({
  barcode: z.string().min(1).optional(),
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  unit: z.string().optional(),
  costPrice: z.number().min(0).optional(),
  salePrice: z.number().min(0.01).optional(),
  stock: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  supplierId: z.string().uuid().optional().nullable(),
  image: z.string().optional(),
});

export const productController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, categoryId, barcode, status, page, limit } = req.query;
      const result = await productModel.findAll({
        name: name as string,
        categoryId: categoryId as string,
        barcode: barcode as string,
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
      const product = await productModel.findById(req.params.id);
      if (!product) throw notFound('Producto no encontrado');
      res.json(product);
    } catch (error) {
      next(error);
    }
  },

  async getByBarcode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productModel.findByBarcode(req.params.barcode);
      if (!product) throw notFound('Producto no encontrado con ese código de barras');
      res.json(product);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createSchema.parse(req.body);

      const barcodeExists = await productModel.existsByBarcode(data.barcode);
      if (barcodeExists) throw conflict('Ya existe un producto con ese código de barras');

      const product = await productModel.create(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) throw badRequest(error.errors[0].message);
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateSchema.parse(req.body);
      if (Object.keys(data).length === 0) throw badRequest('Debes proporcionar al menos un campo');

      const existing = await productModel.findById(req.params.id);
      if (!existing) throw notFound('Producto no encontrado');

      if (data.barcode) {
        const barcodeExists = await productModel.existsByBarcode(data.barcode, req.params.id);
        if (barcodeExists) throw conflict('Ya existe un producto con ese código de barras');
      }

      if (data.salePrice !== undefined && data.salePrice !== Number(existing.salePrice)) {
        await productModel.createPriceHistory({
          productId: req.params.id,
          oldPrice: Number(existing.salePrice),
          newPrice: data.salePrice,
          userId: req.user!.userId,
        });
      }

      const product = await productModel.update(req.params.id, data);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) throw badRequest(error.errors[0].message);
      next(error);
    }
  },

  async discontinue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const existing = await productModel.findById(req.params.id);
      if (!existing) throw notFound('Producto no encontrado');

      const product = await productModel.discontinue(req.params.id);
      res.json(product);
    } catch (error) {
      next(error);
    }
  },

  async lowStock(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productModel.getLowStock();
      res.json(products);
    } catch (error) {
      next(error);
    }
  },

  async stockSummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await productModel.getStockSummary();
      res.json(summary);
    } catch (error) {
      next(error);
    }
  },
};
