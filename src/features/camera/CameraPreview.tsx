import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraDevices } from 'react-native-vision-camera';

import { radius, spacing, textStyles, useTheme } from '@/theme';

import { previewConstraints, resolvePosition, type LensPosition } from './preview';
import { useIsCameraActive } from './useIsCameraActive';

type Props = {
  position: LensPosition;
};

/** Full-screen live camera feed. The front camera is mirrored, like a mirror. */
export function CameraPreview({ position }: Props) {
  const { colors } = useTheme();
  const isActive = useIsCameraActive();
  const positions = useCameraDevices().map((device) => device.position);
  const lens = resolvePosition(position, positions);
  const device = useCameraDevice(lens ?? position);
  const [selectedFps, setSelectedFps] = useState<number>();

  if (lens === undefined || device === undefined) {
    return (
      <View style={[styles.fill, styles.center, { backgroundColor: colors.background }]}>
        <Text style={[textStyles.body, { color: colors.textMuted }]}>No camera available</Text>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        constraints={previewConstraints}
        // 'auto' mirrors selfie cameras on both platforms. Whether the recorded
        // file is mirrored becomes a setting in PRM-11.
        mirrorMode="auto"
        resizeMode="cover"
        onSessionConfigSelected={(config) => setSelectedFps(config.selectedFPS)}
      />
      {__DEV__ && selectedFps !== undefined ? (
        // Dev-only readout to verify the negotiated frame rate on real devices.
        <Text
          style={[
            textStyles.caption,
            styles.fps,
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
    bottom: spacing.xl,
    alignSelf: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
});
