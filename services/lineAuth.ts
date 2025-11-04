
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LINE_CHANNEL_ID = '2008377867';
const LINE_CHANNEL_SECRET = '7834db6ad03d6459ff7b79aa52d46ec0';
const API_ENDPOINT = 'https://open-api.dataslot.app/search/wfm/v1/JNLVision';

// Get the callback URL based on the app scheme
const getCallbackUrl = () => {
  const scheme = Linking.createURL('line-callback');
  console.log('Callback URL:', scheme);
  return scheme;
};

// Generate Line login URL
export const getLineLoginUrl = () => {
  const redirectUri = encodeURIComponent(getCallbackUrl());
  const state = Math.random().toString(36).substring(7);
  
  // Store state for verification
  AsyncStorage.setItem('lineLoginState', state).catch(err => 
    console.log('Error storing state:', err)
  );
  
  const loginUrl = `https://web.line.biz/dialog/oauth/weblogin?response_type=code&client_id=${LINE_CHANNEL_ID}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid`;
  
  console.log('Line Login URL:', loginUrl);
  return loginUrl;
};

// Handle Line login
export const handleLineLogin = async () => {
  try {
    const loginUrl = getLineLoginUrl();
    
    const result = await WebBrowser.openAuthSessionAsync(
      loginUrl,
      getCallbackUrl()
    );
    
    console.log('WebBrowser result:', result);
    
    if (result.type === 'success') {
      const url = result.url;
      console.log('Callback URL received:', url);
      
      // Extract authorization code from URL
      const urlParams = new URL(url);
      const code = urlParams.searchParams.get('code');
      const state = urlParams.searchParams.get('state');
      
      console.log('Authorization code:', code);
      console.log('State:', state);
      
      if (code) {
        return { success: true, code, state };
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
    
    console.log('API Request:', JSON.stringify(requestBody, null, 2));
    
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
export const storeLineUserInfo = async (lineId: string, userInfo: any) => {
  try {
    const userData = {
      lineId,
      userInfo,
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
