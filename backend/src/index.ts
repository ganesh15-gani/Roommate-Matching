import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { MatchingService } from './services/matching.service';

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://roommate-matching-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Socket.IO setup ---
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://roommate-matching-frontend.vercel.app',
    methods: ['GET', 'POST']
  }
});

const onlineUsers = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('setup', (userId: string) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId); // Join own personal room
    io.emit('user_online', userId);
  });

  socket.on('join_chat', (conversationId: string) => {
    socket.join(conversationId);
  });

  socket.on('typing', (data: { conversationId: string, senderId: string, receiverId: string }) => {
    socket.in(data.conversationId).emit('typing', data);
  });
  
  socket.on('stop_typing', (data: { conversationId: string, senderId: string, receiverId: string }) => {
    socket.in(data.conversationId).emit('stop_typing', data);
  });

  socket.on('send_message', async (data: { conversationId: string, senderId: string, receiverId: string, text?: string, attachmentUrl?: string, messageType?: string }) => {
    try {
      const newMsg = await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          text: data.text || null,
          attachmentUrl: data.attachmentUrl || null,
          messageType: data.messageType || 'TEXT',
          status: 'SENT'
        }
      });

      await prisma.conversation.update({
        where: { id: data.conversationId },
        data: { updatedAt: new Date() }
      });

      io.to(data.conversationId).emit('receive_message', newMsg);
      socket.to(data.receiverId).emit('receive_message', newMsg);
    } catch (err) {
      console.error('Socket error:', err);
    }
  });

  socket.on('message_read', async (data: { messageId: string, conversationId: string }) => {
     await prisma.message.update({ where: { id: data.messageId }, data: { status: 'READ', readAt: new Date() } });
     io.to(data.conversationId).emit('message_status_update', { messageId: data.messageId, status: 'READ' });
  });

  socket.on('disconnect', () => {
    let disconnectedUserId = null;
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }
    if (disconnectedUserId) {
      io.emit('user_offline', disconnectedUserId);
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

// --- API Routes ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'StayZen Backend Running' });
});

