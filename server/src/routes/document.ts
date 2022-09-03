import express from 'express';
import { authenticated } from '../middlewares';
import documentController from '../controller/core/documentController';
const router = express.Router();

// router.post('/serialize', authenticated, documentController.serialize);
// router.post('/sign', authenticated, documentController.sign);
router.get('/', authenticated, documentController.getDocuments);
router.get('/:documentId', authenticated, documentController.getDocument);
router.post('/submit', authenticated, documentController.submitDocumets);
router.put('/', authenticated, documentController.changeDocumentStatus);
// router.get('/recent', authenticated, documentController.getRecentDocumets);
router.get('/json/:documentId', authenticated, documentController.getDocumentJson);

export default router;
