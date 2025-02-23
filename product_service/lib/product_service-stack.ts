import * as cdk from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import path = require('path');
import * as gateway from 'aws-cdk-lib/aws-apigateway';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ID = 'backend-shop';

    const getProductsList = new NodejsFunction(this, `${ID}-getProductsList`, {
      entry: path.join(__dirname, 'getProductsList/index.ts'),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_20_X,
      bundling: {
        minify: true,
      },
    });

    const getProductsById = new NodejsFunction(this, `${ID}-getProductsById`, {
      entry: path.join(__dirname, 'getProductsById/index.ts'),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_20_X,
      bundling: {
        minify: true,
      },
    });

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
  }
}
