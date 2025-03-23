import basicAuthorizer from './controller';

exports.handler = async (event: S3Event): Promise<APIGatewayResponse> => {
  console.log('importFileParser request', {
    records: event.Records,
  });

  return await basicAuthorizer();
};
