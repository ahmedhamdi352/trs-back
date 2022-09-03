import express from 'express';
import bookContoller from '../controller/core/bookController';
import { authenticated } from '../middlewares';
import { createClientValidation } from '../validation/user';
const router = express.Router();

router.get('/:eventId', authenticated, bookContoller.getAllBooks);
router.post('/', authenticated, bookContoller.createBook);
router.delete(
  '/delete/:bookId/:eventId',
  authenticated,
  bookContoller.deleteBook
);
router.post('/search/:phone', authenticated, bookContoller.searchBook);
// router.put(
//   '/:userId',
//   authenticated,
//   createClientValidation,
//   userContoller.updateUser
// );

export default router;
