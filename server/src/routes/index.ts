import express from 'express';
import userRoutes from './user';
import salesMenRoutes from './salesMan';
import documentRoutes from './document';
import settingRoutes from './setting';
import notificationSubs from './notificationSubs';
import debugRoutes from './debug';
import roleRoutes from './role';
import eventsRoutes from './events';
import clientsRoutes from './client';
import bookRoutes from './book';

const router = express.Router();

router.use('/user', userRoutes);
router.use('/salesMen', salesMenRoutes);
router.use('/client', clientsRoutes);
router.use('/docs', documentRoutes);
router.use('/setting', settingRoutes);
router.use('/notification/subs', notificationSubs);
router.use('/debug', debugRoutes);
router.use('/roles', roleRoutes);
router.use('/events', eventsRoutes);
router.use('/book', bookRoutes);

export default router;
