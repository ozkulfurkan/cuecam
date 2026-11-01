import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/IconButton';
import { shareRecording } from '@/features/recordings/shareRecording';
import { useI18n } from '@/i18n/I18nProvider';
import { spacing, useTheme } from '@/theme';

/** Full-screen playback of one recording, with the system player controls. */
export default function RecordingPlayerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { uri } = useLocalSearchParams<{ id: string; uri: string }>();
  const player = useVideoPlayer(uri, (instance) => {
    instance.play();
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar hidden />
      <VideoView player={player} style={styles.video} contentFit="contain" nativeControls />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.bar} pointerEvents="box-none">
        <IconButton
          icon={{ ios: 'xmark', android: 'close' }}
          accessibilityLabel={t('common.close')}
          onPress={() => router.back()}
        />
        <IconButton
          icon={{ ios: 'square.and.arrow.up', android: 'share' }}
          accessibilityLabel={t('recordings.share')}
          onPress={() => shareRecording(uri)}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  video: { flex: 1 },
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
});
