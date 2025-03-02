import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';

const { handler: getProductsByIdHandler } = require('../lib/getProductsById');
const mockDB = mockClient(DynamoDBDocumentClient);

describe('getProductsById handler basic unit test', () => {
  const logSpy = jest.spyOn(global.console, 'log').mockImplementation(() => {});
  const errorSpy = jest
    .spyOn(global.console, 'error')
    .mockImplementation(() => {});

  beforeEach(() => {
    mockDB.reset();
  });

  afterAll(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
  it('should return a single product by provided ID', async () => {
    const mockProduct: Product = getProducts()[0];
    const mockStock: Stock = {
      product_id: mockProduct.id,
      count: mockProduct.count,
    };
    const event = {
      pathParameters: { id: '002' },
    } as Partial<APIGatewayEvent> as APIGatewayEvent;
    const result = await getProductsByIdHandler(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toEqual({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
    });

    const body = JSON.parse(result.body);

    body.forEach((product: Product) => {
      expect(product).toHaveProperty('id', '002');
      expect(product).toHaveProperty('title', 'test2');
      expect(product).toHaveProperty('description', 'more description');
      expect(product).toHaveProperty('price', 11);
      expect(typeof product.id).toBe('string');
      expect(typeof product.title).toBe('string');
      expect(typeof product.price).toBe('number');
    });
  });

  it('should return error 404 when there is no product with a given id', async () => {
    const event = {
      pathParameters: { id: 'fakeId' },
    } as Partial<APIGatewayEvent> as APIGatewayEvent;

    const result = await getProductsByIdHandler(event);

    expect(result.statusCode).toBe(404);
    const body = JSON.parse(result.body);
    expect(body).toHaveProperty('message', 'product not found');
  });
});
