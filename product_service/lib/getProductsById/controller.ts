import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const db = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(db);

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
    const { Item: product } = await dynamoDB.send(
      new GetCommand({ TableName: 'products', Key: { id: id } })
    );

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

    const { Item: stock_item } = await dynamoDB.send(
      new GetCommand({ TableName: 'stocks', Key: { product_id: id } })
    );

    const joined = {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      count: stock_item ? stock_item.count : 0,
    };
    return {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      statusCode: 200,
      body: JSON.stringify(joined),
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
