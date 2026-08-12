import mongoose from 'mongoose';
import { MONGODB_URI } from './utils.js';

export default async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI, {
            dbName: 'travelgo',
        });
        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:');
        console.error(`   Message: ${err.message}`);
        console.error(`   Code: ${err.code}`);
        console.error(`   URI: ${MONGODB_URI.substring(0, 30)}...`);
        process.exit(1);
    }

    const dbConnection = mongoose.connection;

    dbConnection.on('error', (err) => {
        console.error('❌ MongoDB Runtime Connection Error:');
        console.error(`   ${err.message}`);
    });

    dbConnection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
    });

    dbConnection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
    });

    return;
}
