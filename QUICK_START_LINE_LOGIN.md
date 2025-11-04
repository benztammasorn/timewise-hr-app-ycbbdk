
# Quick Start: Line OAuth Login - React Native

## ✅ GOOD NEWS: No Backend Required!

Your TimeWise HR app now has **Line OAuth 2.0** integrated directly in React Native! The app handles the entire OAuth flow without needing a backend callback endpoint.

## 🚀 What's New

Your app now supports:
- ✓ Line OAuth 2.0 authorization code flow
- ✓ Secure token exchange (code → access token)
- ✓ User profile retrieval (Line ID)
- ✓ Authorization check against your API
- ✓ Persistent login using AsyncStorage
- ✓ CSRF protection with state parameter

## 🔄 How It Works

### User Flow:
```
1. User opens app
   ↓
2. Sees login screen
   ↓
3. Taps "Sign in with Line"
   ↓
4. Browser opens Line login page
   ↓
5. User authenticates with Line account
   ↓
6. Line redirects to: natively://line-callback?code=...&state=...
   ↓
7. App receives redirect (handled by expo-web-browser)
   ↓
8. App extracts authorization code
   ↓
9. App exchanges code for access token (via Line API)
   ↓
10. App retrieves user profile (Line ID)
    ↓
11. App checks authorization against your API
    ↓
12. If authorized → Access app
    If not authorized → See error message
```

## ⚙️ Configuration

### NO SETUP REQUIRED!

The app is already configured with:
- ✓ Channel ID: 2008377867
- ✓ Channel Secret: 7834db6ad03d6459ff7b79aa52d46ec0
- ✓ Deep link scheme: natively://line-callback
- ✓ OAuth endpoints configured

**Just test it!** No backend setup needed.

## 📁 Files Changed

### Updated Files:
- `services/lineAuth.ts` - Complete OAuth 2.0 implementation
- `app/login.tsx` - Login screen UI
- `app.json` - Deep linking configuration
- `app/_layout.tsx` - Login state management

## 🧪 Testing

### Test 1: Login
1. Open app on iOS or Android device
2. Tap "Sign in with Line"
3. Browser opens with Line login page
4. Log in with your Line account
5. You'll be redirected back to the app
6. If your Line ID is in the database → Access app
7. If not → See "No authorization" error

### Test 2: Logout
1. Go to Profile tab
2. Tap "Logout"
3. Should return to login screen

### Test 3: Persistent Login
1. Login successfully
2. Close and reopen app
3. Should skip login screen and go directly to home

### Test 4: Check Console Logs
Open the console to see the OAuth flow:
- "Opening Line login..." - Login started
- "Callback URL:" - Received redirect from Line
- "Authorization code received:" - Code extracted
- "Token exchange successful" - Got access token
- "User profile fetched successfully" - Got Line ID
- "Checking authorization for Line ID:" - Checking database
- "User authorized" or "User not authorized" - Final result

## 🔑 Key Functions

```typescript
// In services/lineAuth.ts

// Start OAuth login
const result = await handleLineLogin();
// Returns: { success, userId, accessToken, profile }

// Check authorization
const authResult = await checkUserAuthorization(lineId);
// Returns: { authorized, data }

// Store user info
await storeLineUserInfo(lineId, userInfo, profile);

// Get user info
const userInfo = await getLineUserInfo();

// Logout
await logout();
```

## 📋 Line Channel Details

- **Channel ID**: 2008377867
- **Channel Secret**: 7834db6ad03d6459ff7b79aa52d46ec0
- **Deep Link Scheme**: natively://line-callback
- **API Endpoint**: https://open-api.dataslot.app/search/wfm/v1/JNLVision

## 🔐 Authorization Check

The app checks if user exists in database using:
- **Company**: JNLVision
- **Workflow**: HR_EMPLOYEE
- **Type**: TASK
- **ref1**: Line ID (must match)

**Important**: Your Line ID must be in the database (ref1 field) to login!

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Login button doesn't work | Check internet connection |
| Browser doesn't open | Make sure you're on iOS/Android (not web) |
| Callback not received | Check console logs for errors |
| "User not authorized" error | Verify your Line ID is in database (ref1 field) |
| Deep link not working | Test on actual device, not simulator |
| Token exchange fails | Check internet connection and Line API status |
| Can't see console logs | Use `expo start` and check terminal output |

## 📚 How to Debug

1. **Check Console Logs**:
   ```bash
   expo start
   # Watch the terminal for logs
   ```

2. **Common Log Messages**:
   - ✓ "Opening Line login..." - Good, login started
   - ✓ "Token exchange successful" - Good, got access token
   - ✓ "User profile fetched successfully" - Good, got Line ID
   - ✓ "User authorized" - Good, logged in!
   - ✗ "User not authorized" - Line ID not in database
   - ✗ "Token exchange failed" - Check internet connection

3. **Check Your Database**:
   - Make sure your Line ID is in the database
   - Check the ref1 field matches your Line ID
   - Verify company is "JNLVision"

## ✅ Checklist

- [ ] Test login with your Line account
- [ ] Verify your Line ID is in the database
- [ ] Check console logs for any errors
- [ ] Test logout functionality
- [ ] Test persistent login (close and reopen app)
- [ ] Test on both iOS and Android
- [ ] Verify authorization check works

## 🎯 Next Steps

1. **Test the login** - Try logging in with your Line account
2. **Check database** - Make sure your Line ID is in the system (ref1 field)
3. **Review logs** - Check console for any errors
4. **Test all features** - Login, logout, persistent login
5. **Deploy** - Build and release the app

## 💡 Tips

- Users must have their Line ID in the database (ref1 field) to login
- The app stores login state locally, so users stay logged in
- Users can logout from the Profile tab
- The OAuth flow is secure with CSRF protection (state parameter)
- Access tokens are not stored (only user info)
- Deep link callback is secure (uses natively:// scheme)

## 🆘 Need Help?

1. Check the console logs for error messages
2. Verify your Line ID is in the database
3. Make sure you're testing on iOS or Android (not web)
4. Check internet connection
5. Try on actual device (not simulator)
6. Review the console logs for specific error messages

---

**Your app now has Line OAuth login!** 🎉

**Just test it - no backend setup required!**
