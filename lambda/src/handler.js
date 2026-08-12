import {
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import mongoose from 'mongoose';

const region = process.env.AWS_REGION || 'ap-south-1';
const bucket = process.env.AWS_S3_BUCKET;
const publicBaseUrl = process.env.AWS_S3_PUBLIC_BASE_URL;
const mongoUri = process.env.MONGODB_URI;
const s3 = new S3Client({ region });

const imageAssetSchema = new mongoose.Schema(
    {
        originalUrl: String,
        originalKey: String,
        processedUrl: String,
        processedKey: String,
        imageStatus: String,
        enhancementRequested: Boolean,
        processedAt: Date,
    },
    { _id: true }
);
const postSchema = new mongoose.Schema({
    imageLink: String,
    images: [String],
    imageAssets: [imageAssetSchema],
});
const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

function objectUrl(objectKey) {
    const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');
    if (publicBaseUrl) return `${publicBaseUrl.replace(/\/$/, '')}/${encodedKey}`;
    return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
}

/**
 * Replace this pass-through with RealESRGAN, CodeFormer, or another image model.
 * Its input/output contract deliberately isolates enhancement from the API service.
 */
export async function enhanceImage(originalImage) {
    return originalImage;
}

async function connectToDatabase() {
    if (!mongoUri) throw new Error('MONGODB_URI must be configured for the image enhancement Lambda.');
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri, { dbName: process.env.MONGODB_DB_NAME || 'travelgo' });
    }
}

async function processEnhancement(message) {
    if (!bucket) throw new Error('AWS_S3_BUCKET must be configured for the image enhancement Lambda.');
    if (!message.enhancementRequested || message.imageType !== 'post') return;

    const source = await s3.send(new GetObjectCommand({ Bucket: message.bucket || bucket, Key: message.objectKey }));
    const originalImage = await streamToBuffer(source.Body);
    const enhancedImage = await enhanceImage(originalImage);
    const fileName = message.objectKey.split('/').pop();
    const processedKey = `processed/posts/${fileName}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: message.bucket || bucket,
            Key: processedKey,
            Body: enhancedImage,
            ContentType: source.ContentType || 'image/jpeg',
        })
    );

    await connectToDatabase();
    const post = await Post.findById(message.postId);
    if (!post) throw new Error(`Post ${message.postId} no longer exists.`);
    const asset = post.imageAssets.id(message.imageAssetId);
    if (!asset) throw new Error(`Image asset ${message.imageAssetId} does not exist on post ${message.postId}.`);

    asset.processedKey = processedKey;
    asset.processedUrl = objectUrl(processedKey);
    asset.imageStatus = 'READY';
    asset.processedAt = new Date();
    post.images = post.imageAssets.map((image) =>
        image.imageStatus === 'READY' && image.processedUrl ? image.processedUrl : image.originalUrl
    );
    post.imageLink = post.images[0] || '';
    await post.save();
}

export const handler = async (event) => {
    const failures = [];
    for (const record of event.Records || []) {
        try {
            await processEnhancement(JSON.parse(record.body));
        } catch (error) {
            console.error('Image enhancement failed:', error);
            failures.push({ itemIdentifier: record.messageId });
        }
    }
    return { batchItemFailures: failures };
};
