import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { radius, spacing, textStyles, touchTarget, useTheme } from '@/theme';

/** Single-line themed input. Pass any TextInput prop through. */
export function TextField({ style, ...props }: TextInputProps) {
  const { colors } = useTheme();

  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      selectionColor={colors.accent}
      {...props}
      style={[
        textStyles.body,
        styles.field,
        { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
