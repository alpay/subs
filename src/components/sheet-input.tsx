import type { ComponentProps, RefObject } from 'react';
import type {
  NativeSyntheticEvent,
  TextInput as RNTextInputType,
  TextInputFocusEventData,
} from 'react-native';

import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import { Input, TextArea } from 'heroui-native';
import { useCallback, useEffect, useRef } from 'react';
import { findNodeHandle, TextInput as RNTextInput } from 'react-native';

type InputProps = ComponentProps<typeof Input>;
type TextAreaProps = ComponentProps<typeof TextArea>;

type FocusEvent = NativeSyntheticEvent<TextInputFocusEventData>;

function useBottomSheetInputHandlers(ref: RefObject<RNTextInputType>) {
  const bottomSheetInternal = useBottomSheetInternal(true);
  const animatedKeyboardState = bottomSheetInternal?.animatedKeyboardState;
  const textInputNodesRef = bottomSheetInternal?.textInputNodesRef;
  const isEnabled = Boolean(animatedKeyboardState && textInputNodesRef);

  useEffect(() => {
    if (!isEnabled || !textInputNodesRef || !animatedKeyboardState) {
      return;
    }

    const componentNode = findNodeHandle(ref.current);
    if (!componentNode) {
      return;
    }

    if (!textInputNodesRef.current.has(componentNode)) {
      textInputNodesRef.current.add(componentNode);
    }

    return () => {
      const currentNode = findNodeHandle(ref.current);
      if (!currentNode) {
        return;
      }

      const keyboardState = animatedKeyboardState.get();
      if (keyboardState.target === currentNode) {
        animatedKeyboardState.set(state => ({
          ...state,
          target: undefined,
        }));
      }

      if (textInputNodesRef.current.has(currentNode)) {
        textInputNodesRef.current.delete(currentNode);
      }
    };
  }, [animatedKeyboardState, isEnabled, ref, textInputNodesRef]);

  const handleFocus = useCallback(
    (event: FocusEvent) => {
      if (!isEnabled || !animatedKeyboardState)
        return;
      animatedKeyboardState.set(state => ({
        ...state,
        target: event.nativeEvent.target,
      }));
    },
    [animatedKeyboardState, isEnabled],
  );

  const handleBlur = useCallback(
    (event: FocusEvent) => {
      if (!isEnabled || !animatedKeyboardState || !textInputNodesRef)
        return;

      const keyboardState = animatedKeyboardState.get();
      const currentFocusedInput = findNodeHandle(
        RNTextInput.State.currentlyFocusedInput(),
      );

      const shouldRemoveCurrentTarget = keyboardState.target === event.nativeEvent.target;
      const shouldIgnoreBlurEvent
        = currentFocusedInput && textInputNodesRef.current.has(currentFocusedInput);

      if (shouldRemoveCurrentTarget && !shouldIgnoreBlurEvent) {
        animatedKeyboardState.set(state => ({
          ...state,
          target: undefined,
        }));
      }
    },
    [animatedKeyboardState, isEnabled, textInputNodesRef],
  );

  return { handleFocus, handleBlur };
}

export function SheetInput({ onFocus, onBlur, ...props }: InputProps) {
  const inputRef = useRef<RNTextInputType>(null);
  const { handleFocus, handleBlur } = useBottomSheetInputHandlers(inputRef);

  const onFocusHandler = useCallback(
    (event: Parameters<NonNullable<InputProps['onFocus']>>[0]) => {
      handleFocus(event as FocusEvent);
      onFocus?.(event);
    },
    [handleFocus, onFocus],
  );

  const onBlurHandler = useCallback(
    (event: Parameters<NonNullable<InputProps['onBlur']>>[0]) => {
      handleBlur(event as FocusEvent);
      onBlur?.(event);
    },
    [handleBlur, onBlur],
  );

  return (
    <Input
      {...props}
      ref={inputRef}
      onFocus={onFocusHandler}
      onBlur={onBlurHandler}
    />
  );
}

export function SheetTextArea({ onFocus, onBlur, ...props }: TextAreaProps) {
  const inputRef = useRef<RNTextInputType>(null);
  const { handleFocus, handleBlur } = useBottomSheetInputHandlers(inputRef);

  const onFocusHandler = useCallback(
    (event: Parameters<NonNullable<TextAreaProps['onFocus']>>[0]) => {
      handleFocus(event as FocusEvent);
      onFocus?.(event);
    },
    [handleFocus, onFocus],
  );

  const onBlurHandler = useCallback(
    (event: Parameters<NonNullable<TextAreaProps['onBlur']>>[0]) => {
      handleBlur(event as FocusEvent);
      onBlur?.(event);
    },
    [handleBlur, onBlur],
  );

  return (
    <TextArea
      {...props}
      ref={inputRef}
      onFocus={onFocusHandler}
      onBlur={onBlurHandler}
    />
  );
}
