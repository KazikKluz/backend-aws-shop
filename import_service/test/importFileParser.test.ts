import { S3Event } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
const { handler } = require('../lib/importFileParser');
import { sdkStreamMixin } from '@aws-sdk/util-stream';

const s3Mock = mockClient(S3Client);

describe('testing importFileParser', () => {
  beforeEach(() => {
    s3Mock.reset();
    jest.clearAllMocks();
  });

  it('should process CSV file', async () => {
    const mockCsvData =
      'id,title,description\n1,Phone,Smart Phone\n2,Tablet, Kindle Tablet';
    const mockStream = sdkStreamMixin(Readable.from([mockCsvData]));

    s3Mock.on(GetObjectCommand).resolves({
      Body: mockStream,
      $metadata: { httpStatusCode: 200 },
    });
    s3Mock.on(CopyObjectCommand).resolves({
      $metadata: { httpStatusCode: 200 },
    });
    s3Mock.on(DeleteObjectCommand).resolves({
      $metadata: { httpStatusCode: 200 },
    });

    const event: S3Event = {
      Records: [
        {
          s3: {
            bucket: {
              name: 'mock',
            },
            object: {
              key: 'uploaded/mock.csv',
            },
          },
        },
      ],
    } as any;

    const response = await handler(event);
    expect(response.statusCode).toBe(200);
  });

  it('should gracefully handle missing file body', async () => {
    s3Mock.on(GetObjectCommand).resolves({
      Body: undefined,
      $metadata: { httpStatusCode: 200 },
    });

    const event: S3Event = {
      Records: [
        {
          s3: {
            bucket: {
              name: 'mock',
            },
            object: {
              key: 'uploaded/mock.csv',
            },
          },
        },
      ],
    } as any;

    const response = await handler(event);
    expect(response.statusCode).toBe(500);
  });
  it('should handle S3 bucket related errors', async () => {
    s3Mock.on(GetObjectCommand).rejects(new Error('S3 bucket Error'));

    const event: S3Event = {
      Records: [
        {
          s3: {
            bucket: {
              name: 'mock',
            },
            object: {
              key: 'uploaded/mock.csv',
            },
          },
        },
      ],
    } as any;

    const response = await handler(event);
    expect(response.statusCode).toBe(500);
  });

  it('should handle malformed CSV data', async () => {
    const malformedData = ',csv\ndataasdpfasdoy';
    const mockStream = sdkStreamMixin(Readable.from([malformedData]));

    s3Mock.on(GetObjectCommand).resolves({
      Body: mockStream,
      $metadata: { httpStatusCode: 200 },
    });

    const event: S3Event = {
      Records: [
        {
          s3: {
            bucket: {
              name: 'mock',
            },
            object: {
              key: 'uploaded/mock.csv',
            },
          },
        },
      ],
    } as any;

    const response = await handler(event);
    expect(response.statusCode).toBe(200);
  });
});
