import express from 'express';
import userContoller from '../controller/core/clientController';
import { authenticated } from '../middlewares';
import { createClientValidation } from '../validation/user';
const router = express.Router();

router.get('/', authenticated, userContoller.getAllUsers);
router.post(
  '/',
  authenticated,
  createClientValidation,
  userContoller.createUser
);
router.post('/search/:phoneNumber', authenticated, userContoller.searchUser);
router.put(
  '/:userId',
  authenticated,
  createClientValidation,
  userContoller.updateUser
);
router.delete('/delete/:userId', authenticated, userContoller.deleteUser);

export default router;
