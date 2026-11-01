import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { formatDuration } from '@/features/camera/recording';
import { useI18n } from '@/i18n/I18nProvider';
import { opacity, radius, spacing, textStyles, useTheme } from '@/theme';

import { countWords, estimateReadingSeconds } from './readingTime';
import { displayTitle, preview, type Script } from './scripts';

type Props = {
  script: Script;
  /** Prompter speed used for the reading-time estimate. */
  speed: number;
  onOpen: () => void;
  onRecord: () => void;
};

export function ScriptRow({ script, speed, onOpen, onRecord }: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const title = displayTitle(script, t('common.untitled'));
  const words = countWords(script.body);
  const seconds = estimateReadingSeconds(words, speed);

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onOpen}
        style={({ pressed }) => [styles.body, pressed && styles.pressed]}
      >
        <Text numberOfLines={1} style={[textStyles.label, { color: colors.text }]}>
          {title}
        </Text>
        {script.body.trim() ? (
          <Text numberOfLines={2} style={[textStyles.caption, { color: colors.textMuted }]}>
            {preview(script.body)}
          </Text>
        ) : null}
        <Text style={[textStyles.caption, { color: colors.textMuted }]}>
          {`${t('scripts.words', { count: words })} · ${t('scripts.readingTime', {
            time: formatDuration(seconds),
            speed,
          })}`}
        </Text>
      </Pressable>
      <IconButton
        icon={{ ios: 'video', android: 'videocam' }}
        accessibilityLabel={t('scripts.recordThis', { title })}
        onPress={onRecord}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  body: { flex: 1, gap: spacing.xs },
  pressed: { opacity: opacity.pressed },
});
