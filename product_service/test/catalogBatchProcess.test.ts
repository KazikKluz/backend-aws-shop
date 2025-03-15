import { SQSRecord } from 'aws-lambda';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SNSClient } from '@aws-sdk/client-sns';

const { handler: catalogBatchProcess } = require('../lib/catalogBatchProcess');
import { v4 } from 'uuid';

jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('@aws-sdk/client-sns');
jest.mock('uuid');

describe('catalogBatchProcess', () => {
  const mockSend = jest.fn();
  const mockSNSSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (DynamoDBDocumentClient.from as jest.Mock).mockReturnValue({
      send: mockSend,
    });
    (SNSClient as jest.Mock).mockImplementation(() => ({ send: mockSNSSend }));
    (v4 as jest.Mock).mockReturnValue('test-uuid');
  });

  it('should process valid records successfully', async () => {
    const records: SQSRecord[] = [
      {
        body: JSON.stringify({
          title: 'Test Product',
          description: 'Test Description',
          price: 100,
          count: 5,
        }),
      } as SQSRecord,
    ];

    mockSend.mockResolvedValueOnce({});
    mockSNSSend.mockResolvedValueOnce({});

    const result = await catalogBatchProcess({ Records: records });

    expect(result.statusCode).toBe(200);
  });

  it('should handle invalid record body', async () => {
    const records = [
      {
        body: null,
      } as unknown as SQSRecord,
    ];

    const result = await catalogBatchProcess(records);

    expect(result.statusCode).toBe(500);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should handle invalid product data', async () => {
    const records: SQSRecord[] = [
      {
        body: JSON.stringify({
          title: '',
          price: 'invalid',
          count: 'invalid',
        }),
      } as SQSRecord,
    ];

    const result = await catalogBatchProcess(records);

    expect(result.statusCode).toBe(500);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should handle DynamoDB errors', async () => {
    const records: SQSRecord[] = [
      {
        body: JSON.stringify({
          title: 'Test Product',
          description: 'Test Description',
          price: 100,
          count: 5,
        }),
      } as SQSRecord,
    ];

    mockSend.mockRejectedValueOnce(new Error('DynamoDB error'));

    const result = await catalogBatchProcess(records);

    expect(result.statusCode).toBe(500);
  });
});
