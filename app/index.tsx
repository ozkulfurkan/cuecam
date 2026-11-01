import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, spacing } from '@/theme';

// Temporary landing screen; replaced by the tab navigator in PRM-4.
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cue Cam</Text>
      <Text style={styles.subtitle}>Prompter</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.title,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.body,
  },
});
