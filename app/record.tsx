import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/Button';
import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { spacing } from '@/theme';

// Full-screen recorder; camera and prompter arrive in Sprint 2–3.
export default function RecordScreen() {
  const router = useRouter();

  return (
    <>
      <StatusBar hidden />
      <PlaceholderScreen title="Record">
        <Button
          label="Close"
          variant="secondary"
          onPress={() => router.back()}
          style={styles.close}
        />
      </PlaceholderScreen>
    </>
  );
}

const styles = StyleSheet.create({
  close: { marginTop: spacing.lg },
});
