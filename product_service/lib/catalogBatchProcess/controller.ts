import { SQSRecord } from 'aws-lambda';
import { v4 } from 'uuid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const dynamodbClient = new DynamoDBClient();
const db = DynamoDBDocumentClient.from(dynamodbClient);
const sns = new SNSClient();

const catalogBatchProcess = async (records: SQSRecord[]) => {
  try {
    for (const item of records) {
      let product;

      try {
        if (typeof item.body !== 'string') {
          throw new Error('Invalid record body. Expecting a string');
        }

        product = JSON.parse(item.body);

        if (
          !product ||
          typeof product.id !== 'string' ||
          typeof product.title !== 'string' ||
          typeof product.price !== 'number' ||
          typeof product.count !== 'number' ||
          (typeof product.description !== 'string' &&
            typeof product.description !== 'undefined' &&
            product.description !== null) ||
          product.count < 0 ||
          product.price <= 0
        ) {
          throw new Error('Invalid product data types');
        }

        const id = v4();

        const setProduct = {
          id: id,
          title: product.title,
          description: product.description,
          price: product.price,
        };

        const setStock = {
          product_id: id,
          count: product.count,
        };

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

        await db.send(new TransactWriteCommand(transaction));

        await sns.send(
          new PublishCommand({
            TopicArn: process.env.topic_arn,
            Message: `New product added: ${product.title}, price ${product.price}`,
            Subject: 'New products',
            MessageAttributes: {
              price: {
                DataType: 'Number',
                StringValue: product.price.toString(),
              },
            },
          })
        );
      } catch (err) {
        console.log(`Record not created: ${item.body}`, err);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Records processed' }),
    };
  } catch (error) {
    console.log(error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'internal server error' }),
    };
  }
};

export default catalogBatchProcess;
