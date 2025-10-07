import { Response } from 'express';

interface SuccessOptions<T> {
  res: Response;
  status?: number;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export const sendSuccess = <T>({ res, status = 200, message = 'success', data, meta }: SuccessOptions<T>) => {
  return res.status(status).json({ message, data, meta });
};
