import importFileParser from './controller';

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayResponse> => {
  console.log('importFileParser request', {
    path: event.path,
    method: event.httpMethod,
    parameters: event.pathParameters,
    query: event.queryStringParameters,
    body: event.body,
  });

  return await importFileParser();
};
