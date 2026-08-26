import { Tabs } from 'expo-router';
import {
  HouseSimpleIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from 'phosphor-react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF', headerShown: true }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HouseSimpleIcon color={color as string} size={24} weight='regular' />
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <MagnifyingGlassIcon color={color as string} size={24} weight='regular' />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile',
          tabBarIcon: ({ color }) => <UserIcon color={color as string} size={24} weight='regular' />
        }}
      />
    </Tabs>
  );
}
