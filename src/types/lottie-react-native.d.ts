declare module 'lottie-react-native' {
  import type { ComponentType } from 'react';
  import type { ViewProps } from 'react-native';

  export type LottieViewProps = {
    source: object | number;
    autoPlay?: boolean;
    loop?: boolean;
    speed?: number;
    progress?: number;
  } & ViewProps;

  const LottieView: ComponentType<LottieViewProps>;

  export default LottieView;
}
