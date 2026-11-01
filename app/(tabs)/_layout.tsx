import { Tabs, useRouter } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { colors, iconSize } from '@/theme';

// SF Symbols on iOS, Material Symbols on Android.
function TabIcon({ name, color }: { name: SymbolViewProps['name']; color: ColorValue }) {
  return <SymbolView name={name} tintColor={color} size={iconSize.md} />;
}

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scripts',
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'doc.text', android: 'description' }} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="start-recording"
        options={{
          title: 'Record',
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'video', android: 'videocam' }} color={color} />
          ),
        }}
        listeners={{
          // The tab never shows its own page: it opens the full-screen recorder instead.
          tabPress: (event) => {
            event.preventDefault();
            router.push('/record');
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <TabIcon name={{ ios: 'gearshape', android: 'settings' }} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
