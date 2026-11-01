import { useEffect, useMemo, useState } from 'react';
import { Linking, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { CommonResolutions, useCameraDevices, useVideoOutput } from 'react-native-vision-camera';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { controlsArea, prompterBox } from '@/features/prompter/layout';
import { Prompter } from '@/features/prompter/Prompter';
import { PrompterControls } from '@/features/prompter/PrompterControls';
import { SAMPLE_SCRIPT } from '@/features/prompter/sampleScript';
import { useCountdown } from '@/features/prompter/useCountdown';
import { usePrompterSettings } from '@/features/prompter/usePrompterSettings';
import { fontSize, radius, spacing, textStyles, touchTarget, useTheme } from '@/theme';

import { CameraPreview } from './CameraPreview';
import { saveResultMessage, type SaveResult } from './gallery';
import { cameraSideFor } from './orientation';
import { canSwitchPosition, DEFAULT_POSITION, otherPosition, type LensPosition } from './preview';
import { RecordButton } from './RecordButton';
import { formatDuration, isRecordingBusy, type FinishedRecording } from './recording';
import { saveToGallery } from './saveToGallery';
import { useInterfaceOrientation } from './useInterfaceOrientation';
import { useVideoRecording } from './useVideoRecording';

type SaveStatus = { kind: 'saving' } | SaveResult;

type Props = {
  /** Reports when recording starts/ends so the screen can lock its own controls. */
  onBusyChange?: (busy: boolean) => void;
};

/** Live preview with the prompter, its controls, the record button and elapsed time. */
export function Recorder({ onBusyChange }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const orientation = useInterfaceOrientation();
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
  const isRecording = state.status === 'recording';

  const settings = usePrompterSettings();
  const countdown = useCountdown();
  const [paused, setPaused] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  // The text only moves while the camera is actually recording, so recording
  // and scrolling start together once the countdown hands over.
  const playing = isRecording && !paused;
  const busy = isRecordingBusy(state) || countdown.isRunning;

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  const onRecordPress = () => {
    if (countdown.isRunning) {
      countdown.cancel();
    } else if (isRecording) {
      stop();
    } else {
      setSaveStatus(undefined);
      setPaused(false);
      setRestartKey((key) => key + 1);
      countdown.start(start);
    }
  };

  // Next to the front lens: under the top row of buttons in portrait, against
  // the camera edge in landscape (see layout.ts).
  const cameraSide = cameraSideFor(orientation);
  const box = prompterBox({
    screenWidth: window.width,
    screenHeight: window.height,
    cameraSide,
    topOffset: insets.top + spacing.md + touchTarget + spacing.sm,
    bottomOffset: insets.bottom + spacing.lg,
    sideOffset: (cameraSide === 'left' ? insets.left : insets.right) + spacing.md,
  });
  const controls = controlsArea(box, cameraSide, window.width, spacing.md);
  const pausedLabelTop = Math.min(
    box.top + box.height + spacing.sm,
    // In landscape the box reaches the bottom; keep the label on screen.
    window.height - insets.bottom - spacing.xl - spacing.md,
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <CameraPreview position={position} outputs={outputs} />

      <Prompter
        text={SAMPLE_SCRIPT}
        box={box}
        speed={settings.speed}
        fontSize={settings.fontSize}
        playing={playing}
        restartKey={restartKey}
        onPress={() => setPaused((value) => !value)}
      />
      {isRecording && paused ? (
        <Text
          style={[
            textStyles.caption,
            styles.notice,
            styles.pausedLabel,
            {
              top: pausedLabelTop,
              // Centered under the text box (in landscape it sits to one side).
              left: box.left,
              width: box.width,
              color: colors.onScrim,
              backgroundColor: colors.scrim,
            },
          ]}
        >
          Paused · tap the text to continue
        </Text>
      ) : null}

      {countdown.value !== undefined ? (
        <View style={styles.countdown} pointerEvents="none">
          <Text
            accessibilityLiveRegion="assertive"
            style={[styles.countdownText, { color: colors.onScrim }]}
          >
            {countdown.value}
          </Text>
        </View>
      ) : null}

      <SafeAreaView edges={['top']} style={styles.top} pointerEvents="box-none">
        {isRecordingBusy(state) ? (
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

      <SafeAreaView edges={['top', 'right']} style={styles.topRight} pointerEvents="box-none">
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

      <SafeAreaView
        edges={['bottom', 'left', 'right']}
        // Full width in portrait; the side away from the camera in landscape.
        style={[styles.bottom, { left: controls.left, right: controls.right }]}
        pointerEvents="box-none"
      >
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
        <PrompterControls
          speed={settings.speed}
          fontSize={settings.fontSize}
          onSpeedChange={settings.setSpeed}
          onFontSizeChange={settings.setFontSize}
        />
        <RecordButton
          isRecording={isRecording || countdown.isRunning}
          label={countdown.isRunning ? 'Cancel countdown' : undefined}
          disabled={state.status === 'starting' || state.status === 'stopping'}
          onPress={onRecordPress}
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
  pausedLabel: {
    position: 'absolute',
  },
  countdown: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: fontSize.display,
    fontWeight: '800',
  },
});
