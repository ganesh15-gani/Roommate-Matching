"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const express_1 = require("express");
const index_1 = require("../index");
const auth_1 = require("../utils/auth");
const registerUser = async (req, res) => {
    try {
        const { fullName, email, phone, gender, age, occupation, companyOrCollege, stayType, sharingType, flatType, lookingFor, preferredGender, smoking, drinking, foodPreference, sleepingHabit, minBudget, maxBudget, state, city, area, pincode, bio, password } = req.body;
        const userExists = await index_1.prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const user = await index_1.prisma.user.create({
            data: {
                fullName,
                email,
                phone,
                gender,
                age: age ? parseInt(age) : null,
                occupation,
                companyOrCollege,
                stayType,
                sharingType: stayType === 'PG' ? sharingType : null,
                flatType: stayType === 'Flat' ? flatType : null,
                lookingFor,
                preferredGender,
                smoking,
                drinking,
                foodPreference,
                sleepingHabit,
                minBudget: minBudget ? parseInt(minBudget) : null,
                maxBudget: maxBudget ? parseInt(maxBudget) : null,
                state,
                city,
                area,
                pincode,
                bio,
                password: hashedPassword,
                profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
            }
        });
        res.status(201).json({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            token: (0, auth_1.generateToken)(user.id)
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Failed to register user' });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await index_1.prisma.user.findUnique({ where: { email } });
        if (user && (await (0, auth_1.comparePassword)(password, user.password))) {
            res.json({
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                token: (0, auth_1.generateToken)(user.id)
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Failed to login' });
    }
};
exports.loginUser = loginUser;
//# sourceMappingURL=authController.js.map