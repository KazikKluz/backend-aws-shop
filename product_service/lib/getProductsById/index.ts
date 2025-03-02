import getProductsById from './controller';

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayResponse> => {
  const id = event.pathParameters?.id;
  console.log('getProductByID request', {
    path: event.path,
    method: event.httpMethod,
    parameters: event.pathParameters,
    body: event.body,
  });

  return await getProductsById(id);
};
