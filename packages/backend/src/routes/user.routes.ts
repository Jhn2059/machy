import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/authenticate';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/', userController.list);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.patch('/:id/toggle', userController.toggleActive);

export default router;
