import { Pressable, StyleSheet, View } from 'react-native';

import { opacity, radius, recordButtonSize, useTheme } from '@/theme';

type Props = {
  isRecording: boolean;
  disabled?: boolean;
  onPress: () => void;
};

/** Classic shutter: a red dot to start, a red square to stop. */
export function RecordButton({ isRecording, disabled = false, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.ring,
        { borderColor: colors.onRecord },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={[isRecording ? styles.stop : styles.dot, { backgroundColor: colors.record }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: recordButtonSize.outer,
    height: recordButtonSize.outer,
    borderRadius: radius.pill,
    borderWidth: recordButtonSize.ring,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: recordButtonSize.dot,
    height: recordButtonSize.dot,
    borderRadius: radius.pill,
  },
  stop: {
    width: recordButtonSize.stop,
    height: recordButtonSize.stop,
    borderRadius: radius.sm,
  },
  pressed: { opacity: opacity.pressed },
  disabled: { opacity: opacity.disabled },
});
