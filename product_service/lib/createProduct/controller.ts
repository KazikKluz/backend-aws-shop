import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { v4 } from 'uuid';

const db = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(db);

const createProduct = async (body: string | undefined) => {
  if (!body) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      },
      statusCode: 400,
      body: JSON.stringify({ message: 'no request body present' }),
    };
  }
  let newProduct;
  try {
    newProduct = JSON.parse(body);
  } catch (error) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT',
      },
      statusCode: 400,
      body: JSON.stringify({ message: 'invalid request structure' }),
    };
  }

  if (
    typeof newProduct.title !== 'string' ||
    typeof newProduct.description !== 'string' ||
    typeof newProduct.price !== 'number' ||
    typeof newProduct.count !== 'number'
  ) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT',
      },
      body: JSON.stringify({
        message: 'invalid data types.',
      }),
    };
  }

  if (
    !newProduct.title ||
    !newProduct.description ||
    newProduct.price === undefined ||
    newProduct.count === undefined
  ) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT',
      },
      body: JSON.stringify({
        message: 'missing required fields',
      }),
    };
  }

  const id = v4();

  const setProduct = {
    id: id,
    title: newProduct.title,
    description: newProduct.description,
    price: newProduct.price,
  };

  const setStock = {
    product_id: id,
    count: newProduct.count,
  };

  try {
    const transaction: TransactWriteCommandInput = {
      TransactItems: [
        {
          Put: {
            TableName: 'products',
            Item: setProduct,
          },
        },
        {
          Put: {
            TableName: 'stocks',
            Item: setStock,
          },
        },
      ],
    };

    await dynamoDB.send(new TransactWriteCommand(transaction));

    newProduct = {
      ...setProduct,
      count: setStock.count,
    };
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT',
      },
      body: JSON.stringify(newProduct),
    };
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.name === 'TransactionCanceledException'
    ) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT',
        },
        body: JSON.stringify({
          message: 'transaction failed',
          error: error.message,
        }),
      };
    }
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT',
      },
      body: JSON.stringify({
        message: 'Internal server error',
      }),
    };
  }
};

export default createProduct;
