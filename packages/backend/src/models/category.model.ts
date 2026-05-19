import prisma from '../config/database';

export const categoryModel = {
  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  },

  async create(name: string) {
    return prisma.category.create({
      data: { name },
    });
  },

  async update(id: string, data: { name?: string; active?: boolean }) {
    return prisma.category.update({
      where: { id },
      data,
    });
  },
};
