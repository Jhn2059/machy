import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export const productModel = {
  async findAll(filters: {
    name?: string;
    categoryId?: string;
    barcode?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.ProductWhereInput = {};

    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.barcode) {
      where.barcode = { contains: filters.barcode };
    }
    if (filters.status) {
      where.status = filters.status as any;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page, totalPages: Math.ceil(total / limit) };
  },

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });
  },

  async findByBarcode(barcode: string) {
    return prisma.product.findUnique({
      where: { barcode },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });
  },

  async existsByBarcode(barcode: string, excludeId?: string) {
    const where: any = { barcode };
    if (excludeId) where.id = { not: excludeId };
    const product = await prisma.product.findFirst({ where });
    return !!product;
  },

  async create(data: {
    barcode: string;
    name: string;
    description?: string;
    categoryId: string;
    unit?: string;
    costPrice: number;
    salePrice: number;
    stock?: number;
    minStock?: number;
    supplierId?: string;
    image?: string;
  }) {
    return prisma.product.create({
      data: {
        barcode: data.barcode,
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        unit: data.unit || 'UNIDAD',
        costPrice: new Prisma.Decimal(data.costPrice),
        salePrice: new Prisma.Decimal(data.salePrice),
        stock: data.stock || 0,
        minStock: data.minStock || 5,
        supplierId: data.supplierId,
        image: data.image,
      },
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });
  },

  async update(
    id: string,
    data: {
      barcode?: string;
      name?: string;
      description?: string;
      categoryId?: string;
      unit?: string;
      costPrice?: number;
      salePrice?: number;
      stock?: number;
      minStock?: number;
      supplierId?: string | null;
      image?: string;
    },
  ) {
    const updateData: any = { ...data };
    if (data.costPrice !== undefined) updateData.costPrice = new Prisma.Decimal(data.costPrice);
    if (data.salePrice !== undefined) updateData.salePrice = new Prisma.Decimal(data.salePrice);

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });
  },

  async discontinue(id: string) {
    return prisma.product.update({
      where: { id },
      data: { status: 'DISCONTINUED' },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  },

  async getLowStock() {
    return prisma.product.findMany({
      where: {
        stock: { lte: prisma.product.fields.minStock },
        status: 'ACTIVE',
      },
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { stock: 'asc' },
    });
  },

  async getStockSummary() {
    const [total, active, discontinued, lowStock] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count({ where: { status: 'DISCONTINUED' } }),
      prisma.product.count({
        where: {
          stock: { lte: prisma.product.fields.minStock },
          status: 'ACTIVE',
        },
      }),
    ]);

    return { total, active, discontinued, lowStock };
  },

  async updateStock(id: string, quantity: number) {
    return prisma.product.update({
      where: { id },
      data: { stock: { increment: quantity } },
    });
  },

  async createPriceHistory(data: {
    productId: string;
    oldPrice: number;
    newPrice: number;
    userId: string;
  }) {
    return prisma.priceHistory.create({
      data: {
        productId: data.productId,
        oldPrice: new Prisma.Decimal(data.oldPrice),
        newPrice: new Prisma.Decimal(data.newPrice),
        userId: data.userId,
      },
    });
  },
};
