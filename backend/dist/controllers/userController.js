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
exports.getFavorites = exports.removeFavorite = exports.addFavorite = exports.getProfile = void 0;
const index_1 = require("../index");
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield index_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true, fullName: true, email: true, phone: true, gender: true,
                age: true, occupation: true, companyOrCollege: true,
                bio: true, profilePhotoUrl: true, role: true, createdAt: true
            }
        });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getProfile = getProfile;
const addFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.body;
        const userId = req.user.id;
        const post = yield index_1.prisma.post.findUnique({ where: { id: postId } });
        if (!post)
            return res.status(404).json({ message: 'Post not found' });
        if (post.authorId === userId)
            return res.status(400).json({ message: 'Cannot favorite your own post' });
        const fav = yield index_1.prisma.favorite.create({
            data: { userId, postId }
        });
        res.status(201).json(fav);
    }
    catch (error) {
        if (error.code === 'P2002')
            return res.status(400).json({ message: 'Already favorited' });
        res.status(500).json({ message: 'Failed to add favorite' });
    }
});
exports.addFavorite = addFavorite;
const removeFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.postId;
        const userId = req.user.id;
        yield index_1.prisma.favorite.deleteMany({
            where: { userId, postId }
        });
        res.json({ message: 'Favorite removed' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to remove favorite' });
    }
});
exports.removeFavorite = removeFavorite;
const getFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const favorites = yield index_1.prisma.favorite.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch favorites' });
    }
});
exports.getFavorites = getFavorites;
