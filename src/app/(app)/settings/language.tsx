import { SymbolView } from 'expo-symbols';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { NativeSheet } from '@/components/native-sheet';
import { Haptic } from '@/lib/haptics';
import { useSelectedLanguage } from '@/lib/i18n/utils';
import { useTheme } from '@/lib/hooks/use-theme';
import { LANGUAGE_NAMES, type Language } from '@/lib/i18n/resources';

const LANGUAGES: Language[] = ['en', 'tr'];

export default function LanguageScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { language: currentLanguage, setLanguage } = useSelectedLanguage();

  const handleSelect = useCallback(
    (lang: Language) => {
      Haptic.Light();
      setLanguage(lang);
    },
    [setLanguage],
  );

  return (
    <NativeSheet
      title={t('language.select_title')}
      showCloseIcon={false}
      showBackIcon
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 8 }}>
          {LANGUAGES.map(lang => (
            <LanguageRow
              key={lang}
              lang={lang}
              label={LANGUAGE_NAMES[lang]}
              isSelected={currentLanguage === lang}
              onSelect={() => handleSelect(lang)}
              colors={colors}
            />
          ))}
        </View>
      </ScrollView>
    </NativeSheet>
  );
}

type LanguageRowProps = {
  lang: Language;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  colors: Record<string, string>;
};

function LanguageRow({
  label,
  isSelected,
  onSelect,
  colors,
}: LanguageRowProps) {
  return (
    <Pressable
      onPress={onSelect}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingRight: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.surfaceBorder,
        },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            color: colors.text,
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      {isSelected && (
        <SymbolView
          name="checkmark"
          size={20}
          tintColor={colors.accent}
        />
      )}
    </Pressable>
  );
}
