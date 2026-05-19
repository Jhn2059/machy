import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/authenticate';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authenticate);

router.get('/', categoryController.list);
router.post('/', authorize(ROLES.ADMIN), categoryController.create);
router.put('/:id', authorize(ROLES.ADMIN), categoryController.update);

export default router;
