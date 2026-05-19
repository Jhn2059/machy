import prisma from '../config/database';

export const supplierModel = {
  async findAll() {
    return prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.supplier.findUnique({ where: { id } });
  },

  async create(data: { name: string; ruc?: string; contact?: string; phone?: string }) {
    return prisma.supplier.create({ data });
  },

  async update(id: string, data: { name?: string; ruc?: string; contact?: string; phone?: string; active?: boolean }) {
    return prisma.supplier.update({ where: { id }, data });
  },
};
