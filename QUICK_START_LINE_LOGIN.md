
# Quick Start: Line Login Integration - HTTP Callback Required

## ⚠️ IMPORTANT: Line Does Not Accept Deep Links

Line OAuth requires a valid **HTTP/HTTPS URL** for callbacks. You must set up a backend endpoint.

## 🚀 What's New

Your TimeWise HR app now has **Line login** integrated! Users must authenticate with their Line account to access the app.

## 📋 Callback URL Setup

You need to set up a backend endpoint at: `https://yourdomain.com/line-callback`

### Steps to Configure:

1. **Set up backend endpoint** (see below)
2. Go to [Line Developers Console](https://developers.line.biz/)
3. Select Channel ID: 2008377867
4. Go to **Basic Settings**
5. Add Callback URL: `https://yourdomain.com/line-callback`
6. Save

### Backend Endpoint Example (Node.js/Express):

```javascript
const express = require('express');
const axios = require('axios');
const app = express();

app.get('/line-callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
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
    
    // Redirect back to app
    res.redirect(`natively://line-callback?code=${lineId}&state=${state}`);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Authentication failed');
  }
});

app.listen(3000);
```

### Deploy Options:
- **Vercel** (Recommended): https://vercel.com/
- **AWS Lambda**: https://aws.amazon.com/lambda/
- **Heroku**: https://www.heroku.com/
- **Local with ngrok**: https://ngrok.com/

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
6. Line redirects to: https://yourdomain.com/line-callback?code=...
   ↓
7. Backend exchanges code for access token
   ↓
8. Backend gets user's Line ID
   ↓
9. Backend redirects to: natively://line-callback?code=<lineId>
   ↓
10. App receives Line ID and checks authorization
    ↓
11. If authorized → Access app
    If not authorized → See error message
```

## 📁 Files Changed

### New Files:
- `services/lineAuth.ts` - Authentication logic
- `app/login.tsx` - Login screen UI

### Modified Files:
- `app.json` - Added deep linking
- `app/_layout.tsx` - Added login state management
- `app/(tabs)/profile.tsx` - Added logout button

## 🧪 Testing

### Test 1: Login
1. Open app
2. Tap "Sign in with Line"
3. Complete Line authentication
4. Should see main app (if authorized)

### Test 2: Logout
1. Go to Profile tab
2. Tap "Logout"
3. Should return to login screen

### Test 3: Persistent Login
1. Login successfully
2. Close and reopen app
3. Should skip login screen

## 🔑 Key Functions

```typescript
// In services/lineAuth.ts

// Start login
await handleLineLogin();

// Check authorization
await checkUserAuthorization(lineId);

// Store user info
await storeLineUserInfo(lineId, userInfo);

// Get user info
await getLineUserInfo();

// Logout
await logout();
```

## ⚙️ Configuration

### Step 1: Update App Configuration

In `services/lineAuth.ts`, update:

```typescript
const CALLBACK_URL = 'https://yourdomain.com/line-callback'; // Your actual domain
```

### Line Channel Details:
- **Channel ID**: 2008377867
- **Channel Secret**: 7834db6ad03d6459ff7b79aa52d46ec0 (Keep this secret!)
- **API Endpoint**: https://open-api.dataslot.app/search/wfm/v1/JNLVision

### Authorization Check:
The app checks if user exists in database using:
- Company: JNLVision
- Workflow: HR_EMPLOYEE
- Type: TASK
- ref1: Line ID

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Line not accept: natively://line-callback" | Set up HTTP/HTTPS backend endpoint (see above) |
| Callback not being received | Verify backend is running and accessible |
| User not authorized | Check Line ID exists in database (ref1 field) |
| Deep link not working | Test on actual device, not simulator |
| Login button not working | Check internet connection |
| Backend not redirecting | Verify redirect URL format: `natively://line-callback?code=...` |

## 📚 Documentation

For detailed information:
- `LINE_LOGIN_SETUP.md` - Complete setup guide
- `LINE_LOGIN_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `CALLBACK_URL_INFO.txt` - Quick reference

## ✅ Checklist

- [ ] Set up backend callback endpoint
- [ ] Deploy backend to your domain
- [ ] Update `services/lineAuth.ts` with your domain
- [ ] Add callback URL to Line Developer Console
- [ ] Test login with your Line account
- [ ] Verify user is in database
- [ ] Test logout functionality
- [ ] Test persistent login (close and reopen app)
- [ ] Test on both iOS and Android

## 🎯 Next Steps

1. **Set up backend** - Create callback endpoint
2. **Deploy backend** - Use Vercel, AWS Lambda, or your own server
3. **Update app config** - Set CALLBACK_URL in services/lineAuth.ts
4. **Configure Line Console** - Add callback URL
5. **Test the login** - Try logging in with your Line account
6. **Verify database** - Make sure your Line ID is in the system
7. **Deploy** - Build and release the app

## 💡 Tips

- Users must have their Line ID in the database (ref1 field) to login
- The app stores login state locally, so users stay logged in
- Users can logout from the Profile tab
- Never expose your LINE_CHANNEL_SECRET in the app
- Always use HTTPS for production callbacks
- Test with ngrok locally before deploying

## 🆘 Need Help?

1. Check the console logs for error messages
2. Verify backend is running and accessible
3. Verify callback URL is correct in Line Console
4. Ensure Line ID exists in database
5. Check internet connection
6. Try on actual device (not simulator)
7. Review LINE_LOGIN_SETUP.md for detailed setup

---

**Your app now has Line login integration!** 🎉

**Next: Set up your backend callback endpoint and deploy it to your domain.**
