import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { spacing, textStyles, useTheme } from '@/theme';

import { describePermissions, type PermissionStep, type RecordingPermission } from './permissions';
import { useRecordingPermissions } from './useRecordingPermissions';

type Copy = { title: string; body: string };

function copyFor(step: Exclude<PermissionStep, 'ready'>, missing: RecordingPermission[]): Copy {
  const names = describePermissions(missing);
  switch (step) {
    case 'request':
      return {
        title: 'Camera and microphone',
        body: 'Cue Cam records video and sound while you read your script. Allow access to start recording.',
      };
    case 'open-settings':
      return {
        title: `${names} access is off`,
        body: `Turn on ${names} for Cue Cam in Settings, then come back here.`,
      };
    case 'restricted':
      return {
        title: `${names} is restricted`,
        body: `This device blocks ${names} access (for example Screen Time or a device policy). It can only be changed by whoever manages the device.`,
      };
  }
}

type Props = {
  children: ReactNode;
};

/** Renders `children` only once camera and microphone are both granted. */
export function CameraPermissionGate({ children }: Props) {
  const { colors } = useTheme();
  const { step, missing, request, openSettings } = useRecordingPermissions();

  if (step === 'ready') return children;

  const copy = copyFor(step, missing);

  return (
    <View style={styles.container}>
      <Text
        accessibilityRole="header"
        style={[textStyles.title, styles.center, { color: colors.text }]}
      >
        {copy.title}
      </Text>
      <Text style={[textStyles.body, styles.center, { color: colors.textMuted }]}>{copy.body}</Text>
      {step === 'request' ? (
        <Button label="Allow access" onPress={request} style={styles.action} />
      ) : null}
      {step === 'open-settings' ? (
        <Button label="Open Settings" onPress={openSettings} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  center: { textAlign: 'center' },
  action: { marginTop: spacing.md, alignSelf: 'stretch' },
});
