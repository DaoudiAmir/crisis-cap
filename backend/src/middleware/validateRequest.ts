import { Request, Response, NextFunction } from 'express';
import { AnySchema } from 'yup';
import AppError from '../utils/AppError';

export const validateRequest = (schema: AnySchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: any) {
      next(new AppError(err.message, 400));
    }
  };
};
