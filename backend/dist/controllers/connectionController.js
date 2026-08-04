"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnections = exports.getRequests = exports.cancelRequest = exports.respondRequest = exports.sendRequest = void 0;
const index_1 = require("../index");
const sendRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { receiverId } = req.body;
        const senderId = req.user.id;
        if (senderId === receiverId) {
            return res.status(400).json({ message: 'Cannot send request to yourself' });
        }
        // 1. Check if an accepted connection already exists
        const existingConnection = yield index_1.prisma.connection.findFirst({
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
        const pendingReq = yield index_1.prisma.connectionRequest.findFirst({
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
        const exactExistingReq = yield index_1.prisma.connectionRequest.findUnique({
            where: {
                senderId_receiverId: { senderId, receiverId }
            }
        });
        if (exactExistingReq) {
            // Overwrite to PENDING
            const updatedReq = yield index_1.prisma.connectionRequest.update({
                where: { id: exactExistingReq.id },
                data: { status: 'PENDING' }
            });
            return res.json(updatedReq);
        }
        // 4. Look for an existing request in the REVERSE direction to reuse (if rejected/cancelled)
        const reverseExistingReq = yield index_1.prisma.connectionRequest.findUnique({
            where: {
                senderId_receiverId: { senderId: receiverId, receiverId: senderId }
            }
        });
        if (reverseExistingReq) {
            // Overwrite to PENDING and flip the sender/receiver
            const updatedReq = yield index_1.prisma.connectionRequest.update({
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
        const newReq = yield index_1.prisma.connectionRequest.create({
            data: {
                senderId,
                receiverId,
                status: 'PENDING'
            }
        });
        res.status(201).json(newReq);
    }
    catch (error) {
        console.error('Send request error:', error);
        res.status(500).json({ message: 'Failed to send request' });
    }
});
exports.sendRequest = sendRequest;
const respondRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requestId, status } = req.body; // status: 'ACCEPTED' | 'REJECTED'
        const userId = req.user.id;
        const connectionReq = yield index_1.prisma.connectionRequest.findUnique({
            where: { id: requestId }
        });
        if (!connectionReq)
            return res.status(404).json({ message: 'Request not found' });
        if (connectionReq.receiverId !== userId)
            return res.status(403).json({ message: 'Unauthorized' });
        if (connectionReq.status !== 'PENDING')
            return res.status(400).json({ message: 'Request is no longer pending' });
        yield index_1.prisma.connectionRequest.update({
            where: { id: requestId },
            data: { status }
        });
        if (status === 'ACCEPTED') {
            yield index_1.prisma.connection.create({
                data: {
                    user1Id: connectionReq.senderId,
                    user2Id: connectionReq.receiverId
                }
            });
        }
        res.json({ message: `Request ${status.toLowerCase()}` });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to respond to request' });
    }
});
exports.respondRequest = respondRequest;
const cancelRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requestId } = req.body;
        const userId = req.user.id;
        const connectionReq = yield index_1.prisma.connectionRequest.findUnique({
            where: { id: requestId }
        });
        if (!connectionReq)
            return res.status(404).json({ message: 'Request not found' });
        if (connectionReq.senderId !== userId)
            return res.status(403).json({ message: 'Unauthorized' });
        yield index_1.prisma.connectionRequest.update({
            where: { id: requestId },
            data: { status: 'CANCELLED' }
        });
        res.json({ message: 'Request cancelled' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to cancel request' });
    }
});
exports.cancelRequest = cancelRequest;
const getRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const received = yield index_1.prisma.connectionRequest.findMany({
            where: { receiverId: userId, status: 'PENDING' },
            include: { sender: { select: { id: true, fullName: true, profilePhotoUrl: true, age: true, occupation: true } } }
        });
        const sent = yield index_1.prisma.connectionRequest.findMany({
            where: { senderId: userId, status: 'PENDING' },
            include: { receiver: { select: { id: true, fullName: true, profilePhotoUrl: true, age: true, occupation: true } } }
        });
        res.json({ received, sent });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch requests' });
    }
});
exports.getRequests = getRequests;
const getConnections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const connections = yield index_1.prisma.connection.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch connections' });
    }
});
exports.getConnections = getConnections;
