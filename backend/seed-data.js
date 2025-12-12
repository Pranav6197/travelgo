import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/user.js';
import Post from './models/post.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const usersData = [
    {
        userName: 'sarah_travels',
        fullName: 'Sarah Jenkins',
        email: 'sarah@example.com',
        password: 'Password123!',
        posts: [
            {
                title: 'Sunset in Santorini',
                imageLink: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
                categories: ['Travel', 'Beaches'],
                description: 'The most beautiful sunset I have ever seen.',
                isFeaturedPost: true,
            },
            {
                title: 'Hiking the Alps',
                imageLink: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
                categories: ['Adventure', 'Mountains'],
                description: 'A challenging but rewarding hike.',
                isFeaturedPost: false,
            }
        ]
    },
    {
        userName: 'mike_explorer',
        fullName: 'Mike Anderson',
        email: 'mike@example.com',
        password: 'Password123!',
        posts: [
            {
                title: 'Urban Jungle: Tokyo',
                imageLink: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
                categories: ['City', 'Travel'],
                description: 'Lost in the neon lights of Tokyo.',
                isFeaturedPost: true,
            }
        ]
    },
    {
        userName: 'emily_nature',
        fullName: 'Emily Chen',
        email: 'emily@example.com',
        password: 'Password123!',
        posts: [
            {
                title: 'Hidden Waterfall',
                imageLink: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9',
                categories: ['Nature', 'Adventure'],
                description: 'Found this hidden gem deep in the forest.',
                isFeaturedPost: true,
            },
            {
                title: 'Morning Mist',
                imageLink: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
                categories: ['Nature'],
                description: 'Early morning vibes.',
                isFeaturedPost: false,
            }
        ]
    },
    {
        userName: 'david_photo',
        fullName: 'David Miller',
        email: 'david@example.com',
        password: 'Password123!',
        posts: [
            {
                title: 'Architectural Wonders',
                imageLink: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131',
                categories: ['City', 'Landmarks'],
                description: 'The geometry of this building is amazing.',
                isFeaturedPost: false,
            }
        ]
    },
    {
        userName: 'jessica_wander',
        fullName: 'Jessica Taylor',
        email: 'jessica@example.com',
        password: 'Password123!',
        posts: [
            {
                title: 'Desert Safari',
                imageLink: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9',
                categories: ['Adventure', 'Nature'],
                description: 'Riding camels into the sunset.',
                isFeaturedPost: true,
            }
        ]
    }
];

const seedData = async () => {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI, {
            dbName: 'travelgo',
        });
        console.log('✓ Connected to Atlas');

        // Clear existing data (optional, but good for clean seed)
        // await User.deleteMany({});
        // await Post.deleteMany({});
        // console.log('✓ Cleared existing data');

        for (const userData of usersData) {
            // Check if user exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`User ${userData.userName} already exists. Skipping.`);
                continue;
            }

            // Create user
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const user = new User({
                userName: userData.userName,
                fullName: userData.fullName,
                email: userData.email,
                password: hashedPassword, // Manually hashing since we might bypass pre-save hook or just to be safe
            });
            await user.save();
            console.log(`✓ Created user: ${user.userName}`);

            // Create posts for user
            for (const postData of userData.posts) {
                const post = new Post({
                    ...postData,
                    authorName: user.userName,
                    authorId: user._id,
                });
                await post.save();

                // Add post to user's posts array
                user.posts.push(post._id);
            }
            await user.save();
            console.log(`  ✓ Created ${userData.posts.length} posts for ${user.userName}`);
        }

        console.log('\n✅ Seeding completed successfully!');
        await mongoose.disconnect();
        console.log('✓ Disconnected');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