// AI Matching Endpoint
app.get('/api/matches', async (req, res) => {
  try {
    // 1. In a real app, we get the logged-in user's ID from JWT. Here we mock it.
    // Ensure DB has some seed data if empty
    let usersCount = await prisma.user.count();
    
    if (usersCount === 0) {
      // Seed dummy user & profiles
      const user1 = await prisma.user.create({
        data: { firebaseUid: 'uid1', email: 'golla@example.com', isEmailVerified: true,
          profile: { create: { firstName: 'Golla', lastName: 'Ganesh', age: 25, gender: 'Male', occupation: 'Software Engineer', languages: JSON.stringify(['English', 'Telugu']), lifestyle: JSON.stringify(['Non-Smoker']), interests: JSON.stringify(['Coding', 'Music']) } }
        }
      });
      const user2 = await prisma.user.create({
        data: { firebaseUid: 'uid2', email: 'rahul@example.com', isEmailVerified: true,
          profile: { create: { firstName: 'Rahul', lastName: 'Sharma', age: 26, gender: 'Male', occupation: 'Software Engineer', languages: JSON.stringify(['English', 'Hindi']), lifestyle: JSON.stringify(['Non-Smoker', 'Early Bird']), interests: JSON.stringify(['Coding', 'Fitness']), photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' } }
        }
      });
      const user3 = await prisma.user.create({
        data: { firebaseUid: 'uid3', email: 'sarah@example.com', isEmailVerified: true,
          profile: { create: { firstName: 'Sarah', lastName: 'Chen', age: 24, gender: 'Female', occupation: 'Designer', languages: JSON.stringify(['English']), lifestyle: JSON.stringify(['Early Bird']), interests: JSON.stringify(['Art', 'Music']), photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' } }
        }
      });
    }

    const allProfiles = await prisma.profile.findMany({ include: { user: true } });
    
    // Assume the current user is the first one (Golla Ganesh)
    const currentUser = allProfiles[0];
    const potentialMatches = allProfiles.slice(1);

    // Calculate AI Matches
    const matches = potentialMatches.map((profile: any) => {
      // Parse JSON fields
      const p1 = { ...currentUser, languages: JSON.parse(currentUser.languages as string), lifestyle: JSON.parse(currentUser.lifestyle as string), interests: JSON.parse(currentUser.interests as string) };
      const p2 = { ...profile, languages: JSON.parse(profile.languages as string), lifestyle: JSON.parse(profile.lifestyle as string), interests: JSON.parse(profile.interests as string) };
      
      // @ts-ignore
      const result = MatchingService.calculateCompatibility(p1, p2);
      
      return {
        profile,
        matchScore: result.score,
        matchReasons: result.reasons
      };
    });

    // Sort by highest match score
    matches.sort((a: any, b: any) => b.matchScore - a.matchScore);

    res.json(matches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { budget, location, roomType, sharingType, moveInDate, propertyName, coverImage, posterName, fullName } = req.body;
    
    // In a real app, this comes from auth context
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) return res.status(400).json({ error: 'No user found' });

    const newPost = await prisma.roommatePost.create({
      data: {
        userId: firstUser.id,
        budget: parseInt(budget) || 0,
        location: location || '',
        roomType: roomType || '',
        sharingType: sharingType || '',
        moveInDate: moveInDate ? new Date(moveInDate) : new Date(),
        propertyName: propertyName || '',
        posterName: posterName || fullName || '',
        coverImage: coverImage || null,
      }
    });

    // Broadcast the new post to all connected clients
    io.emit('new_post', newPost);

    res.json({ success: true, post: newPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const { budget, location, roomType, sharingType, moveInDate, propertyName, coverImage, posterName, fullName } = req.body;
    const postId = req.params.id;
    
    const updatedPost = await prisma.roommatePost.update({
      where: { id: postId },
      data: {
        budget: parseInt(budget) || 0,
        location: location || '',
        roomType: roomType || '',
        sharingType: sharingType || '',
        moveInDate: moveInDate ? new Date(moveInDate) : new Date(),
        propertyName: propertyName || '',
        posterName: posterName || fullName || '',
        ...(coverImage && { coverImage })
      }
    });

    io.emit('update_post', updatedPost);

    res.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    await prisma.roommatePost.delete({ where: { id: postId } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// --- Phase 5 APIs ---

app.get('/api/posts/me', async (req, res) => {
  try {
    const firstUser = await prisma.user.findFirst();
    const posts = await prisma.roommatePost.findMany({ where: { userId: firstUser?.id } });
    res.json(posts);
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/requests', async (req, res) => {
  try {
    const { receiverId } = req.body;
    const sender = await prisma.user.findFirst();
    const existing = await prisma.friendRequest.findFirst({ where: { senderId: sender?.id, receiverId } });
    if (existing) return res.json({ success: false, message: 'Already sent' });
    
    await prisma.friendRequest.create({ data: { senderId: sender!.id, receiverId } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/requests/sent', async (req, res) => {
  try {
    const sender = await prisma.user.findFirst();
    const reqs = await prisma.friendRequest.findMany({ 
      where: { senderId: sender?.id },
      include: { receiver: { include: { profile: true } } }
    });
    res.json(reqs);
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/requests/received', async (req, res) => {
  try {
    const receiver = await prisma.user.findFirst();
    const reqs = await prisma.friendRequest.findMany({ 
      where: { receiverId: receiver?.id, status: 'PENDING' },
      include: { sender: { include: { profile: true } } }
    });
    res.json(reqs);
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/requests/accept', async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await prisma.friendRequest.update({ 
      where: { id: requestId }, 
      data: { status: 'ACCEPTED' } 
    });
    
    // Create Friend records for both directions
    await prisma.friend.createMany({
      data: [
        { user1Id: request.senderId, user2Id: request.receiverId },
        { user1Id: request.receiverId, user2Id: request.senderId }
      ]
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/friends', async (req, res) => {
  try {
    const me = await prisma.user.findFirst();
    const friends = await prisma.friend.findMany({ 
      where: { user1Id: me?.id },
      include: { user2: { include: { profile: true } } }
    });
    res.json(friends);
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

app.get('/api/me', async (req, res) => {
  try {
    const me = await prisma.user.findFirst({ include: { profile: true } });
    res.json(me);
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

// --- Chat APIs ---

app.get('/api/chat/conversations', async (req, res) => {
  try {
    const me = await prisma.user.findFirst();
    if (!me) return res.status(401).json({ error: 'Unauthorized' });

    // Auto-create conversations for all friends
    const friends = await prisma.friend.findMany({ where: { user1Id: me.id } });
    for (const f of friends) {
      const existing = await prisma.conversation.findFirst({
        where: {
          OR: [
            { user1Id: me.id, user2Id: f.user2Id },
            { user1Id: f.user2Id, user2Id: me.id }
          ]
        }
      });
      if (!existing) {
        await prisma.conversation.create({
          data: { user1Id: me.id, user2Id: f.user2Id }
        });
      }
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: me.id }, { user2Id: me.id }]
      },
      include: {
        user1: { include: { profile: true } },
        user2: { include: { profile: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

app.get('/api/chat/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/chat/conversations', async (req, res) => {
  try {
    const { receiverId } = req.body;
    const me = await prisma.user.findFirst();
    if (!me) return res.status(401).json({ error: 'Unauthorized' });

    let conv = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: me.id, user2Id: receiverId },
          { user1Id: receiverId, user2Id: me.id }
        ]
      },
      include: {
        user1: { include: { profile: true } },
        user2: { include: { profile: true } }
      }
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          user1Id: me.id,
          user2Id: receiverId
        },
        include: {
          user1: { include: { profile: true } },
          user2: { include: { profile: true } }
        }
      });
    }
    res.json(conv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
