import prisma from '../config/database';
import { Prisma } from '@prisma/client';
import { IGV_RATE } from '../config/constants';

interface SaleItem {
  productId: string;
  quantity: number;
}

interface CreateSaleData {
  userId: string;
  items: SaleItem[];
  discount?: number;
}

export const saleModel = {
  async createSale(data: CreateSaleData) {
    return prisma.$transaction(async (tx) => {
      let subtotal = new Prisma.Decimal(0);

      const detailsData: Array<{
        productId: string;
        quantity: number;
        unitPrice: Prisma.Decimal;
        subtotal: Prisma.Decimal;
      }> = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, salePrice: true, stock: true, status: true },
        });

        if (!product) {
          throw new Error(`Producto no encontrado: ${item.productId}`);
        }

        if (product.status !== 'ACTIVE') {
          throw new Error(`El producto "${item.productId}" no está disponible para venta`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente. Disponible: ${product.stock}, solicitado: ${item.quantity}`,
          );
        }

        const unitPrice = product.salePrice;
        const itemSubtotal = unitPrice.mul(item.quantity);

        subtotal = subtotal.add(itemSubtotal);

        detailsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          subtotal: itemSubtotal,
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const igv = subtotal.mul(IGV_RATE);
      const discountAmount = data.discount
        ? new Prisma.Decimal(data.discount)
        : new Prisma.Decimal(0);
      const total = subtotal.add(igv).sub(discountAmount);

      const sale = await tx.sale.create({
        data: {
          userId: data.userId,
          subtotal,
          igv,
          discount: discountAmount,
          total: total.greaterThan(0) ? total : new Prisma.Decimal(0),
          status: 'CONFIRMED',
          details: {
            create: detailsData.map((d) => ({
              productId: d.productId,
              quantity: d.quantity,
              unitPrice: d.unitPrice,
              subtotal: d.subtotal,
            })),
          },
        },
        include: {
          details: {
            include: {
              product: {
                select: { id: true, name: true, barcode: true },
              },
            },
          },
          user: {
            select: { id: true, name: true },
          },
        },
      });

      return sale;
    });
  },

  async findAll(filters: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.SaleWhereInput = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status as any;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          user: { select: { id: true, name: true } },
          details: {
            include: {
              product: { select: { id: true, name: true, barcode: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ]);

    return { sales, total, page, totalPages: Math.ceil(total / limit) };
  },

  async findById(id: string) {
    return prisma.sale.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        details: {
          include: {
            product: { select: { id: true, name: true, barcode: true } },
          },
        },
      },
    });
  },

  async voidSale(id: string, reason: string) {
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { details: true },
      });

      if (!sale) throw new Error('Venta no encontrada');
      if (sale.status !== 'CONFIRMED') throw new Error('Solo se pueden anular ventas confirmadas');

      for (const detail of sale.details) {
        await tx.product.update({
          where: { id: detail.productId },
          data: { stock: { increment: detail.quantity } },
        });
      }

      return tx.sale.update({
        where: { id },
        data: { status: 'VOIDED', voidReason: reason },
        include: {
          user: { select: { id: true, name: true } },
          details: {
            include: {
              product: { select: { id: true, name: true, barcode: true } },
            },
          },
        },
      });
    });
  },

  async getSystemConfig(key: string): Promise<string | null> {
    const config = await prisma.systemConfig.findUnique({ where: { key } });
    return config?.value || null;
  },

  async getDailyStats(date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const [sales, confirmedSales] = await Promise.all([
      prisma.sale.findMany({
        where: { createdAt: { gte: start, lte: end }, status: 'CONFIRMED' },
        select: { total: true },
      }),
      prisma.sale.count({
        where: { createdAt: { gte: start, lte: end }, status: 'CONFIRMED' },
      }),
    ]);

    const totalRevenue = sales.reduce(
      (sum, s) => sum.add(s.total),
      new Prisma.Decimal(0),
    );

    return {
      date: start.toISOString().split('T')[0],
      totalRevenue: Number(totalRevenue),
      transactionCount: confirmedSales,
      averageTicket:
        confirmedSales > 0 ? Number(totalRevenue.div(confirmedSales)) : 0,
    };
  },
};
