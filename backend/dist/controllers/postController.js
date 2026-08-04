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
exports.deletePost = exports.getMyPosts = exports.getAllPosts = exports.createPost = void 0;
const index_1 = require("../index");
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const data = req.body;
        const post = yield index_1.prisma.post.create({
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
        const user = yield index_1.prisma.user.findUnique({ where: { id: userId } });
        if (user) {
            yield index_1.prisma.user.update({
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
    }
    catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createPost = createPost;
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { city, gender } = req.query;
        let filter = {
            authorId: { not: req.user.id }
        };
        if (city) {
            filter.city = { contains: String(city), mode: 'insensitive' };
        }
        if (gender && gender !== 'Any') {
            filter.preferredGender = { in: [String(gender), 'Any'] };
        }
        const posts = yield index_1.prisma.post.findMany({
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
    }
    catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllPosts = getAllPosts;
const getMyPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const posts = yield index_1.prisma.post.findMany({
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
    }
    catch (error) {
        console.error("Error fetching user posts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getMyPosts = getMyPosts;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const id = req.params.id;
        const post = yield index_1.prisma.post.findUnique({ where: { id } });
        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }
        if (post.authorId !== userId) {
            res.status(403).json({ message: "Not authorized to delete this post" });
            return;
        }
        yield index_1.prisma.post.delete({ where: { id } });
        res.json({ message: "Post deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.deletePost = deletePost;
