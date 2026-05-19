export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function notFound(message: string = 'Recurso no encontrado'): AppError {
  return new AppError(message, 404);
}

export function badRequest(message: string): AppError {
  return new AppError(message, 400);
}

export function unauthorized(message: string = 'No autorizado'): AppError {
  return new AppError(message, 401);
}

export function forbidden(message: string = 'Acceso denegado'): AppError {
  return new AppError(message, 403);
}

export function conflict(message: string): AppError {
  return new AppError(message, 409);
}
