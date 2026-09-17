import { Router }      from 'express';
import authMiddleware  from '../middleware/authMiddleware.js';
import requireRole     from '../middleware/requireRole.js';
import {
  listMatches,
  createMatch,
  getMatch,
  updateMatchStatus,
  rateNgo,
} from '../controllers/matchController.js';

const router = Router();

router.use(authMiddleware);

router.get('/',               listMatches);
router.get('/mine',          listMatches);
router.post('/',              requireRole('donor'), createMatch);
router.get('/:id',            getMatch);
router.patch('/:id',          requireRole('donor', 'ngo', 'admin'), updateMatchStatus);
router.post('/:id/rate-ngo',  requireRole('donor'), rateNgo);

export default router;

