import { Router }      from 'express';
import authMiddleware  from '../middleware/authMiddleware.js';
import requireRole     from '../middleware/requireRole.js';
import {
  listMatches,
  createMatch,
  getMatch,
  updateMatchStatus,
} from '../controllers/matchController.js';

const router = Router();

router.use(authMiddleware);

router.get('/',      listMatches);
router.post('/',     requireRole('donor'), createMatch);
router.get('/:id',   getMatch);
router.patch('/:id', requireRole('donor', 'admin'), updateMatchStatus);

export default router;
