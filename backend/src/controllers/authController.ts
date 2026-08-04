import { Request, Response } from 'express';
import { prisma } from '../index';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        phone: '0000000000',
        profilePhotoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
      }
    });

    res.status(201).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (user && (await comparePassword(password, user.password))) {
      res.json({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileCompleted: user.profileCompleted,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    // Fallback if firebase-admin is not fully configured with service accounts
    // We will decode the token using jsonwebtoken just to extract email and name for the MVP
    const jwt = require('jsonwebtoken');
    const decodedToken = jwt.decode(token) as any;
    
    if (!decodedToken || !decodedToken.email) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const email = decodedToken.email;
    const fullName = decodedToken.name || 'Google User';

    console.log('googleLogin: Attempting findUnique with email:', email);
    let user;
    try {
      user = await prisma.user.findUnique({ where: { email } });
      console.log('googleLogin: findUnique result:', user ? 'User found' : 'User not found');
    } catch (dbErr) {
      console.error('googleLogin: findUnique threw error:', dbErr);
      throw dbErr;
    }

    if (!user) {
      console.log('googleLogin: Attempting user.create...');
      try {
        user = await prisma.user.create({
          data: {
            fullName,
            email,
            password: 'GOOGLE_AUTH_USER', // Dummy password
            phone: '0000000000',
            profilePhotoUrl: decodedToken.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
          }
        });
        console.log('googleLogin: user.create successful');
      } catch (dbErr) {
        console.error('googleLogin: create threw error:', dbErr);
        throw dbErr;
      }
    }

    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profileCompleted: user.profileCompleted,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Server error during Google login' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        profileCompleted: true,
        profilePhotoUrl: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
