import Constants from 'expo-constants';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Slider } from '@/components/Slider';
import { qualityLabel } from '@/features/camera/videoQuality';
import { onboardingStore } from '@/features/onboarding/onboardingStore';
import { FONT_SIZE_RANGE, SPEED_RANGE } from '@/features/prompter/scroll';
import { usePrompterSettings } from '@/features/prompter/usePrompterSettings';
import { useI18n } from '@/i18n/I18nProvider';
import type { LanguagePreference } from '@/i18n/translate';
import { privacyPolicyUrl, supportUrl } from '@/lib/links';
import {
  loadVideoQuality,
  saveVideoQuality,
  VIDEO_QUALITIES,
  type VideoQuality,
} from '@/storage/appSettings';
import { spacing, textStyles, useTheme } from '@/theme';

// Mirroring the recorded video (PRM-11) is deferred, so it has no setting here.
export default function SettingsScreen() {
  const { colors } = useTheme();
  const { t, language, preference, setPreference } = useI18n();
  const prompter = usePrompterSettings();
  const [quality, setQuality] = useState<VideoQuality>(loadVideoQuality);
  const [crash, setCrash] = useState(false);

  // Throwing during render goes through React's error path, which the Sentry
  // error boundary reports — the same path a real rendering bug would take.
  if (crash) throw new Error('Sentry test crash (dev only)');

  const heading = [textStyles.subtitle, { color: colors.text }];
  const label = [textStyles.label, { color: colors.text }];
  const hint = [textStyles.caption, { color: colors.textMuted }];

  const languages: { value: LanguagePreference; label: string }[] = [
    { value: 'system', label: t('settings.languageSystem') },
    // Language names are always shown in their own language.
    { value: 'en', label: 'English' },
    { value: 'tr', label: 'Türkçe' },
  ];

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={[textStyles.title, { color: colors.text }]}>
          {t('settings.title')}
        </Text>

        <Text accessibilityRole="header" style={heading}>
          {t('settings.prompter')}
        </Text>
        <Card>
          <Text style={label}>{t('prompter.speed', { value: prompter.speed })}</Text>
          <Slider
            value={prompter.speed}
            min={SPEED_RANGE.min}
            max={SPEED_RANGE.max}
            step={SPEED_RANGE.step}
            onChange={prompter.setSpeed}
            accessibilityLabel={t('prompter.speedLabel')}
          />
          <Text style={label}>{t('prompter.size', { value: prompter.fontSize })}</Text>
          <Slider
            value={prompter.fontSize}
            min={FONT_SIZE_RANGE.min}
            max={FONT_SIZE_RANGE.max}
            step={FONT_SIZE_RANGE.step}
            onChange={prompter.setFontSize}
            accessibilityLabel={t('prompter.sizeLabel')}
          />
          <Text style={hint}>{t('settings.prompterHint')}</Text>
        </Card>

        <Text accessibilityRole="header" style={heading}>
          {t('settings.video')}
        </Text>
        <Card>
          <Text style={label}>{t('settings.quality')}</Text>
          <SegmentedControl
            options={VIDEO_QUALITIES.map((value) => ({ value, label: qualityLabel(value) }))}
            value={quality}
            onChange={(value) => {
              setQuality(value);
              saveVideoQuality(value);
            }}
            accessibilityLabel={t('settings.quality')}
          />
          <Text style={hint}>{t('settings.qualityHint')}</Text>
        </Card>

        <Text accessibilityRole="header" style={heading}>
          {t('settings.language')}
        </Text>
        <Card>
          <SegmentedControl
            options={languages}
            value={preference}
            onChange={setPreference}
            accessibilityLabel={t('settings.language')}
          />
        </Card>

        <Text accessibilityRole="header" style={heading}>
          {t('settings.about')}
        </Text>
        <Card>
          <Button
            label={t('settings.showIntro')}
            variant="secondary"
            onPress={onboardingStore.restart}
          />
          <Button
            label={t('settings.privacyPolicy')}
            variant="secondary"
            onPress={() => Linking.openURL(privacyPolicyUrl(language))}
          />
          <Button
            label={t('settings.contact')}
            variant="secondary"
            onPress={() => Linking.openURL(supportUrl(language))}
          />
          <Text style={hint}>
            {t('settings.version', { version: Constants.expoConfig?.version ?? '—' })}
          </Text>
        </Card>

        {__DEV__ ? (
          <View style={styles.developer}>
            <Text accessibilityRole="header" style={heading}>
              {t('settings.developer')}
            </Text>
            <Button
              label={t('settings.testCrash')}
              variant="record"
              accessibilityHint={t('settings.testCrashHint')}
              onPress={() => setCrash(true)}
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  developer: { gap: spacing.md },
});
