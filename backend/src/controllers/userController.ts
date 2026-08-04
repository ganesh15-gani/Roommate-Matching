import { Request, Response } from 'express';
import { prisma } from '../index';

interface AuthRequest extends Request {
  user?: any;
}

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, fullName: true, email: true, phone: true, gender: true,
        age: true, occupation: true, companyOrCollege: true,
        bio: true, profilePhotoUrl: true, role: true, createdAt: true
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.authorId === userId) return res.status(400).json({ message: 'Cannot favorite your own post' });

    const fav = await prisma.favorite.create({
      data: { userId, postId }
    });
    res.status(201).json(fav);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ message: 'Already favorited' });
    res.status(500).json({ message: 'Failed to add favorite' });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const postId = req.params.postId as string;
    const userId = req.user.id;

    await prisma.favorite.deleteMany({
      where: { userId, postId }
    });
    res.json({ message: 'Favorite removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove favorite' });
  }
};

export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true, fullName: true, profilePhotoUrl: true
              }
            }
          }
        }
      }
    });
    res.json(favorites.map(f => f.post));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
};
