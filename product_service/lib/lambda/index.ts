import responseHelper from './responseHelper';
import getProductList from './getProductList';

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

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayResponse> => {
  const products = await getProductList();
  return responseHelper(200, products);
};
