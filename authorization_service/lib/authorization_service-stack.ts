import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import path = require('path');
import * as iam from 'aws-cdk-lib/aws-iam';

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ID = 'backend-shop';
    const username = 'KazikKluz';

    const basicAuthorizer = new NodejsFunction(this, `${ID}-basicAuthorizer`, {
      entry: path.join(__dirname, `basicAuthorizer/index.ts`),
      handler: 'index.handler',
      environment: {
        [username]: 'TEST_PASSWORD',
      },
      runtime: Runtime.NODEJS_20_X,
      bundling: {
        minify: true,
      },
    });

    basicAuthorizer.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ['lambda:InvokeFunction'],
        resources: ['*'],
      })
    );

    basicAuthorizer.addPermission('ApiGatewayInvokeFunction', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:*`,
    });
  }
}
