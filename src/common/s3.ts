import { ICommonProps } from './index.js';

export interface IS3Props extends ICommonProps {
  bucket: string;
}

export const expectedProps = ['region', 'bucket', 'key'];
