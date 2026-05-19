import { Request, Response, NextFunction } from 'express';
import { forbidden } from '../utils/errors';
import { SHIFT_SCHEDULES, SHIFTS } from '../config/constants';
import { userModel } from '../models/user.model';

function getTimeInMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function getCurrentTimeInMinutes(): number {
  const now = new Date();
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const limaMinutes = utcMinutes - 5 * 60; // UTC-5
  return ((limaMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
}

export async function checkShift(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const user = req.user;
  if (!user) {
    return next(forbidden('Usuario no autenticado'));
  }

  if (user.role === 'ADMIN') {
    return next();
  }

  const dbUser = await userModel.findById(user.userId);
  if (!dbUser) {
    return next(forbidden('Usuario no encontrado'));
  }

  if (dbUser.shift === SHIFTS.NONE) {
    return next(
      forbidden('No tienes un turno asignado. Contacta al administrador.'),
    );
  }

  const schedule = SHIFT_SCHEDULES[dbUser.shift as keyof typeof SHIFT_SCHEDULES];
  if (!schedule) {
    return next();
  }

  const currentMinutes = getCurrentTimeInMinutes();
  const startMinutes = getTimeInMinutes(schedule.start);
  const endMinutes = getTimeInMinutes(schedule.end);

  const withinShift = currentMinutes >= startMinutes && currentMinutes <= endMinutes;

  if (!withinShift) {
    return next(
      forbidden(
        `Fuera de horario. Tu turno es ${schedule.start} – ${schedule.end} (hora Perú). Contacta al administrador.`,
      ),
    );
  }

  next();
}
