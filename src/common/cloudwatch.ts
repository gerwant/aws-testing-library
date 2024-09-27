import { ICommonProps } from './index.js';

export interface ICloudwatchProps extends ICommonProps {
  function?: string;
  startTime?: number;
  logGroupName?: string;
}

export const expectedProps = ['region', 'pattern'];
