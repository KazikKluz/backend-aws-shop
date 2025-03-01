interface APIGatewayEvent {
  httpMethod: string;
  path: string;
  body?: string;
  queryStringParameters?: { [key: string]: string | null } | null;
  pathParameters: { [key: string]: string | undefined } | null;
}

interface APIGatewayResponse {
  statusCode: number;
  body: string;
  headers?: { [key: string]: string };
}

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
};

type Stock = {
  product_id: string;
  count: number;
};

type Products = {
  products: Product[];
};
