/* eslint-disable better-tailwindcss/no-unknown-classes */
import type { TextProps, TextStyle } from 'react-native';
import type { TxKeyPath } from '@/lib/i18n';
import { useMemo } from 'react';
import { Text as NNText, StyleSheet } from 'react-native';

import { twMerge } from 'tailwind-merge';
import { translate } from '@/lib/i18n';

type Props = {
  className?: string;
  tx?: TxKeyPath;
} & TextProps;

export function Text({
  className = '',
  style,
  tx,
  children,
  ...props
}: Props) {
  const textStyle = useMemo(
    () =>
      twMerge(
        'font-inter text-base font-normal text-black dark:text-white',
        className,
      ),
    [className],
  );

  const nStyle = useMemo(
    () =>
      StyleSheet.flatten([
        style,
      ]) as TextStyle,
    [style],
  );
  return (
    <NNText className={textStyle} style={nStyle} {...props}>
      {tx ? translate(tx) : children}
    </NNText>
  );
}
