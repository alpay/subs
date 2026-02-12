import type { ComponentProps } from 'react';

import { Input, TextArea } from 'heroui-native';

type InputProps = ComponentProps<typeof Input>;
type TextAreaProps = ComponentProps<typeof TextArea>;

export function SheetInput(props: InputProps) {
  return <Input {...props} />;
}

export function SheetTextArea(props: TextAreaProps) {
  return <TextArea {...props} />;
}
