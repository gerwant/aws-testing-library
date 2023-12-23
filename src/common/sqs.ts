import { ICommonProps } from './index.js';

export interface ISqsProps extends ICommonProps {
  queueUrl: string;
}

export const expectedProps = ['region', 'queueUrl', 'matcher'];
