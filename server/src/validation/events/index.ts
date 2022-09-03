import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validateRequest } from '../index';

export const createEventValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    eventName: Joi.string().required(),
    hotelName: Joi.string().required(),
    startDate: Joi.string().required(),
    endDate: Joi.string().required(),
    numberOfBuses: Joi.number().required(),
    numberOfRooms: Joi.number().required(),
    busOnly: Joi.boolean().required(),
    roomOnly: Joi.boolean().required(),
    remainingRooms: Joi.number().required(),
    remainingChairs: Joi.number().required(),
    typeOfAccommodation: Joi.string().required(),
    color: Joi.string().required(),
  });
  validateRequest(req, res, next, schema);
};
