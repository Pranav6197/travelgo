import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { awsConfig, requireEnhancementQueueConfiguration } from '../config/aws.js';

const sqsClient = new SQSClient({ region: awsConfig.region });

export async function queueImageEnhancement(message) {
    requireEnhancementQueueConfiguration();
    await sqsClient.send(
        new SendMessageCommand({
            QueueUrl: awsConfig.enhancementQueueUrl,
            MessageBody: JSON.stringify(message),
        })
    );
}
