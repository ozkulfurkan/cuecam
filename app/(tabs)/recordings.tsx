import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { ALBUM_NAME } from '@/features/camera/gallery';
import { formatDuration } from '@/features/camera/recording';
import { formatRecordingDate, type Recording } from '@/features/recordings/recordings';
import { shareRecording } from '@/features/recordings/shareRecording';
import { useRecordings } from '@/features/recordings/useRecordings';
import { useI18n } from '@/i18n/I18nProvider';
import { iconSize, opacity, radius, spacing, textStyles, touchTarget, useTheme } from '@/theme';

export default function RecordingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, language } = useI18n();
  const { state, requestAccess } = useRecordings();

  const play = (recording: Recording) =>
    router.push({
      pathname: '/recording/[id]',
      params: { id: recording.id, uri: recording.uri },
    });

  const message = (text: string) => (
    <Text style={[textStyles.body, styles.center, { color: colors.textMuted }]}>{text}</Text>
  );

  return (
    <Screen padded={false}>
      <Text
        accessibilityRole="header"
        style={[textStyles.title, styles.title, { color: colors.text }]}
      >
        {t('recordings.title')}
      </Text>

      {state.kind === 'needs-permission' ? (
        <View style={styles.empty}>
          {message(t('recordings.permission'))}
          <Button label={t('recordings.allow')} onPress={requestAccess} style={styles.action} />
        </View>
      ) : null}

      {state.kind === 'error' ? (
        <View style={styles.empty}>
          {message(t('recordings.loadFailed', { error: state.message }))}
        </View>
      ) : null}

      {state.kind === 'ready' ? (
        <FlatList
          data={state.recordings}
          keyExtractor={(recording) => recording.id}
          contentContainerStyle={[styles.list, state.recordings.length === 0 && styles.grow]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[textStyles.subtitle, { color: colors.text }]}>
                {t('recordings.emptyTitle')}
              </Text>
              {message(t('recordings.emptyBody', { album: ALBUM_NAME }))}
            </View>
          }
          renderItem={({ item }) => {
            const date = formatRecordingDate(item.createdAt, language);
            return (
              <View
                style={[
                  styles.row,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('recordings.play', { date })}
                  onPress={() => play(item)}
                  style={({ pressed }) => [styles.rowBody, pressed && styles.pressed]}
                >
                  <View style={[styles.thumb, { backgroundColor: colors.surfaceRaised }]}>
                    <SymbolView
                      name={{ ios: 'play.fill', android: 'play_arrow' }}
                      tintColor={colors.text}
                      size={iconSize.md}
                    />
                  </View>
                  <View style={styles.meta}>
                    <Text style={[textStyles.label, { color: colors.text }]}>{date}</Text>
                    <Text style={[textStyles.caption, { color: colors.textMuted }]}>
                      {formatDuration(item.durationSeconds)}
                    </Text>
                  </View>
                </Pressable>
                <IconButton
                  icon={{ ios: 'square.and.arrow.up', android: 'share' }}
                  accessibilityLabel={t('recordings.share')}
                  variant="plain"
                  onPress={() => shareRecording(item.uri)}
                />
              </View>
            );
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  list: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  grow: { flexGrow: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  action: { alignSelf: 'stretch', marginTop: spacing.md },
  center: { textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
  },
  thumb: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { gap: spacing.xs },
  pressed: { opacity: opacity.pressed },
});
