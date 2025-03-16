import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import path = require('path');
import * as gateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ID = 'backend-shop';

    const products_table = dynamodb.Table.fromTableName(
      this,
      'products_table',
      'products'
    );

    const stocks_table = dynamodb.Table.fromTableName(
      this,
      'stocks_table',
      'stocks'
    );

    const createProductTopic = new sns.Topic(this, `${ID}-createProductTopic`, {
      topicName: 'createProductTopic',
    });

    createProductTopic.addSubscription(
      new subscriptions.EmailSubscription('kazik.kluz@gmail.com', {
        filterPolicy: {
          price: sns.SubscriptionFilter.numericFilter({
            greaterThanOrEqualTo: 100,
          }),
        },
        json: false,
      })
    );

    createProductTopic.addSubscription(
      new subscriptions.EmailSubscription('kazucha80@gmail.com', {
        filterPolicy: {
          price: sns.SubscriptionFilter.numericFilter({
            lessThan: 100,
          }),
        },
        json: false,
      })
    );

    const catalogItemsQueue = new sqs.Queue(this, `${ID}-catalogItemsQueue`, {
      queueName: 'catalogItemsQueue',
    });

    const getProductsList = new NodejsFunction(this, `${ID}-getProductsList`, {
      entry: path.join(__dirname, 'getProductsList/index.ts'),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_20_X,
      bundling: {
        minify: true,
      },
      environment: {
        products: products_table.tableName,
        stocks: stocks_table.tableName,
      },
    });

    const getProductsById = new NodejsFunction(this, `${ID}-getProductsById`, {
      entry: path.join(__dirname, 'getProductsById/index.ts'),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_20_X,
      bundling: {
        minify: true,
      },
      environment: {
        products: products_table.tableName,
        stocks: stocks_table.tableName,
      },
    });

    const createProduct = new NodejsFunction(this, `${ID}-createProduct`, {
      entry: path.join(__dirname, 'createProduct/index.ts'),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_20_X,
      bundling: {
        minify: true,
      },
      environment: {
        products: products_table.tableName,
        stocks: stocks_table.tableName,
      },
    });

    const catalogBatchProcess = new NodejsFunction(
      this,
      `${ID}-CatalogBatchProcess`,
      {
        entry: path.join(__dirname, 'catalogBatchProcess/index.ts'),
        handler: 'index.handler',
        runtime: Runtime.NODEJS_20_X,
        bundling: {
          minify: true,
        },
        environment: {
          topic_arn: createProductTopic.topicArn,
          products: products_table.tableName,
          stocks: stocks_table.tableName,
        },
      }
    );

    catalogBatchProcess.addEventSource(
      new lambdaEventSources.SqsEventSource(catalogItemsQueue, {
        batchSize: 5,
      })
    );

    products_table.grantReadData(getProductsList);
    products_table.grantReadData(getProductsById);
    products_table.grantWriteData(createProduct);
    products_table.grantWriteData(catalogBatchProcess);
    stocks_table.grantWriteData(catalogBatchProcess);
    stocks_table.grantReadData(getProductsList);
    stocks_table.grantReadData(getProductsById);
    stocks_table.grantWriteData(createProduct);

    createProductTopic.grantPublish(catalogBatchProcess);
    catalogItemsQueue.grantConsumeMessages(catalogBatchProcess);

    const myGateway = new gateway.RestApi(this, 'Products', {
      restApiName: 'Products Service',
      defaultCorsPreflightOptions: {
        allowOrigins: gateway.Cors.ALL_ORIGINS,
        allowMethods: gateway.Cors.ALL_METHODS,
      },
    });

    const getProductsListAPI = myGateway.root.addResource('products');
    getProductsListAPI.addMethod(
      'GET',
      new gateway.LambdaIntegration(getProductsList)
    );
    getProductsListAPI.addMethod(
      'POST',
      new gateway.LambdaIntegration(createProduct)
    );

    const getProductsByIdAPI = getProductsListAPI
      .addResource('{id}')
      .addMethod('GET', new gateway.LambdaIntegration(getProductsById));

    new cdk.CfnOutput(this, `${ID}-getProductList-output`, {
      value: getProductsList.addFunctionUrl({
        authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
      }).url,
    });

    new cdk.CfnOutput(this, `${ID}-getProduct-output`, {
      value: getProductsById.addFunctionUrl({
        authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
      }).url,
    });

    new cdk.CfnOutput(this, `${ID}-gateway`, {
      value: myGateway.url,
    });

    new cdk.CfnOutput(this, `{ID}-createProductTopicArn`, {
      value: createProductTopic.topicArn,
      exportName: 'createProductTopicArn',
    });
  }
}
