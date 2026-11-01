import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useCameraDevices } from 'react-native-vision-camera';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/IconButton';
import { spacing } from '@/theme';

import { CameraPreview } from './CameraPreview';
import { canSwitchPosition, DEFAULT_POSITION, otherPosition, type LensPosition } from './preview';

/** Live preview with camera controls. Recording controls arrive in PRM-9. */
export function Recorder() {
  const [position, setPosition] = useState<LensPosition>(DEFAULT_POSITION);
  const canSwitch = canSwitchPosition(useCameraDevices().map((device) => device.position));

  return (
    <View style={StyleSheet.absoluteFill}>
      <CameraPreview position={position} />
      <SafeAreaView edges={['top']} style={styles.controls} pointerEvents="box-none">
        {canSwitch ? (
          <IconButton
            icon={{ ios: 'arrow.triangle.2.circlepath.camera', android: 'cameraswitch' }}
            accessibilityLabel={
              position === 'front' ? 'Switch to back camera' : 'Switch to front camera'
            }
            onPress={() => setPosition(otherPosition)}
          />
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: spacing.md,
  },
});
