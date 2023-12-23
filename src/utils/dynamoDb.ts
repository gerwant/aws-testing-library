import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB, KeySchemaElement } from '@aws-sdk/client-dynamodb';

function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

const itemToKey = (
  item: Record<string, any>,
  keySchema: KeySchemaElement[],
) => {
  let itemKey: Record<string, any> = {};
  keySchema.map((key) => {
    // TODO: Make it safe
    itemKey = { ...itemKey, [key.AttributeName!]: item[key.AttributeName!] };
  });
  return itemKey;
};

export const clearAllItems = async (region: string, tableName: string) => {
  // get the table keys
  const table = new DynamoDB({
    region,
  });
  const { Table = {} } = await table
    .describeTable({ TableName: tableName });

  const keySchema = Table.KeySchema || [];

  // get the items to delete
  const db = DynamoDBDocument.from(new DynamoDB({ region }));
  const scanResult = await db
    .scan({
      AttributesToGet: keySchema.map((key) => key.AttributeName!),
      TableName: tableName,
    });
  const items = scanResult.Items || [];

  if (items.length > 0) {
    for (const chunk of chunks(items, 25)) {
      const deleteRequests = chunk.map((item) => ({
        DeleteRequest: { Key: itemToKey(item, keySchema) },
      }));

      await db
        .batchWrite({ RequestItems: { [tableName]: deleteRequests } });
    }
  }
};

export const writeItems = async (
  region: string,
  tableName: string,
  items: Record<string, any>[],
) => {
  const db = DynamoDBDocument.from(new DynamoDB({ region }));
  const writeRequests = items.map((item) => ({
    PutRequest: { Item: item },
  }));

  await db
    .batchWrite({ RequestItems: { [tableName]: writeRequests } });
};

export const getItem = async (
  region: string,
  tableName: string,
  key: Record<string, any>,
) => {
  const db = DynamoDBDocument.from(new DynamoDB({ region }));
  const dbItem = await db.get({ TableName: tableName, Key: key });
  // Item is undefined if key not found
  return dbItem.Item;
};
