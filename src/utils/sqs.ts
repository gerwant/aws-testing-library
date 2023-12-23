import { SNS } from '@aws-sdk/client-sns';
import { SQS } from '@aws-sdk/client-sqs';
import { v1 as uuid } from 'uuid';

export type IMessageMatcher = (args: any) => boolean;

export const subscribeToTopic = async (region: string, topicArn: string) => {
  const sqs = new SQS({
    region,
  });
  const queueName = `TestNotificationTopicQueue-${uuid()}`;
  const { QueueUrl } = (await sqs
    .createQueue({
      Attributes: { VisibilityTimeout: '0' },
      QueueName: queueName,
    })) as { QueueUrl: string };

  const { Attributes } = (await sqs
    .getQueueAttributes({
      AttributeNames: ['QueueArn'],
      QueueUrl,
    })) as { Attributes: Record<string, string> };

  const { QueueArn } = Attributes;

  const policy = {
    Statement: [
      {
        Action: 'sqs:SendMessage',
        Condition: {
          ArnEquals: {
            'aws:SourceArn': topicArn,
          },
        },
        Effect: 'Allow',
        Principal: {
          AWS: '*',
        },
        Resource: QueueArn,
        Sid: 'TestNotificationTopicQueuePolicy',
      },
    ],
  };

  await sqs
    .setQueueAttributes({
      Attributes: { Policy: JSON.stringify(policy) },
      QueueUrl,
    });

  const sns = new SNS({
    region,
  });
  const { SubscriptionArn } = await sns
    .subscribe({ TopicArn: topicArn, Protocol: 'sqs', Endpoint: QueueArn });

  return { subscriptionArn: SubscriptionArn as string, queueUrl: QueueUrl };
};

export const unsubscribeFromTopic = async (
  region: string,
  subscriptionArn: string,
  queueUrl: string,
) => {
  const sqs = new SQS({
    region,
  });
  const sns = new SNS({
    region,
  });

  await sns.unsubscribe({ SubscriptionArn: subscriptionArn });
  await sqs.deleteQueue({ QueueUrl: queueUrl });
};

export const existsInQueue = async (
  region: string,
  queueUrl: string,
  matcher: IMessageMatcher,
) => {
  const sqs = new SQS({
    region,
  });
  const { Messages = [] } = await sqs
    .receiveMessage({ QueueUrl: queueUrl, WaitTimeSeconds: 20 });

  const messages = Messages.map((item) => JSON.parse(item.Body as string));

  const exists = messages.some(matcher);
  return exists;
};
