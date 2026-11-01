import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { CameraPermissionGate } from '@/features/camera/CameraPermissionGate';
import { spacing, textStyles, useTheme } from '@/theme';

// Full-screen recorder. Camera preview arrives in PRM-8, recording in PRM-9.
export default function RecordScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <Screen centered edges={['top', 'bottom']}>
      <StatusBar hidden />
      <CameraPermissionGate>
        <Text style={[textStyles.title, { color: colors.text }]}>Camera ready</Text>
      </CameraPermissionGate>
      <Button
        label="Close"
        variant="secondary"
        onPress={() => router.back()}
        style={styles.close}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { marginTop: spacing.lg, alignSelf: 'stretch' },
});
