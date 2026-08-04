import { Request, Response } from 'express';
import { prisma } from '../index';

interface AuthRequest extends Request {
  user?: any;
}

export const sendRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    // 1. Check if an accepted connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId }
        ]
      }
    });

    if (existingConnection) {
      return res.status(400).json({ message: 'You are already connected with this user' });
    }

    // 2. Check for ANY pending request between these two users (either direction)
    const pendingReq = await prisma.connectionRequest.findFirst({
      where: {
        status: 'PENDING',
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });

    if (pendingReq) {
      return res.status(400).json({ message: 'A pending request already exists' });
    }

    // 3. Look for an existing request in the EXACT direction to reuse (if rejected/cancelled)
    const exactExistingReq = await prisma.connectionRequest.findUnique({
      where: {
        senderId_receiverId: { senderId, receiverId }
      }
    });

    if (exactExistingReq) {
      // Overwrite to PENDING
      const updatedReq = await prisma.connectionRequest.update({
        where: { id: exactExistingReq.id },
        data: { status: 'PENDING' }
      });
      return res.json(updatedReq);
    }

    // 4. Look for an existing request in the REVERSE direction to reuse (if rejected/cancelled)
    const reverseExistingReq = await prisma.connectionRequest.findUnique({
      where: {
        senderId_receiverId: { senderId: receiverId, receiverId: senderId }
      }
    });

    if (reverseExistingReq) {
      // Overwrite to PENDING and flip the sender/receiver
      const updatedReq = await prisma.connectionRequest.update({
        where: { id: reverseExistingReq.id },
        data: { 
          senderId, 
          receiverId, 
          status: 'PENDING' 
        }
      });
      return res.json(updatedReq);
    }

    // 5. Otherwise, create a brand new request
    const newReq = await prisma.connectionRequest.create({
      data: {
        senderId,
        receiverId,
        status: 'PENDING'
      }
    });

    res.status(201).json(newReq);
  } catch (error) {
    console.error('Send request error:', error);
    res.status(500).json({ message: 'Failed to send request' });
  }
};

export const respondRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId, status } = req.body; // status: 'ACCEPTED' | 'REJECTED'
    const userId = req.user.id;

    const connectionReq = await prisma.connectionRequest.findUnique({
      where: { id: requestId }
    });

    if (!connectionReq) return res.status(404).json({ message: 'Request not found' });
    if (connectionReq.receiverId !== userId) return res.status(403).json({ message: 'Unauthorized' });
    if (connectionReq.status !== 'PENDING') return res.status(400).json({ message: 'Request is no longer pending' });

    await prisma.connectionRequest.update({
      where: { id: requestId },
      data: { status }
    });

    if (status === 'ACCEPTED') {
      await prisma.connection.create({
        data: {
          user1Id: connectionReq.senderId,
          user2Id: connectionReq.receiverId
        }
      });
    }

    res.json({ message: `Request ${status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to respond to request' });
  }
};

export const cancelRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.body;
    const userId = req.user.id;

    const connectionReq = await prisma.connectionRequest.findUnique({
      where: { id: requestId }
    });

    if (!connectionReq) return res.status(404).json({ message: 'Request not found' });
    if (connectionReq.senderId !== userId) return res.status(403).json({ message: 'Unauthorized' });

    await prisma.connectionRequest.update({
      where: { id: requestId },
      data: { status: 'CANCELLED' }
    });

    res.json({ message: 'Request cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel request' });
  }
};

export const getRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const received = await prisma.connectionRequest.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: { sender: { select: { id: true, fullName: true, profilePhotoUrl: true, age: true, occupation: true } } }
    });
    
    const sent = await prisma.connectionRequest.findMany({
      where: { senderId: userId, status: 'PENDING' },
      include: { receiver: { select: { id: true, fullName: true, profilePhotoUrl: true, age: true, occupation: true } } }
    });

    res.json({ received, sent });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
};

export const getConnections = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }]
      },
      include: {
        user1: { select: { id: true, fullName: true, profilePhotoUrl: true } },
        user2: { select: { id: true, fullName: true, profilePhotoUrl: true } }
      }
    });

    const friends = connections.map(c => c.user1Id === userId ? c.user2 : c.user1);
    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch connections' });
  }
};
