
# Line Login Integration Setup Guide - HTTP Callback Required

## ⚠️ IMPORTANT: Line Does Not Accept Deep Links

Line OAuth requires a valid **HTTP/HTTPS URL** for callbacks. Deep links like `natively://line-callback` are **NOT accepted** by Line.

## Solution: Web-Based Callback Handler

You need to set up a backend endpoint that:
1. Receives the authorization code from Line
2. Exchanges it for an access token
3. Redirects back to your app with the Line ID

## Line Channel Configuration

### Channel Details
- **Channel ID**: 2008377867
- **Channel Secret**: 7834db6ad03d6459ff7b79aa52d46ec0
- **API Endpoint**: https://open-api.dataslot.app/search/wfm/v1/JNLVision

## Callback URL Setup

### Step 1: Set Up Your Backend Callback Endpoint

You need a web server with an endpoint at: `https://yourdomain.com/line-callback`

**Example Node.js/Express Implementation:**

```javascript
const express = require('express');
const axios = require('axios');
const app = express();

app.get('/line-callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    console.log('Received code:', code);
    console.log('Received state:', state);
    
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://api.line.me/oauth2/v2.1/token',
      {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'https://yourdomain.com/line-callback',
        client_id: '2008377867',
        client_secret: '7834db6ad03d6459ff7b79aa52d46ec0'
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    // Get user profile
    const profileResponse = await axios.get(
      'https://api.line.me/v2/profile',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    const lineId = profileResponse.data.userId;
    
    // Redirect back to app with the Line ID
    res.redirect(`natively://line-callback?code=${lineId}&state=${state}`);
    
  } catch (error) {
    console.error('Error in callback:', error);
    res.status(500).send('Authentication failed');
  }
});

app.listen(3000, () => {
  console.log('Callback server running on port 3000');
});
```

### Step 2: Deploy Your Backend

Options:
- **Vercel** (Recommended for serverless): https://vercel.com/
- **AWS Lambda**: https://aws.amazon.com/lambda/
- **Heroku**: https://www.heroku.com/
- **Your own VPS**: DigitalOcean, Linode, etc.
- **Local testing with ngrok**: https://ngrok.com/

### Step 3: Update Line Developer Console

1. Go to [Line Developers Console](https://developers.line.biz/)
2. Select your channel (Channel ID: 2008377867)
3. Navigate to **Basic Settings**
4. Find the **Callback URL** field
5. Enter: `https://yourdomain.com/line-callback`
6. Save the changes

### Step 4: Update App Configuration

In `services/lineAuth.ts`, update:

```typescript
const CALLBACK_URL = 'https://yourdomain.com/line-callback'; // Replace with your actual domain
```

### Step 5: Update app.json

The app.json is already configured with:

```json
"deepLinks": [
  "natively://line-callback",
  "https://yourdomain.com/line-callback"
]
```

## How It Works

### 1. Login Flow

When a user opens the app:
1. If not logged in, they see the **Login Screen** (`app/login.tsx`)
2. User taps "Sign in with Line" button
3. The app opens Line's OAuth login page in a browser using `expo-web-browser`
4. User authenticates with their Line account
5. Line redirects to: `https://yourdomain.com/line-callback?code=...&state=...`
6. Your backend receives the code and exchanges it for an access token
7. Your backend gets the user's Line ID from their profile
8. Your backend redirects to: `natively://line-callback?code=<lineId>&state=...`
9. The app receives the redirect and extracts the Line ID

### 2. Authorization Check

After successful Line login:
1. The app extracts the Line ID from the callback URL
2. The app makes a POST request to the DataSlot API endpoint
3. The API checks if the user exists in the database using the Line ID (ref1 field)

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

⚠️ **IMPORTANT:**

1. **Channel Secret**: 
   - ❌ NEVER expose the channel secret in the app
   - ✅ Always handle token exchange on your backend
   - ✅ Keep the secret secure on your server only

2. **State Parameter**:
   - ✅ Always verify the state parameter to prevent CSRF attacks
   - ✅ Store state in session/database before redirecting to Line
   - ✅ Validate state matches when receiving callback

3. **Token Storage**: 
   - User info is stored in AsyncStorage, which is not encrypted
   - Consider using secure storage solutions
   - Implement token refresh mechanisms
   - Add expiration checks

4. **API Calls**: 
   - The authorization check is made directly from the client
   - Consider implementing a backend proxy for production
   - Add request validation and rate limiting
   - Implement proper error handling and logging

5. **HTTPS Only**:
   - Always use HTTPS for all callbacks
   - Never use HTTP in production

## Troubleshooting

### Issue: "Line not accept: natively://line-callback"
- ✅ Solution: Set up an HTTP/HTTPS callback endpoint as described above
- Line requires a valid HTTP/HTTPS URL, not a deep link

### Issue: "Callback not being received"
- Check that your domain is correct in Line Developer Console
- Verify your backend is running and accessible
- Check firewall/network settings
- Use ngrok to test locally
- Verify the redirect URL in your backend matches the app scheme

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
- Verify your backend is redirecting to the correct deep link format

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
