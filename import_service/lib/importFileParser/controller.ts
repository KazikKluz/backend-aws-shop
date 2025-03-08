import csv = require('csv-parser');
import { Readable } from 'stream';

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3EventRecord } from 'aws-lambda';

const REGION = process.env.REGION ?? 'eu-west-1';
const BUCKET = process.env.BUCKET ?? 'import-bucket-s8d7f6';

const importFileParser = async (records: S3EventRecord[]) => {
  const client = new S3Client({ region: REGION });

  try {
    for (const file of records) {
      const path = file.s3.object.key;
      const params = {
        Bucket: BUCKET,
        Key: path,
      };

      const result = client.send(new GetObjectCommand(params));

      const s3stream = (await result).Body as Readable;

      await new Promise((res, rej) => {
        s3stream
          .pipe(csv())
          .on('data', (record) => console.log('Parsed record:', record))
          .on('error', (err) => {
            console.error('Error parsing record:', err);
            rej(err);
          })
          .on('end', () => res(null));
      });
    }

    return {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      statusCode: 200,
      body: JSON.stringify({ message: 'File parsed successfully' }),
    };
  } catch (err) {
    console.error('Error while executing importFileParser lambda', err);
    return {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

export default importFileParser;
