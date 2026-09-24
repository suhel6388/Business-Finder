import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';

const router = Router();

router.post('/outreach', aiController.generateOutreach);

export default router;
