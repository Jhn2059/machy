import { Router } from 'express';
import { saleController } from '../controllers/sale.controller';
import { authenticate, authorize } from '../middleware/authenticate';
import { checkShift } from '../middleware/checkShift';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authenticate);
router.use(checkShift);

router.post('/', saleController.create);
router.get('/', saleController.list);
router.get('/stats/daily', saleController.dailyStats);
router.get('/:id', saleController.getById);
router.get('/:id/boleta', saleController.getBoleta);
router.put('/:id/void', authorize(ROLES.ADMIN), saleController.voidSale);

export default router;
