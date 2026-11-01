import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { useI18n } from '@/i18n/I18nProvider';
import type { Translate } from '@/i18n/translate';
import { spacing, textStyles, useTheme } from '@/theme';

import { describePermissions, type PermissionStep, type RecordingPermission } from './permissions';
import { useRecordingPermissions } from './useRecordingPermissions';

type Copy = { title: string; body: string };

function copyFor(
  step: Exclude<PermissionStep, 'ready'>,
  missing: RecordingPermission[],
  t: Translate,
): Copy {
  const names = describePermissions(missing, t);
  switch (step) {
    case 'request':
      return { title: t('permissions.requestTitle'), body: t('permissions.requestBody') };
    case 'open-settings':
      return {
        title: t('permissions.offTitle', { names }),
        body: t('permissions.offBody', { names }),
      };
    case 'restricted':
      return {
        title: t('permissions.restrictedTitle', { names }),
        body: t('permissions.restrictedBody', { names }),
      };
  }
}

type Props = {
  children: ReactNode;
};

/** Renders `children` only once camera and microphone are both granted. */
export function CameraPermissionGate({ children }: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const { step, missing, request, openSettings } = useRecordingPermissions();

  if (step === 'ready') return children;

  const copy = copyFor(step, missing, t);

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
        <Button label={t('permissions.allow')} onPress={request} style={styles.action} />
      ) : null}
      {step === 'open-settings' ? (
        <Button label={t('common.openSettings')} onPress={openSettings} style={styles.action} />
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
