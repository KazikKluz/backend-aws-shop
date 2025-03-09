import { S3Event } from 'aws-lambda';
import importFileParser from './controller';

exports.handler = async (event: S3Event): Promise<APIGatewayResponse> => {
  console.log('importFileParser request', {
    records: event.Records,
  });

  return await importFileParser(event.Records);
};
