import express from 'express';
import { getMessages, sendMessage, deleteMessage } from '../controllers/chatController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/:userId', protect, getMessages);
router.post('/', protect, sendMessage);
router.delete('/:messageId', protect, deleteMessage);

export default router;
