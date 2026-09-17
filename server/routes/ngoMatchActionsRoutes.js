import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  confirmReceipt,
  usageUpdate,
  rateDonor,
} from '../controllers/ngoMatchActionsController.js';

const router = express.Router();

router.patch('/:id/confirm-receipt', authMiddleware, confirmReceipt);
router.post('/:id/usage-update', authMiddleware, usageUpdate);
router.post('/:id/rate-donor', authMiddleware, rateDonor);

export default router;
