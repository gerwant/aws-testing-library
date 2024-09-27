import filterObject from 'filter-obj';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { ICommonProps } from './index.js';

export interface IDynamoDbProps extends ICommonProps {
  table: string;
}

export const expectedProps = ['region', 'table', 'key'];

export const removeKeysFromItemForNonStrictComparison = (
  received: Record<string, AttributeValue>,
  expected: Record<string, AttributeValue>,
) => {
  return filterObject(received, (key) =>
    Object.prototype.hasOwnProperty.call(expected, key),
  );
};
