import { Router } from 'express';
import { leadController } from '../controllers/leadController.js';

const router = Router();

router.post('/', leadController.saveLead);
router.get('/', leadController.getLeads);
router.get('/stats', leadController.getStats);
router.get('/export', leadController.exportLeads);
router.patch('/:id', leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

export default router;
