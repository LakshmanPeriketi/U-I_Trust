import { Router }      from 'express';
import authMiddleware  from '../middleware/authMiddleware.js';
import requireRole     from '../middleware/requireRole.js';
import {
  listRequirements,
  createRequirement,
  getRequirement,
  updateRequirement,
  deleteRequirement,
} from '../controllers/requirementController.js';

const router = Router();

router.use(authMiddleware);

router.get('/',       listRequirements);
router.post('/',      requireRole('ngo'), createRequirement);
router.get('/:id',    getRequirement);
router.patch('/:id',  requireRole('ngo'), updateRequirement);
router.delete('/:id', requireRole('ngo'), deleteRequirement);

export default router;
