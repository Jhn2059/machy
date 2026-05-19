import prisma from '../config/database';

export const sessionModel = {
  async getAttendanceRecords(params: { userId?: string; startDate?: string; endDate?: string }) {
    const where: any = {};

    if (params.userId) where.userId = params.userId;
    if (params.startDate || params.endDate) {
      where.loginAt = {};
      if (params.startDate) where.loginAt.gte = new Date(params.startDate);
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        where.loginAt.lte = end;
      }
    }

    return prisma.session.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, role: true, shift: true } },
      },
      orderBy: { loginAt: 'desc' },
      take: 200,
    });
  },
};
