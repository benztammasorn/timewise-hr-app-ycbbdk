
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { handleLineLogin, checkUserAuthorization, storeLineUserInfo, getLineUserInfo } from '@/services/lineAuth';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect as useEffectHook } from 'react';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffectHook(() => {
    // Check if user is already logged in
    checkExistingLogin();
    
    // Handle deep link callback
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  const checkExistingLogin = async () => {
    try {
      const userInfo = await getLineUserInfo();
      if (userInfo) {
        console.log('User already logged in:', userInfo);
        router.replace('/(tabs)/(home)');
      }
    } catch (err) {
      console.log('Error checking existing login:', err);
    }
  };

  const handleDeepLink = async (event: { url: string }) => {
    console.log('Deep link received:', event.url);
    
    // Extract code from URL
    const url = new URL(event.url);
    const code = url.searchParams.get('code');
    
    if (code) {
      console.log('Authorization code from deep link:', code);
      // In a real scenario, you would exchange this code for an access token
      // For now, we'll use the code as a placeholder for the Line ID
      await performAuthorization(code);
    }
  };

  const performAuthorization = async (lineId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Performing authorization check...');
      
      // Check if user is authorized
      const authResult = await checkUserAuthorization(lineId);
      
      if (authResult.authorized) {
        console.log('User authorized, storing info and navigating...');
        
        // Store user info
        await storeLineUserInfo(lineId, authResult.data);
        
        // Navigate to home screen
        router.replace('/(tabs)/(home)');
      } else {
        setError('No authorization found. Please contact your administrator.');
        Alert.alert(
          'Authorization Failed',
          'Your Line ID is not registered in the system. Please contact your administrator.',
          [{ text: 'OK', onPress: () => setError(null) }]
        );
      }
    } catch (err) {
      const errorMessage = String(err);
      setError(errorMessage);
      console.log('Authorization error:', err);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginPress = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting Line login...');
      const result = await handleLineLogin();
      
      if (result.success && result.code) {
        console.log('Login successful, code:', result.code);
        await performAuthorization(result.code);
      } else {
        const errorMsg = result.error || 'Login failed';
        setError(errorMsg);
        Alert.alert('Login Failed', errorMsg);
      }
    } catch (err) {
      const errorMessage = String(err);
      setError(errorMessage);
      console.log('Login error:', err);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.headerSection}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <IconSymbol 
              name="person.crop.circle.fill"
              size={64}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.title}>TimeWise HR</Text>
          <Text style={styles.subtitle}>Employee Time Tracking System</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={styles.infoTitle}>Welcome</Text>
          <Text style={styles.infoText}>
            Sign in with your Line account to access the time tracking system.
          </Text>
        </View>

        {error && (
          <View style={[styles.errorCard, { backgroundColor: colors.danger }]}>
            <IconSymbol 
              name="exclamationmark.circle.fill"
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.loginButton,
              { backgroundColor: colors.primary },
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleLoginPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.buttonText}>Signing in...</Text>
              </>
            ) : (
              <>
                <IconSymbol 
                  name="line.horizontal.3"
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.buttonText}>Sign in with Line</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </Text>
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
    justifyContent: 'center',
    minHeight: '100%',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  errorText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 32,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
