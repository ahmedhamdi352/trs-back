import express from 'express';
import userContoller from '../controller/core/userContoller';
import { authenticated } from '../middlewares';
import { loginValidation, changePasswordValidation, createUserValidation, updateUserValidation } from '../validation/user';
const router = express.Router();

router.post('/login', loginValidation, userContoller.login);
router.post('/changepassword', authenticated, changePasswordValidation, userContoller.changePassword);
router.get('/', authenticated, userContoller.getAllUsers);
router.get('/admin', authenticated, userContoller.getAllAdmins);
router.get('/receptionist', authenticated, userContoller.getAllreceptionist);
router.get('/finance', authenticated, userContoller.getAllfinance);

router.post('/', authenticated, createUserValidation, userContoller.createUser);
router.delete('/delete/:userId', authenticated, userContoller.deleteUser);
router.put('/:userId', authenticated, updateUserValidation, userContoller.updateUser);


export default router;
