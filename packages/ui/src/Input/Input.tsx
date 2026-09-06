import { theme } from '@workspace/theme';
import { useId, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Typography } from '../Typography/Typography';

export type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  error?: string;
  disabled?: boolean;
};

const colors = theme.colors.light;

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing[1],
  },
  field: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSize.base,
    color: colors.textPrimary,
  },
  focused: {
    borderColor: colors.primary,
  },
  errored: {
    borderColor: colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
});

export function Input({ label, error, disabled = false, onFocus, onBlur, ...rest }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = useId();

  return (
    <View style={styles.container}>
      {label ? (
        <Typography variant="label" nativeID={`${inputId}-label`}>
          {label}
        </Typography>
      ) : null}
      <TextInput
        accessibilityLabel={label}
        accessibilityLabelledBy={label ? `${inputId}-label` : undefined}
        accessibilityState={{ disabled }}
        editable={!disabled}
        placeholderTextColor={colors.textDisabled}
        style={[
          styles.field,
          isFocused && styles.focused,
          error && styles.errored,
          disabled && styles.disabled,
        ]}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        {...rest}
      />
      {error ? (
        <Typography variant="caption" color={colors.danger}>
          {error}
        </Typography>
      ) : null}
    </View>
  );
}
