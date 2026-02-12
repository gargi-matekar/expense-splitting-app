import { Router } from 'express';
import authRoutes from './auth.routes';
import groupRoutes from './group.routes';
import expenseRoutes from './expense.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/groups', groupRoutes);
router.use('/expenses', expenseRoutes);

export default router;