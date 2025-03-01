import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 } from 'uuid';

import { productsData } from './mockData';

const db = new DynamoDBClient();

const dynamoDB = DynamoDBDocumentClient.from(db);

const fillTables = async () => {
  console.log('Running script');
  try {
    const products = [];
    const stocks = [];
    for (const item of productsData) {
      const id = v4();

      products.push({ id, ...item });

      stocks.push({
        product_id: id,
        count: 13,
      });
    }

    for (const item of products) {
      await dynamoDB.send(
        new PutCommand({
          TableName: 'products',
          Item: item,
        })
      );
    }

    for (const item of stocks) {
      await dynamoDB.send(
        new PutCommand({
          TableName: 'stocks',
          Item: item,
        })
      );
    }

    console.log('Tables populated');
  } catch (error) {
    console.error('Populating tables was unsuccessful:', error);
    throw error;
  }
};

fillTables().catch((err) => {
  console.log(err);
  process.exit(1);
});
