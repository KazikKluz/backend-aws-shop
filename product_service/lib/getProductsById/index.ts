import getProductsById from './controller';

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayResponse> => {
  const id = event.pathParameters?.id;

  return await getProductsById(id);
};
