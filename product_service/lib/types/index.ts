interface APIGatewayEvent {
  httpMethod: string;
  path: string;
  body?: string;
  queryStringParameters?: { [key: string]: string };
}

interface APIGatewayResponse {
  statusCode: number;
  body: string;
  headers?: { [key: string]: string };
}
