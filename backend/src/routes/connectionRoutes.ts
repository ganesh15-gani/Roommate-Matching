import express from 'express';
import { sendRequest, respondRequest, cancelRequest, getRequests, getConnections } from '../controllers/connectionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/request', protect, sendRequest);
router.post('/respond', protect, respondRequest);
router.post('/cancel', protect, cancelRequest);
router.get('/requests', protect, getRequests);
router.get('/', protect, getConnections);

export default router;
