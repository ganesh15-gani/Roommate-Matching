import { Request, Response } from 'express';
import { prisma } from '../index';

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const data = req.body;

    const post = await prisma.post.create({
      data: {
        authorId: userId,
        stayType: data.stayType,
        sharingType: data.sharingType,
        flatType: data.flatType,
        lookingFor: data.lookingFor,
        preferredGender: data.preferredGender,
        smoking: data.smoking,
        drinking: data.drinking,
        foodPreference: data.foodPreference,
        sleepingHabit: data.sleepingHabit,
        minBudget: data.minBudget ? parseInt(data.minBudget) : null,
        maxBudget: data.maxBudget ? parseInt(data.maxBudget) : null,
        state: data.state,
        city: data.city,
        area: data.area,
        pincode: data.pincode
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
            gender: true,
            age: true,
            occupation: true,
            bio: true
          }
        }
      }
    });

    // Also mark user's profile as completed if it wasn't and update their basic details
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          profileCompleted: true,
          fullName: data.fullName || user.fullName,
          gender: data.gender || user.gender,
          age: data.age ? parseInt(data.age) : user.age,
          occupation: data.occupation || user.occupation,
          companyOrCollege: data.companyOrCollege || user.companyOrCollege,
          bio: data.bio || user.bio
        }
      });
    }

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city, gender } = req.query;
    
    let filter: any = {
      authorId: { not: (req as any).user.id }
    };
    if (city) {
      filter.city = { contains: String(city), mode: 'insensitive' };
    }
    if (gender && gender !== 'Any') {
      filter.preferredGender = { in: [String(gender), 'Any'] };
    }

    const posts = await prisma.post.findMany({
      where: filter,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
            gender: true,
            age: true,
            occupation: true,
            bio: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const id = req.params.id as string;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    if (post.authorId !== userId) {
      res.status(403).json({ message: "Not authorized to delete this post" });
      return;
    }

    await prisma.post.delete({ where: { id } });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
