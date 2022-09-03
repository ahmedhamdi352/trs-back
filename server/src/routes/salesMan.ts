import express from 'express';
import userContoller from '../controller/core/salesManController';
import { authenticated } from '../middlewares';
import { loginValidation, changePasswordValidation, createSaleManValidation, updateUserValidation } from '../validation/user';
const router = express.Router();

router.get('/', authenticated, userContoller.getAllUsers);
router.post('/', authenticated, createSaleManValidation, userContoller.createUser);
router.put('/:userId', authenticated, createSaleManValidation, userContoller.updateUser);
router.delete('/delete/:userId', authenticated, userContoller.deleteUser);

export default router;
