import type { MessageType } from 'react-native-flash-message';

import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react-native';

import { Platform, StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import colors from './colors';

FlashMessage.setColorTheme({
  success: colors.success[600],
  info: '#2563EB',
  warning: colors.warning[600],
  danger: colors.danger[600],
});

export function AppFlashMessage() {
  return (
    <FlashMessage
      position="top"
      floating
      duration={2200}
      icon={{ icon: 'auto', position: 'left', props: {} }}
      style={styles.flashMessage}
      titleStyle={styles.flashMessageTitle}
      textStyle={styles.flashMessageText}
      renderFlashMessageIcon={(icon, style) => {
        if (typeof icon !== 'string')
          return null;
        const iconType = icon as MessageType;
        const IconComponent = iconType === 'success'
          ? CheckCircle2
          : iconType === 'warning'
            ? AlertTriangle
            : iconType === 'danger'
              ? XCircle
              : iconType === 'info'
                ? Info
                : null;
        if (!IconComponent)
          return null;
        return (
          <IconComponent
            size={16}
            color="#FFFFFF"
            style={style as object}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  flashMessage: {
    alignSelf: 'center',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 0,
    width: '90%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  flashMessageTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'sans-serif-medium',
      default: 'System',
    }),
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  flashMessageText: {
    textAlign: 'center',
  },
});
