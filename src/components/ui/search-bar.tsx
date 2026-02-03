import type { TextInputProps } from 'react-native';
import { Search, XCircle } from 'lucide-react-native';

import { useTranslation } from 'react-i18next';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/lib/hooks/use-theme';

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  containerClassName?: string;
} & TextInputProps;

export function SearchBar({
  value,
  onChangeText,
  onCancel,
  placeholder,
  autoFocus = false,
  containerClassName = 'mx-5',
  ...textInputProps
}: SearchBarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View className={`my-2 flex-row items-center ${containerClassName}`}>
      <View
        className="flex-1 flex-row items-center rounded-xl border px-4 py-2"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
        }}
      >
        <Search size={20} color={colors.secondaryText} />
        <TextInput
          className="ml-3 flex-1 text-base leading-[20px]"
          style={{ color: colors.text, paddingVertical: 0 }}
          placeholder={placeholder ?? t('common.search')}
          placeholderTextColor={colors.secondaryText}
          value={value}
          onChangeText={onChangeText}
          autoFocus={autoFocus}
          textAlignVertical="center"
          {...textInputProps}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <XCircle size={18} color={colors.secondaryText} />
          </TouchableOpacity>
        )}
      </View>

      {onCancel && (
        <TouchableOpacity onPress={onCancel} className="ml-3">
          <Text className="text-base font-medium" style={{ color: colors.primary }}>
            {t('common.cancel')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
