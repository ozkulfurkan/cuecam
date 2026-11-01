import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '@/components/Button';
import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { spacing } from '@/theme';

// Real settings arrive in PRM-20.
export default function SettingsScreen() {
  const [crash, setCrash] = useState(false);

  // Throwing during render goes through React's error path, which Sentry.wrap
  // reports — the same path a real rendering bug would take.
  if (crash) throw new Error('Sentry test crash (dev only)');

  return (
    <PlaceholderScreen title="Settings">
      {__DEV__ ? (
        <Button
          label="Test crash"
          variant="record"
          accessibilityHint="Throws an error to check that Sentry receives it"
          onPress={() => setCrash(true)}
          style={styles.crash}
        />
      ) : null}
    </PlaceholderScreen>
  );
}

const styles = StyleSheet.create({
  crash: { marginTop: spacing.lg },
});
