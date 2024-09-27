import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { IExpectedResponse } from '../common/api.js';
import { IRecordMatcher } from '../utils/kinesis.js';
import { IMessageMatcher } from '../utils/sqs.js';

import api from './api.js';
import cloudwatch from './cloudwatch.js';
import dynamoDb from './dynamoDb.js';
import kinesis from './kinesis.js';
import s3 from './s3.js';
import sqs from './sqs.js';
import stepFunctions from './stepFunctions.js';

declare global {
  namespace Chai {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Assertion {
      response: (expected: IExpectedResponse) => Assertion;
      log: (pattern: string) => Assertion;
      item: (
        key: Record<string, any>,
        expectedItem?: Record<string, AttributeValue>,
        strict?: boolean,
      ) => Assertion;
      record: (matcher: IRecordMatcher) => Assertion;
      object: (key: string, expected?: Buffer) => Assertion;
      message: (matcher: IMessageMatcher) => Assertion;
      atState: (state: string) => Assertion;
      state: (state: string) => Assertion;
    }
  }
}

const awsTesting = function (this: any, chai: any, utils: any) {
  api(chai, utils);
  cloudwatch(chai);
  dynamoDb(chai, utils);
  kinesis(chai);
  s3(chai, utils);
  sqs(chai);
  stepFunctions(chai);
};

export default awsTesting;
