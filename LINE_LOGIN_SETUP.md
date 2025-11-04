
# Line Login Integration Setup Guide

## Overview
This guide explains how to set up and use the Line login functionality in your TimeWise HR app.

## Line Channel Configuration

### Channel Details
- **Channel ID**: 2008377867
- **Channel Secret**: 7834db6ad03d6459ff7b79aa52d46ec0
- **API Endpoint**: https://open-api.dataslot.app/search/wfm/v1/JNLVision

## Callback URL

The callback URL for your app is:
```
natively://line-callback
```

This URL is automatically generated based on your app's scheme configured in `app.json`.

### Setting Up in Line Developer Console

1. Go to [Line Developers Console](https://developers.line.biz/)
2. Select your channel (Channel ID: 2008377867)
3. Navigate to **Basic Settings** or **OAuth Settings**
4. Add the callback URL: `natively://line-callback`
5. Save the changes

## How It Works

### 1. Login Flow

When a user opens the app:
1. If not logged in, they see the **Login Screen** (`app/login.tsx`)
2. User taps "Sign in with Line" button
3. The app opens Line's OAuth login page using `expo-web-browser`
4. User authenticates with their Line account
5. Line redirects back to the app with an authorization code

### 2. Authorization Check

After successful Line login:
1. The app extracts the authorization code from the callback URL
2. The code is used as the Line ID to check authorization
3. The app makes a POST request to the DataSlot API endpoint
4. The API checks if the user exists in the database using the Line ID (ref1 field)

### 3. Authorization Response

**If User is Authorized:**
- User data is stored locally in AsyncStorage
- User is redirected to the main app (Clock In/Out screen)
- User can access all app features

**If User is NOT Authorized:**
- An error message is displayed: "No authorization found"
- User is prompted to contact their administrator
- User remains on the login screen

## API Request Format

The app sends the following request to check authorization:

```json
{
  "hitsPerPage": 500,
  "page": 1,
  "filter": [
    "company = JNLVision",
    "workflowId IN [ \"HR_EMPLOYEE\" ]",
    "type = TASK",
    "ref1 = {LINE_ID}"
  ],
  "sort": ["timestamp:desc"]
}
```

Replace `{LINE_ID}` with the actual Line ID obtained from the login process.

## File Structure

### New Files Created

1. **services/lineAuth.ts**
   - Contains all Line authentication logic
   - Functions:
     - `getLineLoginUrl()` - Generates Line login URL
     - `handleLineLogin()` - Initiates Line login flow
     - `checkUserAuthorization()` - Checks if user is authorized
     - `storeLineUserInfo()` - Stores user info locally
     - `getLineUserInfo()` - Retrieves stored user info
     - `logout()` - Clears user data

2. **app/login.tsx**
   - Login screen UI
   - Handles deep link callbacks
   - Displays login button and error messages
   - Redirects to home screen on successful login

3. **app/_layout.tsx** (Updated)
   - Modified to check login status on app start
   - Conditionally shows login screen or main app
   - Handles authentication state management

4. **app/(tabs)/profile.tsx** (Updated)
   - Added logout button
   - Allows users to logout and return to login screen

## Usage

### For Users

1. **First Time Login:**
   - Open the app
   - Tap "Sign in with Line"
   - Authenticate with your Line account
   - If authorized, you'll be taken to the Clock In/Out screen

2. **Logout:**
   - Go to Profile tab
   - Tap "Logout" button
   - Confirm logout
   - You'll be returned to the login screen

### For Developers

#### Check if User is Logged In

```typescript
import { getLineUserInfo } from '@/services/lineAuth';

const userInfo = await getLineUserInfo();
if (userInfo) {
  console.log('User is logged in:', userInfo);
} else {
  console.log('User is not logged in');
}
```

#### Perform Manual Authorization Check

```typescript
import { checkUserAuthorization } from '@/services/lineAuth';

const result = await checkUserAuthorization('USER_LINE_ID');
if (result.authorized) {
  console.log('User is authorized');
} else {
  console.log('User is not authorized');
}
```

#### Logout Programmatically

```typescript
import { logout } from '@/services/lineAuth';

await logout();
// User data is cleared
```

## Security Considerations

1. **Channel Secret**: The channel secret is currently hardcoded in the service file. For production, consider:
   - Moving it to environment variables
   - Using a backend server to handle token exchange
   - Never expose the secret in client-side code

2. **Token Storage**: User info is stored in AsyncStorage, which is not encrypted. For sensitive data:
   - Consider using secure storage solutions
   - Implement token refresh mechanisms
   - Add expiration checks

3. **API Calls**: The authorization check is made directly from the client. For production:
   - Consider implementing a backend proxy
   - Add request validation and rate limiting
   - Implement proper error handling and logging

## Troubleshooting

### Issue: "Callback URL not recognized"
- Ensure the callback URL in Line Developer Console matches: `natively://line-callback`
- Check that deep linking is properly configured in `app.json`

### Issue: "User not authorized"
- Verify the Line ID exists in the DataSlot database
- Check that the ref1 field matches the Line ID
- Ensure the company name is "JNLVision"
- Verify the workflowId is "HR_EMPLOYEE"

### Issue: "API request fails"
- Check internet connectivity
- Verify the API endpoint is accessible
- Check the request format matches the expected schema
- Review API response for error messages

### Issue: "Deep link not working"
- Ensure the app is properly built with deep linking support
- Test on actual device (not just simulator)
- Check that the scheme is set to "natively" in app.json

## Testing

### Test Login Flow

1. Build and run the app
2. You should see the login screen
3. Tap "Sign in with Line"
4. Complete Line authentication
5. If authorized, you should be redirected to the home screen
6. Check AsyncStorage to verify user data is stored

### Test Logout Flow

1. Go to Profile tab
2. Tap "Logout"
3. Confirm logout
4. You should be returned to the login screen
5. Check AsyncStorage to verify user data is cleared

## Next Steps

1. **Backend Integration**: Implement a backend server to securely handle token exchange
2. **Token Refresh**: Add automatic token refresh mechanism
3. **User Profile**: Fetch and display user profile information from Line
4. **Error Handling**: Implement comprehensive error handling and user feedback
5. **Analytics**: Add analytics to track login success/failure rates

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Line Developers documentation
3. Check the DataSlot API documentation
4. Review console logs for detailed error messages
