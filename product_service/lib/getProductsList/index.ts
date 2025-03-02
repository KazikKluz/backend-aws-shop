import getProductsList from './controller';

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayResponse> => {
  console.log('getProductsList request', {
    path: event.path,
    method: event.httpMethod,
    parameters: event.pathParameters,
    body: event.body,
  });
  return await getProductsList();
};
