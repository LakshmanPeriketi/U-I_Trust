import { Router }     from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole    from '../middleware/requireRole.js';
import {
  getPendingNGOs,
  approveNGO,
  rejectNGO,
  listUsers,
  deactivateUser,
  listDisputes,
  resolveDispute,
  getQuotaConfig,
  setQuotaConfig,
  getAnalytics,
} from '../controllers/adminController.js';

const router = Router();

router.use(authMiddleware, requireRole('admin'));

// Vetting
router.get('/vetting',               getPendingNGOs);
router.patch('/vetting/:id/approve', approveNGO);
router.patch('/vetting/:id/reject',  rejectNGO);

// Users
router.get('/users',                 listUsers);
router.patch('/users/:id/deactivate',deactivateUser);

// Disputes
router.get('/disputes',              listDisputes);
router.patch('/disputes/:id/resolve',resolveDispute);

// Quota
router.get('/quotas/:ngoId',         getQuotaConfig);
router.put('/quotas/:ngoId',         setQuotaConfig);

// Analytics
router.get('/analytics',             getAnalytics);

export default router;
