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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Resetting the database...');
        // Delete all existing data
        yield prisma.message.deleteMany();
        yield prisma.connection.deleteMany();
        yield prisma.connectionRequest.deleteMany();
        yield prisma.favorite.deleteMany();
        yield prisma.post.deleteMany();
        yield prisma.user.deleteMany();
        console.log('Database wiped successfully.');
        // Create two users
        const passwordHash = yield bcrypt_1.default.hash('Password@123', 10);
        const user1 = yield prisma.user.create({
            data: {
                fullName: 'Alice Johnson',
                email: 'alice@example.com',
                password: passwordHash,
                phone: '9876543210',
                gender: 'Female',
                age: 24,
                occupation: 'Employee',
                companyOrCollege: 'Tech Corp',
                bio: 'Looking for a clean and quiet roommate.',
                profilePhotoUrl: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=0D8ABC&color=fff',
                profileCompleted: true,
                posts: {
                    create: {
                        stayType: 'Flat',
                        flatType: '2 BHK',
                        lookingFor: 'Roommate',
                        preferredGender: 'Female',
                        smoking: 'No',
                        drinking: 'No',
                        foodPreference: 'Veg',
                        sleepingHabit: 'Early Sleeper',
                        minBudget: 8000,
                        maxBudget: 12000,
                        state: 'Maharashtra',
                        city: 'Pune',
                        area: 'Koregaon Park',
                        pincode: '411001',
                        propertyName: 'Cozy 2BHK in KP'
                    }
                }
            }
        });
        const user2 = yield prisma.user.create({
            data: {
                fullName: 'Bob Smith',
                email: 'bob@example.com',
                password: passwordHash,
                phone: '9123456789',
                gender: 'Male',
                age: 26,
                occupation: 'Freelancer',
                companyOrCollege: 'Self Employed',
                bio: 'Chill guy, looking for an affordable room.',
                profilePhotoUrl: 'https://ui-avatars.com/api/?name=Bob+Smith&background=2E7D32&color=fff',
                profileCompleted: true,
            }
        });
        console.log('Created Users: Alice and Bob');
        // Create a connection between them so they can chat
        yield prisma.connection.create({
            data: {
                user1Id: user1.id,
                user2Id: user2.id
            }
        });
        // Create some initial chat messages
        yield prisma.message.create({
            data: {
                senderId: user1.id,
                receiverId: user2.id,
                content: 'Hi Bob, saw your profile. Are you still looking for a place?'
            }
        });
        yield prisma.message.create({
            data: {
                senderId: user2.id,
                receiverId: user1.id,
                content: 'Hey Alice! Yes, I am. Is the 2BHK in Koregaon Park still available?'
            }
        });
        console.log('Created connections and messages.');
        console.log('Seed completed successfully!');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
