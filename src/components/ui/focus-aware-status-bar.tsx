import { useIsFocused } from '@react-navigation/native';

import { Platform } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';

import { useTheme } from '@/lib/hooks/use-theme';

type Props = { hidden?: boolean };
export function FocusAwareStatusBar({ hidden = false }: Props) {
  const isFocused = useIsFocused();
  const { isDark } = useTheme();

  if (Platform.OS === 'web')
    return null;

  return isFocused
    ? (
        <SystemBars
          style={isDark ? 'light' : 'dark'}
          hidden={hidden}
        />
      )
    : null;
}
