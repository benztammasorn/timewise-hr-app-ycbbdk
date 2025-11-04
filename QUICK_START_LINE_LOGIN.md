
# Quick Start: Line Login Integration

## 🚀 What's New

Your TimeWise HR app now has **Line login** integrated! Users must authenticate with their Line account to access the app.

## 📋 Callback URL

**Add this to your Line Developer Console:**
```
natively://line-callback
```

### Steps to Configure:
1. Go to [Line Developers Console](https://developers.line.biz/)
2. Select Channel ID: 2008377867
3. Go to **OAuth Settings**
4. Add Callback URL: `natively://line-callback`
5. Save

## 🔄 How It Works

### User Flow:
```
1. User opens app
   ↓
2. Sees login screen
   ↓
3. Taps "Sign in with Line"
   ↓
4. Authenticates with Line account
   ↓
5. App checks if user is in database (ref1 = Line ID)
   ↓
6. If authorized → Access app
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

### Line Channel Details:
- **Channel ID**: 2008377867
- **Channel Secret**: 7834db6ad03d6459ff7b79aa52d46ec0
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
| Callback URL not recognized | Add `natively://line-callback` to Line Console |
| User not authorized | Check Line ID exists in database (ref1 field) |
| Deep link not working | Test on actual device, not simulator |
| Login button not working | Check internet connection |

## 📚 Documentation

For detailed information:
- `LINE_LOGIN_SETUP.md` - Complete setup guide
- `LINE_LOGIN_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `CALLBACK_URL_INFO.txt` - Quick reference

## ✅ Checklist

- [ ] Add callback URL to Line Developer Console
- [ ] Test login with your Line account
- [ ] Verify user is in database
- [ ] Test logout functionality
- [ ] Test persistent login (close and reopen app)
- [ ] Test on both iOS and Android

## 🎯 Next Steps

1. **Configure Line Console** - Add callback URL
2. **Test the login** - Try logging in with your Line account
3. **Verify database** - Make sure your Line ID is in the system
4. **Deploy** - Build and release the app

## 💡 Tips

- Users must have their Line ID in the database (ref1 field) to login
- The app stores login state locally, so users stay logged in
- Users can logout from the Profile tab
- All authentication is handled securely with deep linking

## 🆘 Need Help?

1. Check the console logs for error messages
2. Verify callback URL is correct
3. Ensure Line ID exists in database
4. Check internet connection
5. Try on actual device (not simulator)

---

**You're all set! Your app now has Line login integration.** 🎉
