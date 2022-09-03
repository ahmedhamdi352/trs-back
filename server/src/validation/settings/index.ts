import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validateRequest } from '../index';

export const settingsValidation = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({ name: Joi.string().required(), value: Joi.string().required() });
  validateRequest(req, res, next, schema);
};
