import csv = require('csv-parser');
import { Readable } from 'stream';

import {
  GetObjectCommand,
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { S3EventRecord } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const REGION = process.env.REGION ?? 'eu-west-1';
const BUCKET = process.env.BUCKET ?? 'import-bucket-s8d7f6';

const importFileParser = async (records: S3EventRecord[]) => {
  const client = new S3Client({ region: REGION });
  const sqs = new SQSClient({ region: REGION });

  try {
    for (const file of records) {
      const path = file.s3.object.key;

      const result = client.send(
        new GetObjectCommand({ Bucket: BUCKET, Key: path })
      );

      const s3stream = (await result).Body as Readable;

      await new Promise((resolve, reject) => {
        s3stream
          .pipe(csv())
          .on('data', async (record) => {
            console.log(`Record: ${JSON.stringify(record)}`);
            return await sqs.send(
              new SendMessageCommand({
                QueueUrl:
                  'https://sqs.eu-west-1.amazonaws.com/637423385007/catalogItemsQueue',
                MessageBody: JSON.stringify({
                  title: record.title,
                  description: record.description,
                  price: Number(record.price),
                  count: Number(record.count),
                }),
              })
            );
          })
          .on('error', (err) => {
            reject(err);
          })
          .on('end', async () => {
            await client.send(
              new CopyObjectCommand({
                Bucket: BUCKET,
                CopySource: `${BUCKET}/${path}`,
                Key: path.replace('uploaded', 'parsed'),
              })
            );

            await client.send(
              new DeleteObjectCommand({
                Bucket: BUCKET,
                Key: path,
              })
            );

            resolve((value: unknown): void => {});
          });
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File parsed successfully' }),
    };
  } catch (err) {
    console.error('Error while executing importFileParser lambda', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

export default importFileParser;
