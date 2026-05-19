import { Router } from 'express';
import { attendanceController } from '../controllers/attendance.controller';
import { authenticate, authorize } from '../middleware/authenticate';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.get('/', attendanceController.list);

export default router;
