import { Router } from 'express';
import { createPost, getAllPosts, getMyPosts, deletePost } from '../controllers/postController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, createPost);
router.get('/', protect, getAllPosts);
router.get('/mine', protect, getMyPosts);
router.delete('/:id', protect, deletePost);

export default router;
