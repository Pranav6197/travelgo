import {
    AWS_REGION,
    AWS_S3_BUCKET,
    AWS_S3_PUBLIC_BASE_URL,
    AWS_SQS_ENHANCEMENT_QUEUE_URL,
} from './utils.js';

export const awsConfig = {
    region: AWS_REGION || 'ap-south-1',
    s3Bucket: AWS_S3_BUCKET,
    s3PublicBaseUrl: AWS_S3_PUBLIC_BASE_URL,
    enhancementQueueUrl: AWS_SQS_ENHANCEMENT_QUEUE_URL,
};

export function requireS3Configuration() {
    if (!awsConfig.s3Bucket) {
        throw new Error('AWS_S3_BUCKET must be configured before uploading images.');
    }
}

export function requireEnhancementQueueConfiguration() {
    if (!awsConfig.enhancementQueueUrl) {
        throw new Error('AWS_SQS_ENHANCEMENT_QUEUE_URL must be configured when enhancement is requested.');
    }
}
