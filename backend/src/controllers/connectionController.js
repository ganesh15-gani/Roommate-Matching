"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequests = exports.cancelRequest = exports.respondRequest = exports.sendRequest = void 0;
const express_1 = require("express");
const index_1 = require("../index");
const sendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user.id;
        if (senderId === receiverId) {
            return res.status(400).json({ message: 'Cannot send request to yourself' });
        }
        // Check if an accepted connection already exists
        const existingConnection = await index_1.prisma.connection.findFirst({
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
        // Find if any request already exists (either direction)
        const existingReq = await index_1.prisma.connectionRequest.findFirst({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }
        });
        if (existingReq) {
            if (existingReq.status === 'PENDING') {
                return res.status(400).json({ message: 'A pending request already exists' });
            }
            // If there's an existing request but it was REJECTED or CANCELLED, we can 'resend' it
            // By overwriting it to PENDING and setting the sender to current user
            const updatedReq = await index_1.prisma.connectionRequest.update({
                where: { id: existingReq.id },
                data: {
                    senderId,
                    receiverId,
                    status: 'PENDING'
                }
            });
            return res.json(updatedReq);
        }
        // Otherwise, create a brand new request
        const newReq = await index_1.prisma.connectionRequest.create({
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
};
exports.sendRequest = sendRequest;
const respondRequest = async (req, res) => {
    try {
        const { requestId, status } = req.body; // status: 'ACCEPTED' | 'REJECTED'
        const userId = req.user.id;
        const connectionReq = await index_1.prisma.connectionRequest.findUnique({
            where: { id: requestId }
        });
        if (!connectionReq)
            return res.status(404).json({ message: 'Request not found' });
        if (connectionReq.receiverId !== userId)
            return res.status(403).json({ message: 'Unauthorized' });
        if (connectionReq.status !== 'PENDING')
            return res.status(400).json({ message: 'Request is no longer pending' });
        await index_1.prisma.connectionRequest.update({
            where: { id: requestId },
            data: { status }
        });
        if (status === 'ACCEPTED') {
            await index_1.prisma.connection.create({
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
};
exports.respondRequest = respondRequest;
const cancelRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        const userId = req.user.id;
        const connectionReq = await index_1.prisma.connectionRequest.findUnique({
            where: { id: requestId }
        });
        if (!connectionReq)
            return res.status(404).json({ message: 'Request not found' });
        if (connectionReq.senderId !== userId)
            return res.status(403).json({ message: 'Unauthorized' });
        await index_1.prisma.connectionRequest.update({
            where: { id: requestId },
            data: { status: 'CANCELLED' }
        });
        res.json({ message: 'Request cancelled' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to cancel request' });
    }
};
exports.cancelRequest = cancelRequest;
const getRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const received = await index_1.prisma.connectionRequest.findMany({
            where: { receiverId: userId, status: 'PENDING' },
            include: { sender: { select: { id: true, fullName: true, profilePhotoUrl: true, age: true, occupation: true } } }
        });
        const sent = await index_1.prisma.connectionRequest.findMany({
            where: { senderId: userId, status: 'PENDING' },
            include: { receiver: { select: { id: true, fullName: true, profilePhotoUrl: true, age: true, occupation: true } } }
        });
        res.json({ received, sent });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch requests' });
    }
};
exports.getRequests = getRequests;
//# sourceMappingURL=connectionController.js.map