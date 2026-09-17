import { Router }          from 'express';
import authMiddleware      from '../middleware/authMiddleware.js';
import requireRole         from '../middleware/requireRole.js';
import {
  listDonations,
  createDonation,
  getDonation,
  updateDonation,
  deleteDonation,
} from '../controllers/donationController.js';

const router = Router();

router.use(authMiddleware);

router.get('/',     listDonations);
router.post('/',    requireRole('donor'), createDonation);
router.get('/:id',  getDonation);
router.patch('/:id', requireRole('donor'), updateDonation);
router.delete('/:id', requireRole('donor'), deleteDonation);

export default router;
