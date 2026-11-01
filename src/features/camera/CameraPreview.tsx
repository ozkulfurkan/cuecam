import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraDevices,
  type CameraOutput,
} from 'react-native-vision-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n/I18nProvider';
import { radius, spacing, textStyles, touchTarget, useTheme } from '@/theme';

import { previewConstraints, resolvePosition, type LensPosition } from './preview';
import { useIsCameraActive } from './useIsCameraActive';

type Props = {
  position: LensPosition;
  /** Extra outputs on the same session, e.g. the video recorder. */
  outputs?: CameraOutput[];
};

/** Full-screen live camera feed. The front camera is mirrored, like a mirror. */
export function CameraPreview({ position, outputs }: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const isActive = useIsCameraActive();
  const positions = useCameraDevices().map((device) => device.position);
  const lens = resolvePosition(position, positions);
  const device = useCameraDevice(lens ?? position);
  const [selectedFps, setSelectedFps] = useState<number>();

  if (lens === undefined || device === undefined) {
    return (
      <View style={[styles.fill, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[textStyles.body, { color: colors.textMuted }]}>{t('recorder.noCamera')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        outputs={outputs}
        constraints={previewConstraints}
        // 'auto' mirrors selfie cameras on both platforms. Whether the recorded
        // file is mirrored becomes a setting in PRM-11.
        mirrorMode="auto"
        // Video orientation follows the screen. The screen is locked for the
        // length of a recording (useRecorderOrientationLock), so the file keeps
        // the orientation it started in even if the phone is turned mid-take.
        orientationSource="interface"
        resizeMode="cover"
        onSessionConfigSelected={(config) => setSelectedFps(config.selectedFPS)}
      />
      {__DEV__ && selectedFps !== undefined ? (
        // Dev-only readout to verify the negotiated frame rate on real devices.
        <Text
          style={[
            textStyles.caption,
            styles.fps,
            // In the top row, right of the Close button: clear of the prompter
            // box below it and the controls at the bottom.
            { top: insets.top + spacing.md + spacing.sm },
            { color: colors.text, backgroundColor: colors.surface },
          ]}
        >
          {`${selectedFps} fps · ${lens}`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  center: { alignItems: 'center', justifyContent: 'center' },
  fps: {
    position: 'absolute',
    left: spacing.md * 2 + touchTarget,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
});
