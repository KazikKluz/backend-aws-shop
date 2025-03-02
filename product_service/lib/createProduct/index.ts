import createProduct from './controller';

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayResponse> => {
  console.log('createProduct request', {
    path: event.path,
    method: event.httpMethod,
    parameters: event.pathParameters,
    body: event.body,
  });
  return await createProduct(event.body);
};
