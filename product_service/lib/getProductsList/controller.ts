import data from '../utils/mockData';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const db = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(db);

const getProductsList = async () => {
  try {
    const { Items: products } = await dynamoDB.send(
      new ScanCommand({ TableName: 'products' })
    );

    const { Items: stocks } = await dynamoDB.send(
      new ScanCommand({ TableName: 'stocks' })
    );

    const joined = products?.map((products_item) => {
      const stock_item = stocks?.find(
        (item) => item.product_id === products_item.id
      );
      const { id, title, description, price } = products_item;
      return {
        id,
        title,
        description,
        price,
        count: stock_item ? stock_item.count : 0,
      };
    });

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

export default getProductsList;
