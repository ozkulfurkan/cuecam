import { useEffect, useMemo, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { CommonResolutions, useCameraDevices, useVideoOutput } from 'react-native-vision-camera';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { radius, spacing, textStyles, useTheme } from '@/theme';

import { CameraPreview } from './CameraPreview';
import { saveResultMessage, type SaveResult } from './gallery';
import { canSwitchPosition, DEFAULT_POSITION, otherPosition, type LensPosition } from './preview';
import { RecordButton } from './RecordButton';
import { formatDuration, isRecordingBusy, type FinishedRecording } from './recording';
import { saveToGallery } from './saveToGallery';
import { useVideoRecording } from './useVideoRecording';

type SaveStatus = { kind: 'saving' } | SaveResult;

type Props = {
  /** Reports when recording starts/ends so the screen can lock its own controls. */
  onBusyChange?: (busy: boolean) => void;
};

/** Live preview with lens switch, record button and elapsed time. */
export function Recorder({ onBusyChange }: Props) {
  const { colors } = useTheme();
  const [position, setPosition] = useState<LensPosition>(DEFAULT_POSITION);
  const canSwitch = canSwitchPosition(useCameraDevices().map((device) => device.position));

  // 1080p video with audio in the same file; the recorder keeps them in sync.
  const videoOutput = useVideoOutput({
    targetResolution: CommonResolutions.FHD_16_9,
    enableAudio: true,
  });
  // A stable array: a new one each render would reconfigure the camera session
  // on every timer tick while recording.
  const outputs = useMemo(() => [videoOutput], [videoOutput]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>();
  const saveRecording = async (recording: FinishedRecording) => {
    setSaveStatus({ kind: 'saving' });
    setSaveStatus(await saveToGallery(recording.path));
  };
  const { state, elapsedSeconds, start, stop } = useVideoRecording(videoOutput, {
    onFinished: saveRecording,
  });
  const busy = isRecordingBusy(state);
  const isRecording = state.status === 'recording';

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <CameraPreview position={position} outputs={outputs} />

      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="box-none">
        {busy ? (
          <View
            accessibilityRole="timer"
            accessibilityLabel={`Recording, ${formatDuration(elapsedSeconds)}`}
            style={[styles.timer, { backgroundColor: colors.record }]}
          >
            <Text style={[textStyles.label, { color: colors.onRecord }]}>
              {formatDuration(elapsedSeconds)}
            </Text>
          </View>
        ) : null}
      </SafeAreaView>

      <SafeAreaView edges={['top']} style={styles.topRight} pointerEvents="box-none">
        {canSwitch && !busy ? (
          <IconButton
            icon={{ ios: 'arrow.triangle.2.circlepath.camera', android: 'cameraswitch' }}
            accessibilityLabel={
              position === 'front' ? 'Switch to back camera' : 'Switch to front camera'
            }
            onPress={() => setPosition(otherPosition)}
          />
        ) : null}
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.bottom} pointerEvents="box-none">
        {state.error ? (
          <Text
            style={[
              textStyles.caption,
              styles.notice,
              { color: colors.onRecord, backgroundColor: colors.record },
            ]}
          >
            {`Recording failed: ${state.error}`}
          </Text>
        ) : null}
        {saveStatus && !busy ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[
              textStyles.caption,
              styles.notice,
              { color: colors.text, backgroundColor: colors.surface },
            ]}
          >
            {saveStatus.kind === 'saving' ? 'Saving to gallery…' : saveResultMessage(saveStatus)}
          </Text>
        ) : null}
        {saveStatus?.kind === 'permission-denied' && saveStatus.canOpenSettings && !busy ? (
          <Button
            label="Open Settings"
            variant="secondary"
            // Opens this app's page in system Settings on both iOS and Android.
            onPress={() => Linking.openSettings()}
          />
        ) : null}
        <RecordButton
          isRecording={isRecording}
          disabled={state.status === 'starting' || state.status === 'stopping'}
          onPress={isRecording ? stop : start}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: spacing.md,
  },
  timer: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    justifyContent: 'center',
  },
  topRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: spacing.md,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  notice: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    overflow: 'hidden',
    textAlign: 'center',
  },
});
