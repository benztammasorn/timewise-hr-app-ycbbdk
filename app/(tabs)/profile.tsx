import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";

export default function ProfileScreen() {
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
          <Text style={[styles.name, { color: colors.text }]}>John Doe</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>john.doe@example.com</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
          <View style={styles.infoRow}>
            <IconSymbol name="phone.fill" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>+1 (555) 123-4567</Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="envelope.fill" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>john.doe@company.com</Text>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="location.fill" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>San Francisco, CA</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Employment Details</Text>
          <View style={styles.infoRow}>
            <IconSymbol name="briefcase.fill" size={20} color={colors.primary} />
            <View style={styles.infoColumn}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Position</Text>
              <Text style={[styles.infoText, { color: colors.text }]}>Software Engineer</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="building.2.fill" size={20} color={colors.primary} />
            <View style={styles.infoColumn}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Department</Text>
              <Text style={[styles.infoText, { color: colors.text }]}>Engineering</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <IconSymbol name="calendar.fill" size={20} color={colors.primary} />
            <View style={styles.infoColumn}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Employee ID</Text>
              <Text style={[styles.infoText, { color: colors.text }]}>EMP-2024-001</Text>
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
