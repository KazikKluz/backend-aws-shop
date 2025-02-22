import responseHelper from '../utils/responseHelper';
import getProductList from './controller';

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayResponse> => {
  const products = await getProductList();
  return responseHelper(200, products);
};
