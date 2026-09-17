import { Router }     from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import requireRole    from '../middleware/requireRole.js';
import {
  confirmReceipt,
  usageUpdate,
  rateDonor,
} from '../controllers/ngoMatchActionsController.js';

const router = Router();

router.use(authMiddleware, requireRole('ngo'));

router.post('/:matchId/confirm-receipt', confirmReceipt);
router.post('/:matchId/usage-update',    usageUpdate);
router.post('/:matchId/rate-donor',      rateDonor);

export default router;
