
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_db';

const users = [
    {
        name: 'Admin User',
        email: 'admin@luminedge.com',
        password: 'password123',
        role: 'admin',
        phone: '1234567890',
        isActive: true
    },
    {
        name: 'John Doe',
        email: 'john.bdm@luminedge.com',
        password: 'password123',
        role: 'bdm',
        phone: '0987654321',
        isActive: true
    },
    {
        name: 'Jane Smith',
        email: 'jane.bdm@luminedge.com',
        password: 'password123',
        role: 'senior-bdm',
        phone: '1122334455',
        isActive: true
    },
    {
        name: 'Robert Johnson',
        email: 'robert.bdm@luminedge.com',
        password: 'password123',
        role: 'junior-bdm',
        phone: '5544332211',
        isActive: true
    }
];

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing users? Maybe better to upsert or check existence.
        // For this task, checking existence by email is safer.

        for (const user of users) {
            const existingUser = await User.findOne({ email: user.email });
            if (existingUser) {
                console.log(`User ${user.email} already exists`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(user.password, 10);
            await User.create({
                ...user,
                password: hashedPassword
            });
            console.log(`Created user: ${user.name} (${user.role})`);
        }

        console.log('User seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
