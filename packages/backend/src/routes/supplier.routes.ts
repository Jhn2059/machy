import { Router } from 'express';
import { supplierController } from '../controllers/supplier.controller';
import { authenticate, authorize } from '../middleware/authenticate';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authenticate);

router.get('/', supplierController.list);
router.post('/', authorize(ROLES.ADMIN), supplierController.create);
router.put('/:id', authorize(ROLES.ADMIN), supplierController.update);

export default router;
