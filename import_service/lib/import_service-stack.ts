import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import path = require('path');

import * as gateway from 'aws-cdk-lib/aws-apigateway';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ID = 'backend-shop';

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

    const myGateway = new gateway.RestApi(this, 'Imports', {
      restApiName: 'Import Service',
      defaultCorsPreflightOptions: {
        allowOrigins: gateway.Cors.ALL_ORIGINS,
        allowMethods: gateway.Cors.ALL_METHODS,
      },
    });

    const importProductsFileAPI = myGateway.root.addResource('import');
    importProductsFileAPI.addMethod(
      'GET',
      new gateway.LambdaIntegration(importProductsFile)
    );

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
