import { Tabs, useRouter } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { useI18n } from '@/i18n/I18nProvider';
import { iconSize, useTheme } from '@/theme';

// SF Symbols on iOS, Material Symbols on Android.
function TabIcon({ name, color }: { name: SymbolViewProps['name']; color: ColorValue }) {
  return <SymbolView name={name} tintColor={color} size={iconSize.md} />;
}

export default function TabsLayout() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.scripts'),
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'doc.text', android: 'description' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="start-recording"
        options={{
          title: t('tabs.record'),
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'video', android: 'videocam' }} color={color} />
          ),
        }}
        listeners={{
          // The tab never shows its own page: it opens the full-screen recorder
          // (with the last used script) instead.
          tabPress: (event) => {
            event.preventDefault();
            router.push('/record');
          },
        }}
      />
      <Tabs.Screen
        name="recordings"
        options={{
          title: t('tabs.recordings'),
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'film.stack', android: 'video_library' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'gearshape', android: 'settings' }} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
