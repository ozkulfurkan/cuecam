import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text } from 'react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { colors, fontSize, spacing } from '@/theme';

// Full-screen recorder; camera and prompter arrive in Sprint 2–3.
export default function RecordScreen() {
  const router = useRouter();

  return (
    <>
      <StatusBar hidden />
      <PlaceholderScreen title="Record">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Text style={styles.closeLabel}>Close</Text>
        </Pressable>
      </PlaceholderScreen>
    </>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.lg,
    backgroundColor: colors.surface,
  },
  closeLabel: {
    color: colors.text,
    fontSize: fontSize.body,
  },
});
