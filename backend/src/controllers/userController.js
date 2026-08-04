"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = exports.getProfile = void 0;
const express_1 = require("express");
const index_1 = require("../index");
const getProfile = async (req, res) => {
    try {
        const user = await index_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true, fullName: true, email: true, phone: true, gender: true,
                age: true, occupation: true, companyOrCollege: true,
                stayType: true, sharingType: true, flatType: true,
                lookingFor: true, preferredGender: true,
                smoking: true, drinking: true, foodPreference: true, sleepingHabit: true,
                minBudget: true, maxBudget: true, state: true, city: true, area: true, pincode: true,
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
};
exports.getProfile = getProfile;
const searchUsers = async (req, res) => {
    try {
        const { city, lookingFor, stayType } = req.query;
        const filters = {
            id: { not: req.user.id } // exclude self
        };
        if (city)
            filters.city = { contains: String(city), mode: 'insensitive' };
        if (lookingFor)
            filters.lookingFor = String(lookingFor);
        if (stayType)
            filters.stayType = String(stayType);
        const users = await index_1.prisma.user.findMany({
            where: filters,
            select: {
                id: true, fullName: true, gender: true, age: true, occupation: true,
                stayType: true, sharingType: true, flatType: true,
                lookingFor: true, preferredGender: true,
                minBudget: true, maxBudget: true, city: true, area: true,
                bio: true, profilePhotoUrl: true, smoking: true, drinking: true
            },
            take: 50
        });
        res.json(users);
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};
exports.searchUsers = searchUsers;
//# sourceMappingURL=userController.js.map