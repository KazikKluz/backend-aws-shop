import getProductById from './controller';

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayResponse> => {
  const id = event.pathParameters?.id;

  return await getProductById(id);
};
