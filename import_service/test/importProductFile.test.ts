import { APIGatewayProxyEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
const { handler } = require('../lib/importProductsFile');
// Mock getSignedUrl
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

// Create S3 mock
const s3Mock = mockClient(S3Client);

describe('importProductsFile testing', () => {
  beforeEach(() => {
    s3Mock.reset();
    jest.clearAllMocks();
    (getSignedUrl as jest.Mock).mockResolvedValue('https://mockUrl.com');
  });

  it('returns code 400 when no query parameter present', async () => {
    const event = {
      queryStringParameters: null,
    } as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.headers).toEqual({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    });
    expect(JSON.parse(result.body)).toEqual({
      message: 'no query parameter present',
    });
  });

  it('returns signed URL when query parameter present', async () => {
    const mockSignedUrl = 'https://mockUrl.com';
    (getSignedUrl as jest.Mock).mockResolvedValue(mockSignedUrl);

    const event = {
      queryStringParameters: { name: 'mock.csv' },
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toEqual({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    });
    expect(result.body).toEqual(mockSignedUrl);

    expect(getSignedUrl).toHaveBeenCalledTimes(1);
    const [_, command, options] = (getSignedUrl as jest.Mock).mock.calls[0];

    expect(command.input).toEqual({
      Bucket: 'import-bucket-s8d7f6',
      Key: 'uploaded/mock.csv',
      ContentType: 'text/csv',
    });
    expect(options).toEqual({ expiresIn: 60 });
  });

  it('returns code 500 when an S3 bucket operation fails', async () => {
    (getSignedUrl as jest.Mock).mockRejectedValue(
      new Error('some S3 bucket error')
    );

    const event = {
      queryStringParameters: {
        name: 'mock.csv',
      },
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Internal server error',
    });
    expect(getSignedUrl).toHaveBeenCalledTimes(1);
    const [_, command] = (getSignedUrl as jest.Mock).mock.calls[0];
    expect(command.input).toEqual({
      Bucket: 'import-bucket-s8d7f6',
      Key: 'uploaded/mock.csv',
      ContentType: 'text/csv',
    });
  });
});
