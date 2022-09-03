import express from 'express';
import { authenticated } from '../middlewares';
import settngController from '../controller/core/settingController';
import { settingsValidation } from '../validation/settings';
const router = express.Router();

router.get('/:settingName', authenticated, settngController.getSetting);
router.put('/:settingName', authenticated, settingsValidation, settngController.updateSettings);
router.put('/cronjob', authenticated, settngController.updateCronJobSettings);

export default router;
