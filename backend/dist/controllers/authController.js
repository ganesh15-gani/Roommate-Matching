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
exports.getMe = exports.googleLogin = exports.loginUser = exports.registerUser = void 0;
const index_1 = require("../index");
const auth_1 = require("../utils/auth");
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const userExists = yield index_1.prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = yield (0, auth_1.hashPassword)(password);
        const user = yield index_1.prisma.user.create({
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
            token: (0, auth_1.generateToken)(user.id)
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Failed to register user' });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield index_1.prisma.user.findUnique({ where: { email } });
        if (user && (yield (0, auth_1.comparePassword)(password, user.password))) {
            res.json({
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                profileCompleted: user.profileCompleted,
                token: (0, auth_1.generateToken)(user.id)
            });
        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.loginUser = loginUser;
const googleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        // Fallback if firebase-admin is not fully configured with service accounts
        // We will decode the token using jsonwebtoken just to extract email and name for the MVP
        const jwt = require('jsonwebtoken');
        const decodedToken = jwt.decode(token);
        if (!decodedToken || !decodedToken.email) {
            return res.status(401).json({ message: 'Invalid Google token' });
        }
        const email = decodedToken.email;
        const fullName = decodedToken.name || 'Google User';
        console.log('googleLogin: Attempting findUnique with email:', email);
        let user;
        try {
            user = yield index_1.prisma.user.findUnique({ where: { email } });
            console.log('googleLogin: findUnique result:', user ? 'User found' : 'User not found');
        }
        catch (dbErr) {
            console.error('googleLogin: findUnique threw error:', dbErr);
            throw dbErr;
        }
        if (!user) {
            console.log('googleLogin: Attempting user.create...');
            try {
                user = yield index_1.prisma.user.create({
                    data: {
                        fullName,
                        email,
                        password: 'GOOGLE_AUTH_USER', // Dummy password
                        phone: '0000000000',
                        profilePhotoUrl: decodedToken.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
                    }
                });
                console.log('googleLogin: user.create successful');
            }
            catch (dbErr) {
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
            token: (0, auth_1.generateToken)(user.id)
        });
    }
    catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Server error during Google login' });
    }
});
exports.googleLogin = googleLogin;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield index_1.prisma.user.findUnique({
            where: { id: req.user.id },
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
    }
    catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getMe = getMe;
