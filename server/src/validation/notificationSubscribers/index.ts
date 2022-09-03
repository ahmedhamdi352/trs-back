import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validateRequest } from '../index';

export const subscriberValidation = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({ email: Joi.string().email().required() });
  validateRequest(req, res, next, schema);
};
