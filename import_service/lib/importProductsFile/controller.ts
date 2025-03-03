import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const importProductsFile = async (filename: string | undefined) => {
  if (!filename) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      statusCode: 400,
      body: JSON.stringify({ message: 'no query parameter present' }),
    };
  }

  const path = `uploaded/${filename}`;

  const createPresignedUrlWithClient = ({ region, bucket, key }) => {
    const client = new S3Client({ region });
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 60 });
  };

  return Promise.resolve({
    statusCode: 200,
    body: '',
  });
};

export default importProductsFile;
