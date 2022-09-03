import express from 'express';
import debugController from '../controller/core/debugController';
const router = express.Router();

router.post('/sendmail', debugController.sendMail);

export default router;
