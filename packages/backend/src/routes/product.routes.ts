import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/authenticate';
import { ROLES } from '../config/constants';

const router = Router();

router.use(authenticate);

router.get('/', productController.list);
router.get('/low-stock', productController.lowStock);
router.get('/stock-summary', productController.stockSummary);
router.get('/barcode/:barcode', productController.getByBarcode);
router.get('/:id', productController.getById);

router.post('/', authorize(ROLES.ADMIN), productController.create);
router.put('/:id', authorize(ROLES.ADMIN), productController.update);
router.patch('/:id/discontinue', authorize(ROLES.ADMIN), productController.discontinue);

export default router;
