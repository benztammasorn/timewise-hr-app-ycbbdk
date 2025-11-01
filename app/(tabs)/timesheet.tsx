
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from "react";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

interface ClockRecord {
  date: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  clockInLocation?: LocationData | null;
  clockOutLocation?: LocationData | null;
}

export default function TimesheetScreen() {
  const [weekRecords, setWeekRecords] = useState<ClockRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  const loadRecords = async () => {
    try {
      const data = await AsyncStorage.getItem('clockRecords');
      if (data) {
        const allRecords: ClockRecord[] = JSON.parse(data);
        const weekData = getWeekRecords(allRecords);
        setWeekRecords(weekData);
      } else {
        const weekData = getWeekRecords([]);
        setWeekRecords(weekData);
      }
    } catch (error) {
      console.log('Error loading records:', error);
    }
  };

  const getWeekRecords = (allRecords: ClockRecord[]) => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }
    
    return weekDates.map(date => {
      const record = allRecords.find(r => r.date === date);
      return record || { date, clockInTime: null, clockOutTime: null };
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateHours = (clockIn: string | null, clockOut: string | null) => {
    if (!clockIn || !clockOut) return '-';
    
    try {
      const [inHour, inMin] = clockIn.split(':').map(Number);
      const [outHour, outMin] = clockOut.split(':').map(Number);
      
      let inMinutes = inHour * 60 + inMin;
      let outMinutes = outHour * 60 + outMin;
      
      if (outMinutes < inMinutes) {
        outMinutes += 24 * 60;
      }
      
      const diffMinutes = outMinutes - inMinutes;
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.log('Error calculating hours:', error);
      return '-';
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
        <View style={styles.headerSection}>
          <Text style={styles.title}>Weekly Timesheet</Text>
          <Text style={styles.subtitle}>This Week's Clock Records</Text>
        </View>

        <View style={styles.recordsContainer}>
          {weekRecords.map((record, index) => (
            <View key={index} style={[styles.recordCard, { backgroundColor: colors.card }]}>
              <View style={styles.dateSection}>
                <Text style={styles.dateText}>{formatDate(record.date)}</Text>
                <View style={[
                  styles.statusBadge,
                  { 
                    backgroundColor: record.clockInTime && record.clockOutTime 
                      ? colors.accent 
                      : record.clockInTime 
                      ? colors.highlight 
                      : '#E0E0E0'
                  }
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    { 
                      color: record.clockInTime && record.clockOutTime 
                        ? '#FFFFFF' 
                        : record.clockInTime 
                        ? '#333333' 
                        : '#999999'
                    }
                  ]}>
                    {record.clockInTime && record.clockOutTime 
                      ? 'Complete' 
                      : record.clockInTime 
                      ? 'In Progress' 
                      : 'No Record'}
                  </Text>
                </View>
              </View>

              <View style={styles.timeSection}>
                <View style={styles.timeRow}>
                  <View style={styles.timeLabel}>
                    <IconSymbol name="arrow.right.circle.fill" size={16} color={colors.primary} />
                    <Text style={styles.timeLabelText}>In</Text>
                  </View>
                  <View style={styles.timeValueContainer}>
                    <Text style={styles.timeValue}>{record.clockInTime || '-'}</Text>
                    {record.clockInLocation && (
                      <Text style={styles.locationValue}>
                        📍 {record.clockInLocation.latitude.toFixed(4)}, {record.clockInLocation.longitude.toFixed(4)}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.timeRow}>
                  <View style={styles.timeLabel}>
                    <IconSymbol name="arrow.left.circle.fill" size={16} color={colors.accent} />
                    <Text style={styles.timeLabelText}>Out</Text>
                  </View>
                  <View style={styles.timeValueContainer}>
                    <Text style={styles.timeValue}>{record.clockOutTime || '-'}</Text>
                    {record.clockOutLocation && (
                      <Text style={styles.locationValue}>
                        📍 {record.clockOutLocation.latitude.toFixed(4)}, {record.clockOutLocation.longitude.toFixed(4)}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={[styles.timeRow, styles.hoursRow]}>
                  <View style={styles.timeLabel}>
                    <IconSymbol name="clock.fill" size={16} color={colors.secondary} />
                    <Text style={styles.timeLabelText}>Hours</Text>
                  </View>
                  <Text style={[styles.timeValue, styles.hoursValue]}>
                    {calculateHours(record.clockInTime, record.clockOutTime)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={styles.summaryTitle}>Weekly Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Days Worked:</Text>
            <Text style={styles.summaryValue}>
              {weekRecords.filter(r => r.clockInTime && r.clockOutTime).length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Days with Records:</Text>
            <Text style={styles.summaryValue}>
              {weekRecords.filter(r => r.clockInTime).length}
            </Text>
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
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recordsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  recordCard: {
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeSection: {
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  timeValueContainer: {
    alignItems: 'flex-end',
  },
  hoursRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  timeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeLabelText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  locationValue: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  hoursValue: {
    color: colors.primary,
    fontSize: 16,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
