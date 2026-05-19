import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import supplierRoutes from './supplier.routes';
import saleRoutes from './sale.routes';
import attendanceRoutes from './attendance.routes';
import configRoutes from './config.routes';

const router = Router();

router.get('/ping', (_req, res) => {
  res.json({ message: 'pong', service: 'machy-api' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/sales', saleRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/config', configRoutes);

export default router;
