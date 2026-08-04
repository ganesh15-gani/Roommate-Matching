import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting the database...');

  // Delete all existing data
  await prisma.message.deleteMany();
  await prisma.connection.deleteMany();
  await prisma.connectionRequest.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database wiped successfully.');

  // Create two users
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const user1 = await prisma.user.create({
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

  const user2 = await prisma.user.create({
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
  await prisma.connection.create({
    data: {
      user1Id: user1.id,
      user2Id: user2.id
    }
  });

  // Create some initial chat messages
  await prisma.message.create({
    data: {
      senderId: user1.id,
      receiverId: user2.id,
      content: 'Hi Bob, saw your profile. Are you still looking for a place?'
    }
  });

  await prisma.message.create({
    data: {
      senderId: user2.id,
      receiverId: user1.id,
      content: 'Hey Alice! Yes, I am. Is the 2BHK in Koregaon Park still available?'
    }
  });

  console.log('Created connections and messages.');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
