const { handler: getProductsListHandler } = require('../lib/getProductsList');

describe('getProductsList handler basic unit test', () => {
  it('should return list of products', async () => {
    const event = {} as Partial<APIGatewayEvent> as APIGatewayEvent;
    const result = await getProductsListHandler(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toEqual({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
    });

    const body = JSON.parse(result.body);

    body.forEach((product: Product) => {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('title');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('price');
      expect(typeof product.id).toBe('string');
      expect(typeof product.title).toBe('string');
      expect(typeof product.price).toBe('number');
    });
  });
});
