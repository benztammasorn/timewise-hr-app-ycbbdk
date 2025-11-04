import React from 'react';
import { Platform } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'clock.fill',
      label: 'นาฬิกา',
    },
    {
      name: 'timesheet',
      route: '/(tabs)/timesheet',
      icon: 'calendar',
      label: 'ใบเวลา',
    },
    {
      name: 'leave',
      route: '/(tabs)/leave',
      icon: 'calendar.badge.plus',
      label: 'ลาพักร้อน',
    },
    {
      name: 'quota',
      route: '/(tabs)/quota',
      icon: 'chart.pie.fill',
      label: 'โควต้า',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person.fill',
      label: 'โปรไฟล์',
    },
  ];

  if (Platform.OS === 'ios') {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="(home)">
          <Icon sf="clock.fill" drawable="ic_clock" />
          <Label>นาฬิกา</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="timesheet">
          <Icon sf="calendar" drawable="ic_calendar" />
          <Label>ใบเวลา</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="leave">
          <Icon sf="calendar.badge.plus" drawable="ic_leave" />
          <Label>ลาพักร้อน</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="quota">
          <Icon sf="chart.pie.fill" drawable="ic_quota" />
          <Label>โควต้า</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Icon sf="person.fill" drawable="ic_profile" />
          <Label>โปรไฟล์</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="timesheet" />
        <Stack.Screen name="leave" />
        <Stack.Screen name="quota" />
        <Stack.Screen name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
