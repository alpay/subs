import type { AppThemeId } from '@/lib/hooks/use-theme';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { NativeSheet } from '@/components/native-sheet';
import { Haptic } from '@/lib/haptics';
import { APP_THEME_COLORS, APP_THEMES, useTheme } from '@/lib/hooks/use-theme';

export default function ThemeSettingsScreen() {
  const { t } = useTranslation();
  const { isDark, appThemeId, setAppTheme } = useTheme();

  const handleSelect = (id: AppThemeId) => {
    Haptic.Light();
    setAppTheme(id);
  };

  return (
    <NativeSheet title={t('theme.title')} showCloseIcon={false} showBackIcon>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 16, paddingBottom: 32 }}>
          <Text
            style={{
              fontSize: 15,
              opacity: 0.8,
              marginBottom: 4,
            }}
            selectable
          >
            {t('theme.pick_vibe')}
          </Text>

          {APP_THEMES.map((theme) => {
            const palette = APP_THEME_COLORS[theme.id][isDark ? 'dark' : 'light'];
            const isSelected = appThemeId === theme.id;
            const themeName = t(`theme.options.${theme.id}.name`);
            const themeDescription = t(`theme.options.${theme.id}.description`);

            return (
              <Pressable
                key={theme.id}
                onPress={() => handleSelect(theme.id)}
                style={({ pressed }) => [
                  {
                    borderRadius: 18,
                    borderCurve: 'continuous',
                    padding: 14,
                    backgroundColor: palette.surface,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? palette.accent : palette.surfaceBorder,
                    shadowColor: '#000',
                    shadowOpacity: isSelected ? 0.2 : 0.1,
                    shadowRadius: isSelected ? 10 : 6,
                    shadowOffset: { width: 0, height: 4 },
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                    gap: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: '600',
                        color: palette.text,
                      }}
                      selectable
                    >
                      {themeName}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: palette.textMuted,
                        marginTop: 4,
                      }}
                      selectable
                    >
                      {themeDescription}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      borderCurve: 'continuous',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? palette.accent : palette.pill,
                    }}
                  >
                    {isSelected
                      ? (
                          <Image
                            source="sf:checkmark"
                            style={{ width: 16, height: 16 }}
                            tintColor={palette.iconOnColor}
                          />
                        )
                      : (
                          <View
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: palette.accent,
                            }}
                          />
                        )}
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    gap: 10,
                    marginTop: 4,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      height: 52,
                      borderRadius: 14,
                      borderCurve: 'continuous',
                      backgroundColor: palette.background,
                      borderWidth: 1,
                      borderColor: palette.surfaceBorder,
                      padding: 10,
                      justifyContent: 'space-between',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <View
                        style={{
                          width: 26,
                          height: 10,
                          borderRadius: 6,
                          backgroundColor: palette.accent,
                        }}
                      />
                      <View
                        style={{
                          width: 18,
                          height: 10,
                          borderRadius: 6,
                          backgroundColor: palette.pill,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 4,
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: palette.textMuted,
                        }}
                      />
                      <View
                        style={{
                          flex: 0.5,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: palette.surfaceMuted,
                        }}
                      />
                    </View>
                  </View>

                  <View
                    style={{
                      width: 70,
                      height: 52,
                      borderRadius: 14,
                      borderCurve: 'continuous',
                      backgroundColor: palette.accent,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        borderCurve: 'continuous',
                        backgroundColor: palette.iconOnColor,
                        opacity: 0.16,
                      }}
                    />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </NativeSheet>
  );
}
