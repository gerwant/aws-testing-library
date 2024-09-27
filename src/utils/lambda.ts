import { Lambda } from '@aws-sdk/client-lambda';

export const invoke = async (
  region: string,
  functionName: string,
  payload?: any,
) => {
  const lambda = new Lambda({
    region,
  });

  const lambdaPayload = payload ? { Payload: JSON.stringify(payload) } : {};
  const params = {
    FunctionName: functionName,
    ...lambdaPayload,
  };

  const { Payload } = await lambda.invoke(params);
  return Payload ? JSON.parse(Payload.toString()) : undefined;
};
