import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { ScrollView, Pressable, StyleSheet, View, Text, Platform, Alert } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/styles/commonStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

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

export default function HomeScreen() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [todayRecord, setTodayRecord] = useState<ClockRecord | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    requestLocationPermission();
    loadTodayRecord();

    return () => clearInterval(timer);
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      setLocationPermission(hasPermission);
      console.log('Location permission:', hasPermission ? 'granted' : 'denied');
    } catch (error) {
      console.log('Error requesting location permission:', error);
      setLocationPermission(false);
    }
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      if (!locationPermission) {
        console.log('Location permission not granted');
        return null;
      }

      setIsLoadingLocation(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };

      console.log('Location obtained:', locationData);
      return locationData;
    } catch (error) {
      console.log('Error getting location:', error);
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const loadTodayRecord = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const records = await AsyncStorage.getItem('clockRecords');
      if (records) {
        const parsedRecords: ClockRecord[] = JSON.parse(records);
        const record = parsedRecords.find(r => r.date === today);
        if (record) {
          setTodayRecord(record);
          setIsClockedIn(record.clockInTime !== null && record.clockOutTime === null);
          setClockInTime(record.clockInTime);
        }
      }
    } catch (error) {
      console.log('Error loading clock records:', error);
    }
  };

  const handleClockIn = async () => {
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      });
      
      const location = await getCurrentLocation();
      
      const today = now.toISOString().split('T')[0];
      const records = await AsyncStorage.getItem('clockRecords');
      let allRecords: ClockRecord[] = records ? JSON.parse(records) : [];
      
      const existingIndex = allRecords.findIndex(r => r.date === today);
      if (existingIndex >= 0) {
        allRecords[existingIndex].clockInTime = timeString;
        allRecords[existingIndex].clockInLocation = location;
      } else {
        allRecords.push({
          date: today,
          clockInTime: timeString,
          clockOutTime: null,
          clockInLocation: location,
          clockOutLocation: null,
        });
      }
      
      await AsyncStorage.setItem('clockRecords', JSON.stringify(allRecords));
      setIsClockedIn(true);
      setClockInTime(timeString);
      setTodayRecord(allRecords[existingIndex >= 0 ? existingIndex : allRecords.length - 1]);
      
      const locationText = location 
        ? `at ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
        : '(location unavailable)';
      Alert.alert('Success', `Clocked in at ${timeString} ${locationText}`);
    } catch (error) {
      console.log('Error clocking in:', error);
      Alert.alert('Error', 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      });
      
      const location = await getCurrentLocation();
      
      const today = now.toISOString().split('T')[0];
      const records = await AsyncStorage.getItem('clockRecords');
      let allRecords: ClockRecord[] = records ? JSON.parse(records) : [];
      
      const existingIndex = allRecords.findIndex(r => r.date === today);
      if (existingIndex >= 0) {
        allRecords[existingIndex].clockOutTime = timeString;
        allRecords[existingIndex].clockOutLocation = location;
      }
      
      await AsyncStorage.setItem('clockRecords', JSON.stringify(allRecords));
      setIsClockedIn(false);
      setTodayRecord(allRecords[existingIndex]);
      
      const locationText = location 
        ? `at ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
        : '(location unavailable)';
      Alert.alert('Success', `Clocked out at ${timeString} ${locationText}`);
    } catch (error) {
      console.log('Error clocking out:', error);
      Alert.alert('Error', 'Failed to clock out');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Clock In/Out",
          }}
        />
      )}
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
        <ScrollView 
          style={styles.container}
          contentContainerStyle={[
            styles.contentContainer,
            Platform.OS !== 'ios' && styles.contentContainerWithTabBar
          ]}
        >
          <View style={styles.headerSection}>
            <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          </View>

          <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot,
                { backgroundColor: isClockedIn ? colors.accent : colors.secondary }
              ]} />
              <Text style={[
                styles.statusText,
                { color: isClockedIn ? colors.accent : colors.secondary }
              ]}>
                {isClockedIn ? 'Clocked In' : 'Clocked Out'}
              </Text>
            </View>
            
            {!locationPermission && (
              <Text style={[styles.clockTimeText, { color: colors.accent }]}>
                ⚠️ Location permission required for GPS tracking
              </Text>
            )}
            
            {clockInTime && (
              <Text style={styles.clockTimeText}>
                Clocked in at: {clockInTime}
              </Text>
            )}
            
            {todayRecord?.clockInLocation && (
              <Text style={styles.locationText}>
                📍 In: {todayRecord.clockInLocation.latitude.toFixed(4)}, {todayRecord.clockInLocation.longitude.toFixed(4)}
              </Text>
            )}
            
            {todayRecord?.clockOutTime && (
              <Text style={styles.clockTimeText}>
                Clocked out at: {todayRecord.clockOutTime}
              </Text>
            )}
            
            {todayRecord?.clockOutLocation && (
              <Text style={styles.locationText}>
                📍 Out: {todayRecord.clockOutLocation.latitude.toFixed(4)}, {todayRecord.clockOutLocation.longitude.toFixed(4)}
              </Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[
                styles.clockButton,
                { 
                  backgroundColor: isClockedIn ? colors.secondary : colors.primary,
                  opacity: isClockedIn ? 0.6 : 1
                }
              ]}
              onPress={handleClockIn}
              disabled={isClockedIn || isLoadingLocation}
            >
              <IconSymbol 
                name={isLoadingLocation ? "hourglass" : "arrow.right.circle.fill"}
                size={32} 
                color="#FFFFFF" 
              />
              <Text style={styles.buttonText}>{isLoadingLocation ? 'Getting Location...' : 'Clock In'}</Text>
            </Pressable>

            <Pressable
              style={[
                styles.clockButton,
                { 
                  backgroundColor: isClockedIn ? colors.accent : colors.secondary,
                  opacity: !isClockedIn ? 0.6 : 1
                }
              ]}
              onPress={handleClockOut}
              disabled={!isClockedIn || isLoadingLocation}
            >
              <IconSymbol 
                name={isLoadingLocation ? "hourglass" : "arrow.left.circle.fill"}
                size={32} 
                color="#FFFFFF" 
              />
              <Text style={styles.buttonText}>{isLoadingLocation ? 'Getting Location...' : 'Clock Out'}</Text>
            </Pressable>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <Text style={styles.infoTitle}>Today's Summary</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Clock In:</Text>
              <Text style={styles.infoValue}>{todayRecord?.clockInTime || 'Not clocked in'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Clock Out:</Text>
              <Text style={styles.infoValue}>{todayRecord?.clockOutTime || 'Not clocked out'}</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  dateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
  clockTimeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  clockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    gap: 12,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    borderRadius: 12,
    padding: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
