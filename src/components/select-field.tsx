import type { ReactNode } from 'react';

import { Label, Select, TextField } from 'heroui-native';

import { useTheme } from '@/lib/hooks/use-theme';

export type SelectOption = { label: string; value: string } | undefined;

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
  const selectedOption = options.find(option => option.value === value) as SelectOption;

  return (
    <TextField>
      <Label style={{ color: colors.textMuted }}>{label}</Label>
      <Select
        value={selectedOption}
        onValueChange={option => onChange(option?.value ?? '')}
        presentation="bottom-sheet"
      >
        <Select.Trigger>
          <Select.Value placeholder={placeholder} />
          {trailing}
        </Select.Trigger>
        <Select.Portal>
          <Select.Overlay />
          <Select.Content presentation="bottom-sheet">
            {options.map(option => (
              <Select.Item key={option.value} value={option.value} label={option.label} />
            ))}
          </Select.Content>
        </Select.Portal>
      </Select>
    </TextField>
  );
}
