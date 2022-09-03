import express from 'express';
import eventContoller from '../controller/core/eventController';
import { authenticated } from '../middlewares';
import { createEventValidation } from '../validation/events';
const router = express.Router();

router.get('/', authenticated, eventContoller.getAllEvents);
router.post(
  '/',
  authenticated,
  createEventValidation,
  eventContoller.createEvent
);
router.post('/search', authenticated, eventContoller.searchEvent);
router.put(
  '/:eventId',
  authenticated,
  createEventValidation,
  eventContoller.updateEvent
);
router.delete('/delete/:eventId', authenticated, eventContoller.deleteEvent);

export default router;
