import catalogBatchProcess from './controller';
import { SQSEvent } from 'aws-lambda';

exports.handler = async (event: SQSEvent) => {
  console.log('received SQS messages', event.Records);
  return await catalogBatchProcess(event.Records);
};
