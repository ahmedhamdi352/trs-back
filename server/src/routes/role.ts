import express from 'express';
import { authenticated } from '../middlewares';
import roleController from '../controller/core/roleController';
const router = express.Router();

router.post('/', authenticated, roleController.createRole);
router.put('/:roleId', authenticated, roleController.updateRole);
router.post('/assignRole', authenticated, roleController.assignRoleToUser);
router.delete('/:roleId', authenticated, roleController.deleteRole);
router.get('/', authenticated, roleController.getRoles);
router.get('/permissions', authenticated, roleController.getPermissions);

export default router;
