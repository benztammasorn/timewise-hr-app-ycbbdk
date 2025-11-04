
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

const LINE_CHANNEL_ID = '2008377867';
const LINE_CHANNEL_SECRET = '7834db6ad03d6459ff7b79aa52d46ec0';
const API_ENDPOINT = 'https://open-api.dataslot.app/search/wfm/v1/JNLVision';

// Line OAuth endpoints
const LINE_AUTH_ENDPOINT = 'https://access.line.me/oauth2/v2.1/authorize';
const LINE_TOKEN_ENDPOINT = 'https://api.line.me/oauth2/v2.1/token';
const LINE_PROFILE_ENDPOINT = 'https://api.line.me/v2/profile';

// Generate redirect URI using expo-auth-session
const getRedirectUri = () => {
  const redirectUri = makeRedirectUri({
    scheme: 'natively',
    path: 'line-callback',
  });
  console.log('Redirect URI:', redirectUri);
  return redirectUri;
};

// Generate a random state for CSRF protection
const generateState = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Handle Line login using expo-auth-session pattern
export const handleLineLogin = async () => {
  try {
    const redirectUri = getRedirectUri();
    const state = generateState();
    
    // Store state for verification
    await AsyncStorage.setItem('lineLoginState', state);
    
    // Build the authorization URL
    const authUrl = `${LINE_AUTH_ENDPOINT}?response_type=code&client_id=${LINE_CHANNEL_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=profile%20openid`;
    
    console.log('Opening Line login...');
    console.log('Auth URL:', authUrl);
    
    // Open the browser for authentication
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    
    console.log('WebBrowser result type:', result.type);
    
    if (result.type === 'success') {
      const url = result.url;
      console.log('Callback URL:', url);
      
      // Parse the callback URL
      const urlParams = new URL(url);
      const code = urlParams.searchParams.get('code');
      const returnedState = urlParams.searchParams.get('state');
      
      console.log('Authorization code received:', !!code);
      console.log('State match:', state === returnedState);
      
      // Verify state matches
      const storedState = await AsyncStorage.getItem('lineLoginState');
      if (returnedState !== storedState) {
        console.log('State mismatch - possible CSRF attack');
        return { success: false, error: 'State verification failed' };
      }
      
      if (code) {
        // Exchange code for access token
        const tokenResult = await exchangeCodeForToken(code, redirectUri);
        if (tokenResult.success && tokenResult.accessToken) {
          // Get user profile
          const profileResult = await getLineUserProfile(tokenResult.accessToken);
          if (profileResult.success && profileResult.userId) {
            return { 
              success: true, 
              userId: profileResult.userId,
              accessToken: tokenResult.accessToken,
              profile: profileResult.profile
            };
          } else {
            return { success: false, error: 'Failed to get user profile' };
          }
        } else {
          return { success: false, error: tokenResult.error || 'Failed to exchange code for token' };
        }
      } else {
        return { success: false, error: 'No authorization code received' };
      }
    } else if (result.type === 'cancel') {
      console.log('User cancelled Line login');
      return { success: false, error: 'User cancelled login' };
    } else if (result.type === 'dismiss') {
      console.log('User dismissed Line login');
      return { success: false, error: 'User dismissed login' };
    }
    
    return { success: false, error: 'Unknown error' };
  } catch (error) {
    console.log('Error during Line login:', error);
    return { success: false, error: String(error) };
  }
};

// Exchange authorization code for access token
const exchangeCodeForToken = async (code: string, redirectUri: string) => {
  try {
    console.log('Exchanging code for token...');
    
    const response = await fetch(LINE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: LINE_CHANNEL_ID,
        client_secret: LINE_CHANNEL_SECRET,
      }).toString(),
    });
    
    console.log('Token exchange response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.log('Token exchange error:', errorData);
      return { success: false, error: `Token exchange failed: ${response.status}` };
    }
    
    const data = await response.json();
    console.log('Token exchange successful');
    
    return { 
      success: true, 
      accessToken: data.access_token,
      idToken: data.id_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.log('Error exchanging code for token:', error);
    return { success: false, error: String(error) };
  }
};

// Get Line user profile
const getLineUserProfile = async (accessToken: string) => {
  try {
    console.log('Fetching Line user profile...');
    
    const response = await fetch(LINE_PROFILE_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    console.log('Profile fetch response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.log('Profile fetch error:', errorData);
      return { success: false, error: `Profile fetch failed: ${response.status}` };
    }
    
    const profile = await response.json();
    console.log('User profile fetched successfully');
    console.log('User ID:', profile.userId);
    
    return { 
      success: true, 
      userId: profile.userId,
      profile: {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
      }
    };
  } catch (error) {
    console.log('Error fetching user profile:', error);
    return { success: false, error: String(error) };
  }
};

// Check user authorization using Line ID
export const checkUserAuthorization = async (lineId: string) => {
  try {
    console.log('Checking authorization for Line ID:', lineId);
    
    const requestBody = {
      hitsPerPage: 500,
      page: 1,
      filter: [
        'company = JNLVision',
        'workflowId IN [ "HR_EMPLOYEE" ]',
        'type = TASK',
        `ref1 = ${lineId}`
      ],
      sort: ['timestamp:desc']
    };
    
    console.log('API Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response data:', JSON.stringify(data, null, 2));
    
    // Check if user has records in the database
    if (data && data.hits && Array.isArray(data.hits) && data.hits.length > 0) {
      console.log('User authorized - found', data.hits.length, 'records');
      return { authorized: true, data: data.hits[0] };
    } else {
      console.log('User not authorized - no records found');
      return { authorized: false, data: null };
    }
  } catch (error) {
    console.log('Error checking authorization:', error);
    return { authorized: false, data: null, error: String(error) };
  }
};

// Store Line user info
export const storeLineUserInfo = async (lineId: string, userInfo: any, profile?: any) => {
  try {
    const userData = {
      lineId,
      userInfo,
      profile,
      loginTime: new Date().toISOString(),
    };
    await AsyncStorage.setItem('lineUserInfo', JSON.stringify(userData));
    console.log('Line user info stored');
  } catch (error) {
    console.log('Error storing Line user info:', error);
  }
};

// Get stored Line user info
export const getLineUserInfo = async () => {
  try {
    const userInfo = await AsyncStorage.getItem('lineUserInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.log('Error retrieving Line user info:', error);
    return null;
  }
};

// Logout
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('lineUserInfo');
    await AsyncStorage.removeItem('lineLoginState');
    console.log('User logged out');
  } catch (error) {
    console.log('Error during logout:', error);
  }
};
