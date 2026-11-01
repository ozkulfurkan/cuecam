import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { opacity, radius, spacing, textStyles, touchTarget, useTheme, type Palette } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'record';

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

function variantColors(variant: ButtonVariant, colors: Palette) {
  switch (variant) {
    case 'primary':
      return { background: colors.accent, text: colors.onAccent, border: colors.accent };
    case 'record':
      return { background: colors.record, text: colors.onRecord, border: colors.record };
    case 'secondary':
      return { background: colors.surfaceRaised, text: colors.text, border: colors.border };
    case 'ghost':
      return { background: 'transparent', text: colors.text, border: 'transparent' };
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityHint,
  style,
}: Props) {
  const { colors } = useTheme();
  const tone = variantColors(variant, colors);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: tone.background, borderColor: tone.border },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[textStyles.label, { color: tone.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: opacity.pressed },
  disabled: { opacity: opacity.disabled },
});
