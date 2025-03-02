import importProductFile from './controller';

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayResponse> => {
  return await importProductFile();
};
