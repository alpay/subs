import type { ReactNode } from 'react';

import { Label, TextField } from 'heroui-native';
import { View } from 'react-native';

import { SelectPill, type SelectOption } from '@/components/select-pill';
import { useTheme } from '@/lib/hooks/use-theme';

type SelectFieldProps = {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  placeholder: string;
  onChange: (value: string) => void;
  trailing?: ReactNode;
};

export function SelectField({ label, value, options, placeholder, onChange, trailing }: SelectFieldProps) {
  const { colors } = useTheme();
  const selectedOption = options.find(option => option.value === value) as SelectOption | undefined;

  return (
    <TextField>
      <Label style={{ color: colors.textMuted }}>{label}</Label>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <SelectPill
            value={selectedOption}
            options={options}
            placeholder={placeholder}
            onValueChange={option => onChange(option?.value ?? '')}
            style={{ width: '100%', justifyContent: 'space-between' }}
            size="md"
          />
        </View>
        {trailing}
      </View>
    </TextField>
  );
}
