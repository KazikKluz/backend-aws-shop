import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from 'aws-lambda';

import basicAuthorizer from './controller';

exports.handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log('basicAuthorizer event: ', JSON.stringify(event));

  return await basicAuthorizer(event.authorizationToken, event.methodArn);
};
