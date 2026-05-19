import { Request, Response, NextFunction } from 'express';
import { userModel } from '../models/user.model';
import { badRequest, notFound, conflict } from '../utils/errors';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { env } from '../config/env';
import { ROLES, SHIFTS } from '../config/constants';

const createUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  dni: z.string().optional(),
  email: z.string().email('Correo electrónico inválido'),
  role: z.enum([ROLES.ADMIN, ROLES.SELLER], {
    errorMap: () => ({ message: 'Rol inválido. Debe ser ADMIN o SELLER' }),
  }),
  shift: z
    .enum([SHIFTS.MORNING, SHIFTS.AFTERNOON, SHIFTS.FULL, SHIFTS.NONE])
    .optional()
    .default(SHIFTS.NONE),
  phone: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  dni: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum([ROLES.ADMIN, ROLES.SELLER]).optional(),
  shift: z
    .enum([SHIFTS.MORNING, SHIFTS.AFTERNOON, SHIFTS.FULL, SHIFTS.NONE])
    .optional(),
  phone: z.string().optional(),
});

function generateTempPassword(): string {
  return crypto.randomBytes(4).toString('hex');
}

async function sendWelcomeEmail(email: string, name: string, tempPassword: string) {
  if (!env.SMTP_HOST || !env.SMTP_USER) return;

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Machy - Bienvenido al sistema',
    html: `
      <h2>¡Bienvenido a Machy, ${name}!</h2>
      <p>Tu cuenta ha sido creada en el Sistema de Ventas Machy.</p>
      <p>Tus credenciales de acceso son:</p>
      <ul>
        <li><strong>Correo:</strong> ${email}</li>
        <li><strong>Contraseña temporal:</strong> ${tempPassword}</li>
      </ul>
      <p>Por seguridad, cambia tu contraseña al iniciar sesión.</p>
    `,
  });
}

export const userController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, active } = _req.query;
      const filters: { role?: string; active?: boolean } = {};
      if (role && typeof role === 'string') filters.role = role;
      if (active !== undefined && typeof active === 'string') {
        filters.active = active === 'true';
      }

      const users = await userModel.findAll(filters);
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userModel.findById(req.params.id);
      if (!user) {
        throw notFound('Usuario no encontrado');
      }

      const { password, loginAttempts, blockedUntil, ...safeUser } = user as any;
      res.json(safeUser);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createUserSchema.parse(req.body);

      const emailExists = await userModel.existsByEmail(data.email);
      if (emailExists) {
        throw conflict('Ya existe un usuario con ese correo electrónico');
      }

      if (data.dni) {
        const dniExists = await userModel.existsByDni(data.dni);
        if (dniExists) {
          throw conflict('Ya existe un usuario con ese DNI');
        }
      }

      const tempPassword = generateTempPassword();
      const hashedPassword = await userModel.hashPassword(tempPassword);

      const user = await userModel.create({
        ...data,
        password: hashedPassword,
      });

      await sendWelcomeEmail(user.email, user.name, tempPassword);

      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw badRequest(error.errors[0].message);
      }
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateUserSchema.parse(req.body);

      if (Object.keys(data).length === 0) {
        throw badRequest('Debes proporcionar al menos un campo para actualizar');
      }

      const existing = await userModel.findById(req.params.id);
      if (!existing) {
        throw notFound('Usuario no encontrado');
      }

      if (data.email) {
        const emailExists = await userModel.existsByEmail(data.email, req.params.id);
        if (emailExists) {
          throw conflict('Ya existe un usuario con ese correo electrónico');
        }
      }

      if (data.dni) {
        const dniExists = await userModel.existsByDni(data.dni, req.params.id);
        if (dniExists) {
          throw conflict('Ya existe un usuario con ese DNI');
        }
      }

      const user = await userModel.update(req.params.id, data);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw badRequest(error.errors[0].message);
      }
      next(error);
    }
  },

  async toggleActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userModel.toggleActive(req.params.id);
      if (!user) {
        throw notFound('Usuario no encontrado');
      }

      const status = user.active ? 'activado' : 'desactivado';
      res.json({ ...user, message: `Usuario ${status} exitosamente` });
    } catch (error) {
      next(error);
    }
  },
};
