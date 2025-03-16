const { handler: getProductsByIdHandler } = require('../lib/getProductsById');

describe('getProductsById handler basic unit test', () => {
  it('should return a single product by provided ID', async () => {
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

    expect(body).toHaveProperty('id', '002');
    expect(body).toHaveProperty('title', 'test2');
    expect(body).toHaveProperty('description', 'more description');
    expect(body).toHaveProperty('price', 11);
    expect(typeof body.id).toBe('string');
    expect(typeof body.title).toBe('string');
    expect(typeof body.price).toBe('number');
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
