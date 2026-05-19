import prisma from '../config/database';
import bcrypt from 'bcrypt';
import { LOGIN_MAX_ATTEMPTS, LOGIN_BLOCK_MINUTES } from '../config/constants';

export const userModel = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  },

  async incrementLoginAttempts(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { loginAttempts: { increment: 1 } },
      select: { loginAttempts: true },
    });

    if (user.loginAttempts >= LOGIN_MAX_ATTEMPTS) {
      const blockUntil = new Date(Date.now() + LOGIN_BLOCK_MINUTES * 60 * 1000);
      await prisma.user.update({
        where: { id: userId },
        data: { blockedUntil: blockUntil },
      });
    }

    return user.loginAttempts;
  },

  async resetLoginAttempts(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { loginAttempts: 0, blockedUntil: null },
    });
  },

  async isBlocked(user: { blockedUntil: Date | null; loginAttempts: number }): Promise<boolean> {
    if (user.blockedUntil && new Date() < user.blockedUntil) {
      return true;
    }
    if (user.blockedUntil && new Date() >= user.blockedUntil) {
      await prisma.user.update({
        where: { id: (user as any).id },
        data: { loginAttempts: 0, blockedUntil: null },
      });
    }
    return false;
  },

  async createSession(userId: string) {
    return prisma.session.create({
      data: { userId },
    });
  },

  async closeSession(sessionId: string, type: string = 'MANUAL') {
    return prisma.session.update({
      where: { id: sessionId },
      data: { logoutAt: new Date(), type: type as any },
    });
  },

  async findActiveSession(userId: string) {
    return prisma.session.findFirst({
      where: { userId, logoutAt: null },
      orderBy: { loginAt: 'desc' },
    });
  },

  async updatePassword(userId: string, hashedPassword: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  },

  async findAll(filters?: { role?: string; active?: boolean }) {
    const where: any = {};
    if (filters?.role) where.role = filters.role;
    if (filters?.active !== undefined) where.active = filters.active;

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        dni: true,
        email: true,
        role: true,
        shift: true,
        phone: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async existsByEmail(email: string, excludeId?: string) {
    const where: any = { email };
    if (excludeId) where.id = { not: excludeId };
    const user = await prisma.user.findFirst({ where });
    return !!user;
  },

  async existsByDni(dni: string, excludeId?: string) {
    const where: any = { dni };
    if (excludeId) where.id = { not: excludeId };
    const user = await prisma.user.findFirst({ where });
    return !!user;
  },

  async create(data: {
    name: string;
    dni?: string;
    email: string;
    password: string;
    role: string;
    shift?: string;
    phone?: string;
  }) {
    return prisma.user.create({
      data: {
        name: data.name,
        dni: data.dni,
        email: data.email,
        password: data.password,
        role: data.role as any,
        shift: (data.shift || 'NONE') as any,
        phone: data.phone,
      },
      select: {
        id: true,
        name: true,
        dni: true,
        email: true,
        role: true,
        shift: true,
        phone: true,
        active: true,
        createdAt: true,
      },
    });
  },

  async update(
    id: string,
    data: {
      name?: string;
      dni?: string;
      email?: string;
      role?: string;
      shift?: string;
      phone?: string;
    },
  ) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.dni !== undefined) updateData.dni = data.dni;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.shift !== undefined) updateData.shift = data.shift;
    if (data.phone !== undefined) updateData.phone = data.phone;

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        dni: true,
        email: true,
        role: true,
        shift: true,
        phone: true,
        active: true,
        createdAt: true,
      },
    });
  },

  async toggleActive(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { active: true },
    });

    if (!user) return null;

    return prisma.user.update({
      where: { id },
      data: { active: !user.active },
      select: {
        id: true,
        name: true,
        dni: true,
        email: true,
        role: true,
        shift: true,
        phone: true,
        active: true,
        createdAt: true,
      },
    });
  },
};
