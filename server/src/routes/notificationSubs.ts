import express from 'express';
import { authenticated } from '../middlewares';
import notificationController from '../controller/core/notificationController';
import { subscriberValidation } from '../validation/notificationSubscribers';
const router = express.Router();

router.get('/', authenticated, notificationController.getSubscribers);
router.post('/', authenticated, subscriberValidation, notificationController.addSubscriber);
router.delete('/:id', authenticated, notificationController.deleteSubscriber);

export default router;
