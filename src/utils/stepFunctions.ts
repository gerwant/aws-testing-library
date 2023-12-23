import { ExecutionStatus, HistoryEvent, SFN } from '@aws-sdk/client-sfn';

const getExecutions = async (
  region: string,
  stateMachineArn: string,
  statusFilter?: ExecutionStatus,
) => {
  const stepFunctions = new SFN({
    region,
  });
  const opts = {
    maxResults: 1,
    stateMachineArn,
    ...(statusFilter && { statusFilter }),
  };
  const result = await stepFunctions.listExecutions(opts);

  const { executions } = result;

  return executions;
};

const RUNNING = 'RUNNING';

export const getEventName = (event: HistoryEvent) => {
  const { name } = event.stateEnteredEventDetails ||
    event.stateExitedEventDetails || {
      name: undefined,
    };
  return name;
};

export const getCurrentState = async (
  region: string,
  stateMachineArn: string,
) => {
  const executions = await getExecutions(region, stateMachineArn, RUNNING);
  if (executions && executions.length > 0) {
    const newestRunning = executions[0]; // the first is the newest one

    const stepFunctions = new SFN({
      region,
    });
    const { executionArn } = newestRunning;
    const { events } = await stepFunctions
      .getExecutionHistory({ executionArn, reverseOrder: true, maxResults: 1 });
    // TODO: Maybe reverse this if?
    if (events && events.length > 0) {
      const newestEvent = events[0];
      const name = getEventName(newestEvent);
      return name;
    } else {
      return undefined;
    }
  }
  return undefined;
};

export const getStates = async (region: string, stateMachineArn: string) => {
  const executions = await getExecutions(region, stateMachineArn);
  if (executions && executions.length > 0) {
    const newestRunning = executions[0]; // the first is the newest one

    const stepFunctions = new SFN({
      region,
    });
    const { executionArn } = newestRunning;
    const { events } = await stepFunctions
      .getExecutionHistory({ executionArn, reverseOrder: true });
    const names = events?.map((event) => getEventName(event))
      .filter((name) => !!name);
    return names;
  }
  return [];
};

export const stopRunningExecutions = async (
  region: string,
  stateMachineArn: string,
) => {
  const stepFunctions = new SFN({
    region,
  });
  const executions = await getExecutions(region, stateMachineArn, RUNNING);

  await Promise.all(
    executions?.map(({ executionArn }) =>
      stepFunctions.stopExecution({ executionArn }),
    ) || [],
  );
};
