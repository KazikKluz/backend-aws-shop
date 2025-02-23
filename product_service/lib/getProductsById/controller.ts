import data from '../utils/mockData';

const getProductsById = async (id: string | undefined) => {
  if (!id) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      statusCode: 400,
      body: JSON.stringify({ message: 'path not exists' }),
    };
  }
  try {
    const product = data.products.find((prod) => prod.id === id);
    if (!product) {
      return {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        },
        statusCode: 404,
        body: JSON.stringify({ message: 'product not found' }),
      };
    }
    return {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      statusCode: 200,
      body: JSON.stringify({ products: [product] }),
    };
  } catch (error) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      statusCode: 500,
      body: JSON.stringify({ message: 'internal server error' }),
    };
  }
};

export default getProductsById;
