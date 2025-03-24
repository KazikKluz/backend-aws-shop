import { APIGatewayAuthorizerResult } from 'aws-lambda';

import * as dotenv from 'dotenv';

dotenv.config();

const attachPolicy = (
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string
): APIGatewayAuthorizerResult => {
  return {
    principalId: principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};

const basicAuthorizer = async (token: string, arn: string) => {
  console.log('Event: ', JSON.stringify(token));

  if (!token) {
    return {
      isAuthorized: false,
    } as unknown as APIGatewayAuthorizerResult;
  }

  const encodedCredentials = token.split(' ')[1];
  const buffer = Buffer.from(encodedCredentials, 'base64');
  console.log(buffer);

  const credentials = buffer.toString('utf-8').split(':');
  const username = credentials[0];
  const password = credentials[1];

  console.log('username:', username);
  console.log('password:', password);

  const savedPassword = process.env[username];
  console.log('saved password:', savedPassword);

  const effect =
    !savedPassword || savedPassword !== password ? 'Deny' : 'Allow';

  return attachPolicy('user', effect, arn);
};

export default basicAuthorizer;
