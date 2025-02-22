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

    const getProductList = new NodejsFunction(this, `${ID}-getProductList`, {
      entry: path.join(__dirname, 'lambda/index.ts'),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_20_X,
    });

    const myGateway = new gateway.RestApi(this, 'Products', {
      restApiName: 'Products Service',
      defaultCorsPreflightOptions: {
        allowOrigins: gateway.Cors.ALL_ORIGINS,
        allowMethods: gateway.Cors.ALL_METHODS,
      },
    });

    new cdk.CfnOutput(this, `${ID}-getProductList-output`, {
      value: getProductList.addFunctionUrl({
        authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
      }).url,
    });
  }
}
