import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Parse CLOUDINARY_URL if present
if (process.env.CLOUDINARY_URL) {
    const url = process.env.CLOUDINARY_URL;
    // Format: cloudinary://api_key:api_secret@cloud_name
    const regex = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/;
    const match = url.match(regex);

    if (match) {
        cloudinary.config({
            api_key: match[1],
            api_secret: match[2],
            cloud_name: match[3]
        });
    }
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'travelgo',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

export { cloudinary, storage };
