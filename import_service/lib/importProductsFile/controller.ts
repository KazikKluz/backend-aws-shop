import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const REGION = process.env.REGION ?? 'eu-west-1';
const BUCKET = process.env.BUCKET ?? 'import-bucket-s8d7f6';

const importProductsFile = async (filename: string | undefined) => {
  if (!filename) {
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
      statusCode: 400,
      body: JSON.stringify({ message: 'no query parameter present' }),
    };
  }

  try {
    const client = new S3Client({ region: REGION });

    const path = `uploaded/${filename}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: path,
      ContentType: 'text/csv',
    });

    const url = await getSignedUrl(client, command, { expiresIn: 60 });

    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
      statusCode: 200,
      body: url,
    };
  } catch (err) {
    console.error('Generating signed url failure', err);
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      },
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

export default importProductsFile;
