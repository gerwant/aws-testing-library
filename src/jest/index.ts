import { jest } from '@jest/globals'

import { IExpectedResponse } from '../common/api.js';
import { IRecordMatcher } from '../utils/kinesis.js';
import { IMessageMatcher } from '../utils/sqs.js';
import { toReturnResponse } from './api.js';
import { toHaveLog } from './cloudwatch.js';
import { toHaveItem } from './dynamoDb.js';
import { toHaveRecord } from './kinesis.js';
import { toHaveObject } from './s3.js';
import { toHaveMessage } from './sqs.js';
import { toBeAtState, toHaveState } from './stepFunctions.js';
import { wrapWithRetries } from './utils.js';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAtState: (state: string) => R;
      toHaveItem: (
        key: Record<string, any>,
        expectedItem?: Record<string, AttributeValue>,
        strict?: boolean,
      ) => R;
      toHaveLog: (pattern: string) => R;
      toHaveObject: (key: string, expectedItem?: Buffer) => R;
      toHaveRecord: (matcher: IRecordMatcher) => R;
      toHaveMessage: (matcher: IMessageMatcher) => R;
      toHaveState: (state: string) => R;
      toReturnResponse: (expected: IExpectedResponse) => R;
    }
  }
}

expect.extend({
  toBeAtState: wrapWithRetries(toBeAtState) as typeof toBeAtState,
  toHaveItem: wrapWithRetries(toHaveItem) as typeof toHaveItem,
  toHaveLog: wrapWithRetries(toHaveLog) as typeof toHaveLog,
  toHaveMessage: wrapWithRetries(toHaveMessage) as typeof toHaveMessage,
  toHaveObject: wrapWithRetries(toHaveObject) as typeof toHaveObject,
  toHaveRecord, // has built in timeout mechanism due to how kinesis consumer works
  toHaveState: wrapWithRetries(toHaveState) as typeof toHaveState,
  toReturnResponse, // synchronous so no need to retry
});

jest.setTimeout(60000);
