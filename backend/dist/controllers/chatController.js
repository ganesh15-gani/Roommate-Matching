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
exports.deleteMessage = exports.sendMessage = exports.getMessages = void 0;
const index_1 = require("../index");
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const currentUserId = req.user.id;
        // Verify connection exists
        const connection = yield index_1.prisma.connection.findFirst({
            where: {
                OR: [
                    { user1Id: currentUserId, user2Id: userId },
                    { user1Id: userId, user2Id: currentUserId }
                ]
            }
        });
        if (!connection) {
            return res.status(403).json({ message: 'Not connected to this user' });
        }
        const messages = yield index_1.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: userId },
                    { senderId: userId, receiverId: currentUserId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });
        // Mark as read
        yield index_1.prisma.message.updateMany({
            where: { senderId: userId, receiverId: currentUserId, read: false },
            data: { read: true }
        });
        res.json(messages);
    }
    catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});
exports.getMessages = getMessages;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user.id;
        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }
        // Verify connection exists
        const connection = yield index_1.prisma.connection.findFirst({
            where: {
                OR: [
                    { user1Id: senderId, user2Id: receiverId },
                    { user1Id: receiverId, user2Id: senderId }
                ]
            }
        });
        if (!connection) {
            return res.status(403).json({ message: 'Not connected to this user' });
        }
        const message = yield index_1.prisma.message.create({
            data: {
                senderId,
                receiverId,
                content
            }
        });
        res.status(201).json(message);
    }
    catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});
exports.sendMessage = sendMessage;
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messageId = req.params.messageId;
        const currentUserId = req.user.id;
        const message = yield index_1.prisma.message.findUnique({
            where: { id: messageId }
        });
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        if (message.senderId !== currentUserId) {
            return res.status(403).json({ message: 'You can only delete your own messages' });
        }
        yield index_1.prisma.message.delete({
            where: { id: messageId }
        });
        res.json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ message: 'Failed to delete message' });
    }
});
exports.deleteMessage = deleteMessage;
