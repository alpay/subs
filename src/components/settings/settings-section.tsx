import { SwiftUI } from '@mgcrea/react-native-swiftui';
import type { ReactNode } from 'react';
import { View } from 'react-native';

const DEFAULT_MIN_HEIGHT = 150;

type SettingsSectionProps = {
  header?: string;
  footer?: string;
  minHeight?: number;
  children: ReactNode;
};

export function SettingsSection({
  header = '',
  footer = '',
  minHeight = DEFAULT_MIN_HEIGHT,
  children,
}: SettingsSectionProps) {
  return (
    <View style={{ marginBottom: 20 }}>
      <SwiftUI style={{ flex: 1, minHeight }}>
        <SwiftUI.Form scrollDisabled contentMargins={{ leading: 1, trailing: 1 }}>
          <SwiftUI.Section header={header} footer={footer}>
            {children}
          </SwiftUI.Section>
        </SwiftUI.Form>
      </SwiftUI>
    </View>
  );
}
