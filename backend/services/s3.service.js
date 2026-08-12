import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';
import { awsConfig, requireS3Configuration } from '../config/aws.js';

const s3Client = new S3Client({ region: awsConfig.region });

function safeFileName(fileName = 'image') {
    const extension = path.extname(fileName).toLowerCase() || '.jpg';
    return `${crypto.randomUUID()}${extension}`;
}

export function buildPublicObjectUrl(objectKey) {
    const encodedKey = objectKey.split('/').map(encodeURIComponent).join('/');
    if (awsConfig.s3PublicBaseUrl) {
        return `${awsConfig.s3PublicBaseUrl.replace(/\/$/, '')}/${encodedKey}`;
    }
    return `https://${awsConfig.s3Bucket}.s3.${awsConfig.region}.amazonaws.com/${encodedKey}`;
}

export async function uploadOriginalPostImage(file) {
    requireS3Configuration();
    const objectKey = `originals/posts/${safeFileName(file.originalname)}`;

    await s3Client.send(
        new PutObjectCommand({
            Bucket: awsConfig.s3Bucket,
            Key: objectKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        })
    );

    return { objectKey, originalUrl: buildPublicObjectUrl(objectKey) };
}
