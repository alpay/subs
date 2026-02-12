declare module 'lottie-react-native' {
  import type { ComponentType } from 'react';
  import type { ViewProps } from 'react-native';

  export interface LottieViewProps extends ViewProps {
    source: object | number;
    autoPlay?: boolean;
    loop?: boolean;
    speed?: number;
    progress?: number;
  }

  const LottieView: ComponentType<LottieViewProps>;

  export default LottieView;
}

