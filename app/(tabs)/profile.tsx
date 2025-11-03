import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  employeeId: string;
  location: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  daysRequested: number;
}

export interface LeaveQuota {
  userId: string;
  totalAnnual: number;
  used: number;
  remaining: number;
  byType: {
    [key: string]: {
      total: number;
      used: number;
      remaining: number;
    };
  };
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    position: 'Software Engineer',
    department: 'Engineering',
    employeeId: 'EMP-2024-001',
    location: 'San Francisco, CA',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 (555) 234-5678',
    position: 'Product Manager',
    department: 'Product',
    employeeId: 'EMP-2024-002',
    location: 'New York, NY',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1 (555) 345-6789',
    position: 'Designer',
    department: 'Design',
    employeeId: 'EMP-2024-003',
    location: 'Los Angeles, CA',
  },
];

export default function ProfileScreen() {
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('currentUserId');
      if (userId) {
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
          setCurrentUser(user);
        }
      }
    } catch (error) {
      console.log('Error loading current user:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
      >
        <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
          <IconSymbol name="person.circle.fill" size={80} color={colors.primary} />
          <Text style={[styles.name, { color: colors.text }]}>{currentUser.name}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{currentUser.email}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
          <View style={styles.infoRow}>
            <IconSymbol name="phone.fill" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>{currentUser.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="envelope.fill" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>{currentUser.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="location.fill" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>{currentUser.location}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Employment Details</Text>
          <View style={styles.infoRow}>
            <IconSymbol name="briefcase.fill" size={20} color={colors.primary} />
            <View style={styles.infoColumn}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Position</Text>
              <Text style={[styles.infoText, { color: colors.text }]}>{currentUser.position}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="building.2.fill" size={20} color={colors.primary} />
            <View style={styles.infoColumn}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Department</Text>
              <Text style={[styles.infoText, { color: colors.text }]}>{currentUser.department}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="calendar.fill" size={20} color={colors.primary} />
            <View style={styles.infoColumn}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Employee ID</Text>
              <Text style={[styles.infoText, { color: colors.text }]}>{currentUser.employeeId}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  contentContainerWithTabBar: {
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    gap: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    gap: 16,
    marginBottom: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 16,
  },
});

export { mockUsers };

// Mock data for leave requests and quotas
export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    userId: '1',
    leaveType: 'Vacation',
    fromDate: '2024-01-15',
    toDate: '2024-01-19',
    reason: 'Family vacation',
    status: 'approved',
    createdAt: '2024-01-10',
    daysRequested: 5,
  },
  {
    id: '2',
    userId: '1',
    leaveType: 'Sick Leave',
    fromDate: '2024-01-22',
    toDate: '2024-01-22',
    reason: 'Medical appointment',
    status: 'pending',
    createdAt: '2024-01-20',
    daysRequested: 1,
  },
  {
    id: '3',
    userId: '1',
    leaveType: 'Personal',
    fromDate: '2024-01-25',
    toDate: '2024-01-25',
    reason: 'Personal matters',
    status: 'rejected',
    createdAt: '2024-01-23',
    daysRequested: 1,
  },
];

export const mockLeaveQuotas: LeaveQuota[] = [
  {
    userId: '1',
    totalAnnual: 20,
    used: 7,
    remaining: 13,
    byType: {
      'Vacation': { total: 15, used: 5, remaining: 10 },
      'Sick Leave': { total: 3, used: 1, remaining: 2 },
      'Personal': { total: 2, used: 1, remaining: 1 },
    },
  },
  {
    userId: '2',
    totalAnnual: 20,
    used: 10,
    remaining: 10,
    byType: {
      'Vacation': { total: 15, used: 10, remaining: 5 },
      'Sick Leave': { total: 3, used: 0, remaining: 3 },
      'Personal': { total: 2, used: 0, remaining: 2 },
    },
  },
  {
    userId: '3',
    totalAnnual: 20,
    used: 2,
    remaining: 18,
    byType: {
      'Vacation': { total: 15, used: 0, remaining: 15 },
      'Sick Leave': { total: 3, used: 2, remaining: 1 },
      'Personal': { total: 2, used: 0, remaining: 2 },
    },
  },
];
