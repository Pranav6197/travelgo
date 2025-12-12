import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.js';
import { Role } from './types/role-type.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const createAdmin = async () => {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI, {
            dbName: 'travelgo',
        });
        console.log('✓ Connected to Atlas');

        const adminData = {
            userName: 'admin_user',
            fullName: 'System Admin',
            email: 'admin@example.com',
            password: 'Admin123!',
            role: Role.Admin,
        };

        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Admin user already exists.');
            // Update role just in case
            existingAdmin.role = Role.Admin;
            existingAdmin.password = adminData.password; // Will be hashed by pre-save
            await existingAdmin.save();
            console.log('✓ Updated existing admin user role and password.');
        } else {
            const admin = new User(adminData);
            await admin.save();
            console.log(`✓ Created new admin user: ${admin.userName}`);
        }

        await mongoose.disconnect();
        console.log('✓ Disconnected');

    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
