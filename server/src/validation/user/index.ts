import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validateRequest } from '../index';

export const changePasswordValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
  });
  validateRequest(req, res, next, schema);
};
export const loginValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
  validateRequest(req, res, next, schema);
};

export const createUserValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.number().required(),
    role: Joi.number().required(),
    isActive: Joi.boolean().required(),
  });
  validateRequest(req, res, next, schema);
};

export const createSaleManValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    username: Joi.string().required(),
    phone: Joi.number().required(),
    percentage: Joi.number().required(),
    isActive: Joi.boolean().required(),
  });
  validateRequest(req, res, next, schema);
};

export const updateUserValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    role: Joi.number().required(),
    phone: Joi.number().required(),
    isActive: Joi.boolean().required(),
  });
  validateRequest(req, res, next, schema);
};

export const createClientValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    userId: Joi.string().required(),
    phone: Joi.number().required(),
  });
  validateRequest(req, res, next, schema);
};
