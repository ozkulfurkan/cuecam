import { usePreventRemove, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/IconButton';
import { CameraPermissionGate } from '@/features/camera/CameraPermissionGate';
import { Recorder } from '@/features/camera/Recorder';
import { spacing, useTheme } from '@/theme';

// Full-screen recorder: the live camera fills the screen once permissions are
// granted; until then the permission prompt is shown.
export default function RecordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [recording, setRecording] = useState(false);

  // Leaving mid-recording would unmount the camera before the file is written.
  // This blocks every way out — the Android back button, iOS swipe-down and
  // router calls — until the recording has stopped; the user stops it first.
  usePreventRemove(recording, () => {});

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar hidden />
      <CameraPermissionGate>
        <Recorder onBusyChange={setRecording} />
      </CameraPermissionGate>
      {recording ? null : (
        <SafeAreaView edges={['top']} style={styles.close} pointerEvents="box-none">
          <IconButton
            icon={{ ios: 'xmark', android: 'close' }}
            accessibilityLabel="Close"
            onPress={() => router.back()}
          />
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  close: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: spacing.md,
  },
});
