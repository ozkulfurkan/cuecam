import { Pressable, StyleSheet, View } from 'react-native';

import { useI18n } from '@/i18n/I18nProvider';
import { opacity, radius, recordButtonSize, useTheme } from '@/theme';

type Props = {
  isRecording: boolean;
  /** Overrides the default "Start/Stop recording" label, e.g. during the countdown. */
  label?: string;
  disabled?: boolean;
  onPress: () => void;
};

/** Classic shutter: a red dot to start, a red square to stop. */
export function RecordButton({ isRecording, label, disabled = false, onPress }: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? t(isRecording ? 'recorder.stop' : 'recorder.start')}
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
