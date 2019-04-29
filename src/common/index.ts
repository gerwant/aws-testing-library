export interface ICommonProps {
  region: string;
  timeout?: number;
  pollEvery?: number;
}

export const sleep = async (ms: number) => {
  return await new Promise(resolve => setTimeout(resolve, ms));
};

export const verifyProps = (props: any, expectedProps: string[]) => {
  for (const prop of expectedProps) {
    const value = props[prop];
    if (!value) {
      throw new Error(`Missing ${prop} from received props`);
    }
  }
};
