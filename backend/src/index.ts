import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import connectionRoutes from './routes/connectionRoutes';
import chatRoutes from './routes/chatRoutes';
import postRoutes from './routes/postRoutes';

dotenv.config();

const app = express();

export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/connections', connectionRoutes);
app.use('/api/v1/messages', chatRoutes);
app.use('/api/v1/posts', postRoutes);

// Health
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'StayZen v2 API running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
