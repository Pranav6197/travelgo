import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const setupIndexes = async () => {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI, {
            dbName: 'travelgo',
        });
        console.log('✓ Connected to Atlas');

        const collection = mongoose.connection.collection('users');

        // Check existing indexes
        const indexes = await collection.indexes();
        console.log('\nCurrent indexes:', indexes.map(i => i.name));

        // Drop the problematic googleId index if it exists
        const googleIndex = indexes.find(index => index.name === 'googleId_1');

        if (googleIndex && !googleIndex.sparse) {
            console.log('\n⚠ Found non-sparse googleId_1 index. Dropping it...');
            await collection.dropIndex('googleId_1');
            console.log('✓ Index dropped');
        }

        // Sync indexes from the User model (this will create the sparse index)
        console.log('\n📝 Syncing indexes from User model...');
        await User.syncIndexes();
        console.log('✓ Indexes synced successfully');

        // Verify the new indexes
        const newIndexes = await collection.indexes();
        console.log('\n✅ Final indexes:');
        newIndexes.forEach(index => {
            console.log(`  - ${index.name}${index.sparse ? ' (sparse)' : ''}`);
        });

        console.log('\n✅ Atlas database is ready!');
        await mongoose.disconnect();
        console.log('✓ Disconnected');
    } catch (error) {
        console.error('❌ Error setting up indexes:', error);
        process.exit(1);
    }
};

setupIndexes();
