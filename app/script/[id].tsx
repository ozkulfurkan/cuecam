import * as Sentry from '@sentry/react-native';
import { getStringAsync } from 'expo-clipboard';
import { getDocumentAsync } from 'expo-document-picker';
import { File } from 'expo-file-system';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { TextField } from '@/components/TextField';
import { formatDuration } from '@/features/camera/recording';
import { appendText, titleFromFileName } from '@/features/scripts/importText';
import { countWords, estimateReadingSeconds } from '@/features/scripts/readingTime';
import { displayTitle } from '@/features/scripts/scripts';
import { scriptStore, useScript } from '@/features/scripts/scriptStore';
import { useI18n } from '@/i18n/I18nProvider';
import { loadPrompterSettings } from '@/storage/prompterSettings';
import { radius, spacing, textStyles, useTheme } from '@/theme';

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export default function ScriptEditorScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const script = useScript(id);
  const [notice, setNotice] = useState<string>();
  const { speed } = loadPrompterSettings();

  // A script opened via "New" and left without any text is not worth keeping.
  useEffect(
    () => () => {
      const latest = scriptStore.get(id);
      if (latest && !latest.title.trim() && !latest.body.trim()) scriptStore.remove(id);
    },
    [id],
  );

  if (!script) return null;

  const words = countWords(script.body);
  const title = displayTitle(script, t('common.untitled'));
  // Every keystroke is saved: MMKV writes are synchronous and cheap.
  const update = (changes: { title?: string; body?: string }) => scriptStore.update(id, changes);

  const paste = async () => {
    const text = await getStringAsync();
    if (!text.trim()) {
      setNotice(t('editor.clipboardEmpty'));
      return;
    }
    setNotice(undefined);
    update({ body: appendText(script.body, text) });
  };

  const importTxt = async () => {
    try {
      const result = await getDocumentAsync({ type: 'text/plain', copyToCacheDirectory: true });
      if (result.canceled) return;
      const [asset] = result.assets;
      const text = await new File(asset.uri).text();
      setNotice(undefined);
      update({
        body: appendText(script.body, text),
        ...(script.title.trim() ? {} : { title: titleFromFileName(asset.name) }),
      });
    } catch (error) {
      Sentry.captureException(error);
      setNotice(t('editor.importFailed', { error: errorMessage(error) }));
    }
  };

  const confirmDelete = () => {
    Alert.alert(t('editor.deleteTitle'), t('editor.deleteBody', { title }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          scriptStore.remove(id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.flex}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <IconButton
              icon={{ ios: 'trash', android: 'delete' }}
              accessibilityLabel={t('common.delete')}
              variant="plain"
              onPress={confirmDelete}
            />
          ),
        }}
      />
      <KeyboardAvoidingView
        // iOS needs padding to keep the text above the keyboard; Android already
        // resizes the window for it (adjustResize), so no extra behaviour there.
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.flex, styles.content]}
      >
        <TextField
          value={script.title}
          onChangeText={(value) => update({ title: value })}
          placeholder={t('editor.titlePlaceholder')}
          accessibilityLabel={t('editor.titlePlaceholder')}
          returnKeyType="next"
        />
        <TextInput
          value={script.body}
          onChangeText={(value) => update({ body: value })}
          placeholder={t('editor.bodyPlaceholder')}
          accessibilityLabel={t('editor.bodyPlaceholder')}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          multiline
          textAlignVertical="top"
          style={[
            textStyles.body,
            styles.body,
            { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        />
        <Text style={[textStyles.caption, { color: colors.textMuted }]}>
          {`${t('scripts.words', { count: words })} · ${t('scripts.readingTime', {
            time: formatDuration(estimateReadingSeconds(words, speed)),
            speed,
          })}`}
        </Text>
        {notice ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[textStyles.caption, { color: colors.text }]}
          >
            {notice}
          </Text>
        ) : null}
        <View style={styles.actions}>
          <Button
            label={t('editor.paste')}
            variant="secondary"
            accessibilityHint={t('editor.pasteHint')}
            onPress={paste}
            style={styles.action}
          />
          <Button
            label={t('editor.importTxt')}
            variant="secondary"
            onPress={importTxt}
            style={styles.action}
          />
        </View>
        <Button
          label={t('scripts.record')}
          variant="record"
          onPress={() => router.push({ pathname: '/record', params: { scriptId: id } })}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: spacing.sm, padding: spacing.md },
  body: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
