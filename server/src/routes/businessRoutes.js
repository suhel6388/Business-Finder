import { Router } from 'express';
import { businessController } from '../controllers/businessController.js';

const router = Router();

router.post('/search', businessController.search);
router.get('/history', businessController.getHistory);

export default router;
