import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useRecordingPermissions } from '@/features/camera/useRecordingPermissions';
import {
  isLastPage,
  nextPage,
  ONBOARDING_PAGES,
  previousPage,
} from '@/features/onboarding/onboarding';
import { onboardingStore } from '@/features/onboarding/onboardingStore';
import { useI18n } from '@/i18n/I18nProvider';
import { dotSize, iconSize, radius, spacing, textStyles, useTheme } from '@/theme';

// First-launch intro (three pages). The root navigator only offers this route
// until it is completed, then switches to the tabs by itself.
export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { t } = useI18n();
  const permissions = useRecordingPermissions();
  const [index, setIndex] = useState(0);
  const page = ONBOARDING_PAGES[index];
  const last = isLastPage(index);
  // Ask only while the system dialog can still be shown; otherwise (already
  // granted, or denied earlier and the intro was reopened) just finish.
  const canAsk = last && permissions.step === 'request';

  const finish = () => onboardingStore.complete();
  const allowAndFinish = async () => {
    try {
      await permissions.request();
    } finally {
      // Denying is fine: the recorder explains it again and links to Settings.
      finish();
    }
  };

  return (
    <Screen edges={['top', 'bottom']} padded={false}>
      <View style={styles.topBar}>
        {last ? null : <Button label={t('onboarding.skip')} variant="ghost" onPress={finish} />}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: colors.surfaceRaised }]}>
          <SymbolView name={page.icon} tintColor={colors.accent} size={iconSize.xl} />
        </View>
        <Text
          accessibilityRole="header"
          style={[textStyles.title, styles.center, { color: colors.text }]}
        >
          {t(page.titleKey)}
        </Text>
        <Text style={[textStyles.body, styles.center, { color: colors.textMuted }]}>
          {t(page.bodyKey)}
        </Text>
        <View style={styles.points}>
          {page.pointKeys.map((key) => (
            <View key={key} style={styles.point}>
              <View style={[styles.bullet, { backgroundColor: colors.accent }]} />
              <Text style={[textStyles.body, styles.pointText, { color: colors.text }]}>
                {t(key)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View
          accessible
          accessibilityLabel={t('onboarding.page', {
            page: index + 1,
            count: ONBOARDING_PAGES.length,
          })}
          style={styles.dots}
        >
          {ONBOARDING_PAGES.map((item, i) => (
            <View
              key={item.id}
              style={[styles.dot, { backgroundColor: i === index ? colors.accent : colors.border }]}
            />
          ))}
        </View>

        {canAsk ? (
          <>
            <Button label={t('onboarding.allow')} onPress={allowAndFinish} />
            <Button label={t('onboarding.notNow')} variant="ghost" onPress={finish} />
          </>
        ) : last ? (
          <Button label={t('onboarding.start')} onPress={finish} />
        ) : (
          <Button label={t('onboarding.next')} onPress={() => setIndex(nextPage(index))} />
        )}
        {index > 0 && !canAsk ? (
          <Button
            label={t('onboarding.back')}
            variant="ghost"
            onPress={() => setIndex(previousPage(index))}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    minHeight: spacing.xl + spacing.md,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  hero: {
    padding: spacing.lg,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  center: { textAlign: 'center' },
  points: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.sm },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  bullet: {
    width: dotSize,
    height: dotSize,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  pointText: { flex: 1 },
  footer: { gap: spacing.sm, padding: spacing.lg },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dot: { width: dotSize, height: dotSize, borderRadius: radius.pill },
});
