import { Router } from 'express';
import { configController } from '../controllers/config.controller';
import { authenticate, authorize } from '../middleware/authenticate';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/', configController.getAll);
router.put('/', configController.update);

export default router;
