import type { ReactNode } from 'react';
import { Text } from 'react-native';

import { textStyles, useTheme } from '@/theme';

import { Screen } from './Screen';

type Props = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

// Stand-in for screens whose real content lands in later PRM items.
export function PlaceholderScreen({ title, subtitle, children }: Props) {
  const { colors } = useTheme();

  return (
    <Screen centered>
      <Text style={[textStyles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[textStyles.body, { color: colors.textMuted }]}>{subtitle}</Text>
      ) : null}
      {children}
    </Screen>
  );
}
