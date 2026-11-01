import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { ScriptRow } from '@/features/scripts/ScriptRow';
import { searchScripts } from '@/features/scripts/scripts';
import { scriptStore, useScripts } from '@/features/scripts/scriptStore';
import { useI18n } from '@/i18n/I18nProvider';
import { loadPrompterSettings } from '@/storage/prompterSettings';
import { spacing, textStyles, useTheme } from '@/theme';

export default function ScriptsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();
  const scripts = useScripts();
  const [query, setQuery] = useState('');
  const visible = searchScripts(scripts, query);
  // Estimates use the speed the prompter will start at.
  const { speed } = loadPrompterSettings();

  const openEditor = (id: string) => router.push({ pathname: '/script/[id]', params: { id } });
  const createAndOpen = () => openEditor(scriptStore.create().id);
  const record = (scriptId: string) => router.push({ pathname: '/record', params: { scriptId } });

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={[textStyles.title, { color: colors.text }]}>
          {t('scripts.title')}
        </Text>
        <IconButton
          icon={{ ios: 'plus', android: 'add' }}
          accessibilityLabel={t('scripts.new')}
          onPress={createAndOpen}
        />
      </View>

      {scripts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[textStyles.subtitle, { color: colors.text }]}>
            {t('scripts.emptyTitle')}
          </Text>
          <Text style={[textStyles.body, styles.center, { color: colors.textMuted }]}>
            {t('scripts.emptyBody')}
          </Text>
          <Button label={t('scripts.new')} onPress={createAndOpen} style={styles.emptyAction} />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(script) => script.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <TextField
              value={query}
              onChangeText={setQuery}
              placeholder={t('scripts.search')}
              accessibilityLabel={t('scripts.search')}
              autoCorrect={false}
              clearButtonMode="while-editing"
              returnKeyType="search"
            />
          }
          ListEmptyComponent={
            <Text style={[textStyles.body, styles.center, { color: colors.textMuted }]}>
              {t('scripts.noResults', { query: query.trim() })}
            </Text>
          }
          renderItem={({ item }) => (
            <ScriptRow
              script={item}
              speed={speed}
              onOpen={() => openEditor(item.id)}
              onRecord={() => record(item.id)}
            />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  list: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  emptyAction: { marginTop: spacing.md, alignSelf: 'stretch' },
  center: { textAlign: 'center' },
});
