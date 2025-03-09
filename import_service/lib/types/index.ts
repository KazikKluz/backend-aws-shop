interface APIGatewayEvent {
  httpMethod: string;
  path: string;
  body?: string;
  queryStringParameters?: { [key: string]: string | undefined } | null;
  pathParameters: { [key: string]: string | undefined } | null;
}

interface APIGatewayResponse {
  statusCode: number;
  body: string;
  headers?: { [key: string]: string };
}
