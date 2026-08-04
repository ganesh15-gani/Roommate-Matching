import express from 'express';
import { getProfile, addFavorite, removeFavorite, getFavorites } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/profile', protect, getProfile);

// Favorites
router.post('/favorites', protect, addFavorite);
router.delete('/favorites/:postId', protect, removeFavorite);
router.get('/favorites', protect, getFavorites);

export default router;
