import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { spacing, useTheme } from '@/theme';

type Props = {
  children: ReactNode;
  centered?: boolean;
  padded?: boolean;
  // Tab screens skip 'bottom': the tab bar already handles that inset.
  edges?: readonly Edge[];
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, centered, padded = true, edges = ['top'], style }: Props) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.container,
        { backgroundColor: colors.background },
        padded && styles.padded,
        centered && styles.centered,
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  padded: { padding: spacing.lg },
  centered: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
});
