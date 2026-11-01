import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { iconSize, opacity, radius, touchTarget, useTheme } from '@/theme';

type Props = {
  // SF Symbol on iOS, Material Symbol on Android: { ios: 'xmark', android: 'close' }.
  icon: SymbolViewProps['name'];
  // Required: icon-only buttons have no visible text for screen readers.
  accessibilityLabel: string;
  onPress: () => void;
  variant?: 'filled' | 'plain';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = 'filled',
  disabled = false,
  style,
}: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'filled' && { backgroundColor: colors.surfaceRaised },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <SymbolView name={icon} tintColor={colors.text} size={iconSize.md} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: opacity.pressed },
  disabled: { opacity: opacity.disabled },
});
