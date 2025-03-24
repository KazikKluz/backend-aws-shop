import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import path = require('path');
import * as lambda from 'aws-cdk-lib/aws-lambda';

import * as gateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as notification from 'aws-cdk-lib/aws-s3-notifications';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';

const BUCKET = process.env.BUCKET ?? 'import-bucket-s8d7f6';

export interface ImportServiceProps extends cdk.StackProps {
  stage?: string;
  basicAuthorizer: string;
}

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ImportServiceProps) {
    super(scope, id, props);

    const ID = 'backend-shop';

    const importBucket = s3.Bucket.fromBucketName(this, `${ID}-bucket`, BUCKET);

    const basicAuthorizer = lambda.Function.fromFunctionArn(
      this,
      'BasicAuthorizer',
      props.basicAuthorizer
    );

    const importProductsFile = new NodejsFunction(
      this,
      `${ID}-importProductsFile`,
      {
        entry: path.join(__dirname, `importProductsFile/index.ts`),
        handler: 'index.handler',
        runtime: Runtime.NODEJS_20_X,
        bundling: {
          minify: true,
        },
      }
    );

    const importFileParser = new NodejsFunction(
      this,
      `${ID}-importFileParser`,
      {
        entry: path.join(__dirname, `importFileParser/index.ts`),
        handler: 'index.handler',
        runtime: Runtime.NODEJS_20_X,
        bundling: {
          minify: true,
        },
      }
    );
    const catalogItemsQueue = sqs.Queue.fromQueueArn(
      this,
      `${ID}-catalogItemsQueue`,
      'arn:aws:sqs:eu-west-1:637423385007:catalogItemsQueue'
    );

    const servicePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'sqs:SendMessage',
        'sqs:ReceiveMessage',
        'sqs:DeleteMessage',
        'sqs:GetQueueAttributes',
        'sqs:GetQueueUrl',
        'sqs:ListQueues',
      ],
      resources: [catalogItemsQueue.queueArn],
      principals: [new iam.AccountRootPrincipal()],
    });

    importFileParser.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['sqs:SendMessage'],
        resources: [catalogItemsQueue.queueArn],
      })
    );

    catalogItemsQueue.addToResourcePolicy(servicePolicy);

    importBucket.grantRead(importProductsFile);
    importBucket.grantPut(importProductsFile);
    importBucket.grantReadWrite(importFileParser);
    importBucket.grantDelete(importFileParser);

    importBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new notification.LambdaDestination(importFileParser),
      { prefix: 'uploaded/' }
    );

    const myGateway = new gateway.RestApi(this, 'Imports', {
      restApiName: 'Import Service',
      defaultCorsPreflightOptions: {
        allowOrigins: gateway.Cors.ALL_ORIGINS,
        allowMethods: gateway.Cors.ALL_METHODS,
        allowHeaders: [
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'Content-Type',
        ],
      },
    });

    myGateway.addGatewayResponse('Unauthorized', {
      type: gateway.ResponseType.UNAUTHORIZED,
      statusCode: '401',
      templates: {
        'application/json': '{ "message": "Unauthorized" }',
      },
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'*'",
      },
    });

    myGateway.addGatewayResponse('Access Denied', {
      type: gateway.ResponseType.ACCESS_DENIED,
      statusCode: '403',
      templates: {
        'application/json': '{ "message": "Access denied" }',
      },
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'*'",
      },
    });

    const auth = new gateway.TokenAuthorizer(
      this,
      `${ID}-ImportApiAuthorizer`,
      {
        handler: basicAuthorizer,
        identitySource: gateway.IdentitySource.header('Authorization'),
        resultsCacheTtl: cdk.Duration.seconds(0),
      }
    );

    const importProductsIntegration = new gateway.LambdaIntegration(
      importProductsFile
    );

    const importProductsFileAPI = myGateway.root.addResource('import');

    importProductsFileAPI.addMethod('GET', importProductsIntegration, {
      authorizer: auth,
      authorizationType: gateway.AuthorizationType.CUSTOM,
    });

    new cdk.CfnOutput(this, `${ID}-importProductsFile-output`, {
      value: importProductsFile.addFunctionUrl({
        authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
      }).url,
    });

    new cdk.CfnOutput(this, `${ID}-gateway`, {
      value: myGateway.url,
    });
  }
}
