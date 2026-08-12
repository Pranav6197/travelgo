import { awsConfig } from '../config/aws.js';
import { uploadOriginalPostImage } from './s3.service.js';
import { queueImageEnhancement } from './sqs.service.js';

export const IMAGE_STATUS = Object.freeze({
    READY: 'READY',
    PROCESSING: 'PROCESSING',
    FAILED: 'FAILED',
});

export const renderImageUrl = (imageAsset) =>
    imageAsset?.imageStatus === IMAGE_STATUS.READY && imageAsset.processedUrl
        ? imageAsset.processedUrl
        : imageAsset?.originalUrl;

export function renderImageUrls(imageAssets = []) {
    return imageAssets.map(renderImageUrl).filter(Boolean);
}

export async function createPostImageAssets(files, enhancementRequested) {
    return Promise.all(
        files.map(async (file) => {
            const { objectKey, originalUrl } = await uploadOriginalPostImage(file);
            return {
                originalUrl,
                originalKey: objectKey,
                processedUrl: null,
                processedKey: null,
                imageStatus: enhancementRequested ? IMAGE_STATUS.PROCESSING : IMAGE_STATUS.READY,
                enhancementRequested,
                processedAt: null,
            };
        })
    );
}

export async function dispatchPostImageEnhancements(post, imageAssets = post.imageAssets) {
    const jobs = (imageAssets || [])
        .filter(
            (asset) =>
                asset?._id &&
                asset.enhancementRequested &&
                asset.imageStatus === IMAGE_STATUS.PROCESSING &&
                asset.originalKey,
        )
        .map((asset) =>
            queueImageEnhancement({
                postId: post?._id?.toString(),
                userId: post?.authorId?.toString(),
                bucket: awsConfig.s3Bucket,
                objectKey: asset.originalKey,
                imageType: 'post',
                imageAssetId: asset._id.toString(),
                enhancementRequested: true,
            })
        );
    return Promise.all(jobs);
}
