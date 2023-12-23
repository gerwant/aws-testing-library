import { ICommonProps } from './index.js';

export interface IStepFunctionsProps extends ICommonProps {
  stateMachineArn: string;
}

export const expectedProps = ['region', 'stateMachineArn', 'state'];
