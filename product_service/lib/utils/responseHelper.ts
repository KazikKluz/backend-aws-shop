type products = {
  products: {
    id: string;
    title: string;
    description: string;
    price: number;
  }[];
};

const responseHelper = (code: number, data: string | products) => {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
    },
    statusCode: code,
    body: JSON.stringify(data),
  };
};

export default responseHelper;
