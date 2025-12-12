import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const fixPasswords = async () => {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI, {
            dbName: 'travelgo',
        });
        console.log('✓ Connected to Atlas');

        const usersToFix = [
            'sarah_travels',
            'mike_explorer',
            'emily_nature',
            'david_photo',
            'jessica_wander'
        ];

        for (const userName of usersToFix) {
            const user = await User.findOne({ userName });
            if (user) {
                // We set the password directly. The pre-save hook will hash it.
                // We do NOT hash it manually here.
                user.password = 'Password123!';
                await user.save();
                console.log(`✓ Reset password for: ${userName}`);
            } else {
                console.log(`User not found: ${userName}`);
            }
        }

        console.log('\n✅ Password fix completed!');
        await mongoose.disconnect();
        console.log('✓ Disconnected');

    } catch (error) {
        console.error('❌ Error fixing passwords:', error);
        process.exit(1);
    }
};

fixPasswords();
