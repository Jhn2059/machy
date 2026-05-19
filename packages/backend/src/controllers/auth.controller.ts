import { Request, Response, NextFunction } from 'express';
import { userModel } from '../models/user.model';
import { generateAccessToken, verifyToken } from '../utils/jwt';
import { badRequest, unauthorized, notFound } from '../utils/errors';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { OTP_EXPIRY_MINUTES } from '../config/constants';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

const recoverSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await userModel.findByEmail(email);
      if (!user) {
        throw unauthorized('Credenciales inválidas');
      }

      if (!user.active) {
        throw unauthorized('Cuenta desactivada. Contacta al administrador.');
      }

      const blocked = await userModel.isBlocked(user);
      if (blocked) {
        const remainingMinutes = Math.ceil(
          (user.blockedUntil!.getTime() - Date.now()) / 60000,
        );
        throw unauthorized(
          `Cuenta bloqueada por múltiples intentos fallidos. Intenta de nuevo en ${remainingMinutes} minutos.`,
        );
      }

      const validPassword = await userModel.validatePassword(password, user.password);
      if (!validPassword) {
        const attempts = await userModel.incrementLoginAttempts(user.id);
        const remaining = 5 - attempts;
        if (remaining > 0) {
          throw unauthorized(`Contraseña incorrecta. Te quedan ${remaining} intentos.`);
        }
        throw unauthorized('Cuenta bloqueada por 15 minutos debido a múltiples intentos fallidos.');
      }

      await userModel.resetLoginAttempts(user.id);

      const session = await userModel.createSession(user.id);

      const token = generateAccessToken({
        userId: user.id,
        role: user.role,
      });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          shift: user.shift,
          active: user.active,
        },
        token,
        sessionId: session.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw badRequest(error.errors[0].message);
      }
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw unauthorized('Token no proporcionado');
      }

      const token = authHeader.substring(7);
      const payload = verifyToken(token);

      const user = await userModel.findById(payload.userId);
      if (!user) {
        throw notFound('Usuario no encontrado');
      }

      if (!user.active) {
        throw unauthorized('Cuenta desactivada');
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        shift: user.shift,
        active: user.active,
      });
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw unauthorized('Token inválido o expirado');
      }
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.body.sessionId;
      if (sessionId) {
        await userModel.closeSession(sessionId, 'MANUAL');
      }

      res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
      next(error);
    }
  },

  async recover(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = recoverSchema.parse(req.body);

      const user = await userModel.findByEmail(email);
      if (!user) {
        res.json({ message: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
        return;
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      const tempPassword = await userModel.hashPassword(otp);

      if (env.SMTP_HOST && env.SMTP_USER) {
        const transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_PORT === 465,
          auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
        });

        await transporter.sendMail({
          from: env.EMAIL_FROM,
          to: user.email,
          subject: 'Machy - Recuperación de contraseña',
          html: `
            <h2>Recuperación de contraseña - Machy</h2>
            <p>Tu código de recuperación es: <strong>${otp}</strong></p>
            <p>Este código expira en ${OTP_EXPIRY_MINUTES} minutos.</p>
            <p>Si no solicitaste este cambio, ignora este mensaje.</p>
          `,
        });

        await userModel.updatePassword(user.id, tempPassword);
      }

      res.json({ message: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw badRequest(error.errors[0].message);
      }
      next(error);
    }
  },
};
