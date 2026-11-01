import { useLocalSearchParams, usePreventRemove, useRouter } from 'expo-router';
import { setStatusBarHidden, StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/IconButton';
import { CameraPermissionGate } from '@/features/camera/CameraPermissionGate';
import { Recorder } from '@/features/camera/Recorder';
import { useRecorderOrientationLock } from '@/features/camera/useRecorderOrientationLock';
import { prompterText, resolveRecorderScript } from '@/features/scripts/recorderScript';
import { useScripts } from '@/features/scripts/scriptStore';
import { useI18n } from '@/i18n/I18nProvider';
import { loadLastScriptId, saveLastScriptId } from '@/storage/scripts';
import { spacing, useTheme } from '@/theme';

// Full-screen recorder: the live camera fills the screen once permissions are
// granted; until then the permission prompt is shown. Opened with ?scriptId=…
// from the script list/editor, or without it from the Record tab.
export default function RecordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { scriptId } = useLocalSearchParams<{ scriptId?: string }>();
  const [lastUsedId] = useState(loadLastScriptId);
  const script = resolveRecorderScript(useScripts(), scriptId, lastUsedId);

  // Remember it so the Record tab reopens the same script next time.
  useEffect(() => {
    if (script) saveLastScriptId(script.id);
  }, [script]);
  const [recording, setRecording] = useState(false);

  // Leaving mid-recording would unmount the camera before the file is written.
  // This blocks every way out — the Android back button, iOS swipe-down and
  // router calls — until the recording has stopped; the user stops it first.
  usePreventRemove(recording, () => {});

  // Follows the phone while idle; frozen from the countdown to the end of a recording.
  useRecorderOrientationLock(recording);

  // Android shows the status bar again after the app returns from the
  // background (or a system dialog); hide it again. iOS keeps it hidden.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setStatusBarHidden(true, 'none');
    });
    return () => subscription.remove();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar hidden />
      <CameraPermissionGate>
        <Recorder text={prompterText(script, t('sample.script'))} onBusyChange={setRecording} />
      </CameraPermissionGate>
      {recording ? null : (
        <SafeAreaView edges={['top', 'left']} style={styles.close} pointerEvents="box-none">
          <IconButton
            icon={{ ios: 'xmark', android: 'close' }}
            accessibilityLabel={t('common.close')}
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
