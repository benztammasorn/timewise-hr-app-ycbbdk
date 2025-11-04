
# Debugging Line Login

## Console Logs

The app logs detailed information to help debug issues. Check the console for:

```
✓ Login status checked: true/false
✓ Callback URL: natively://line-callback
✓ Line Login URL: https://web.line.biz/...
✓ WebBrowser result: {type: 'success', url: '...'}
✓ Authorization code: ...
✓ Checking authorization for Line ID: ...
✓ API Request: {...}
✓ API Response status: 200
✓ API Response data: {...}
✓ User authorized - found X records
✓ Line user info stored
✓ User logged out successfully
```

## Common Issues and Solutions

### Issue 1: "Callback URL not recognized"

**Symptoms:**
- Line login page doesn't redirect back to app
- User stuck on Line login page

**Solutions:**
1. Verify callback URL in Line Console: `natively://line-callback`
2. Rebuild the app: `expo prebuild -p ios` or `expo prebuild -p android`
3. Clear app cache and reinstall
4. Test on actual device (not simulator)

**Debug:**
```
Check console for: "Callback URL: natively://line-callback"
```

### Issue 2: "User not authorized"

**Symptoms:**
- Login succeeds but shows "No authorization found" error
- User can't access the app

**Solutions:**
1. Verify Line ID exists in database
2. Check ref1 field matches Line ID
3. Verify company name is "JNLVision"
4. Check workflowId is "HR_EMPLOYEE"
5. Ensure type is "TASK"

**Debug:**
```
Check console for:
- "Checking authorization for Line ID: ..."
- "API Response data: {...}"
- "User authorized - found X records" or "User not authorized"
```

### Issue 3: "Deep link not working"

**Symptoms:**
- App doesn't receive callback from Line
- No redirect after Line authentication

**Solutions:**
1. Test on actual device (not simulator)
2. Ensure app is properly built with deep linking
3. Check app.json has deepLinks configured
4. Rebuild the app after changing app.json

**Debug:**
```
Check console for: "Deep link received: natively://line-callback?..."
```

### Issue 4: "API request fails"

**Symptoms:**
- Error message: "HTTP error! status: 404" or "Network error"
- Authorization check fails

**Solutions:**
1. Check internet connection
2. Verify API endpoint is accessible
3. Check request format matches schema
4. Verify company name and workflow ID

**Debug:**
```
Check console for:
- "API Request: {...}"
- "API Response status: ..."
- "Error checking authorization: ..."
```

### Issue 5: "Login button not working"

**Symptoms:**
- Button doesn't respond when tapped
- No error message shown

**Solutions:**
1. Check internet connection
2. Verify Line channel ID and secret are correct
3. Check if app has internet permission
4. Try again after a few seconds

**Debug:**
```
Check console for: "Starting Line login..."
```

## Debugging Steps

### Step 1: Check Console Logs
1. Open the app
2. Open developer console (Expo CLI)
3. Look for log messages
4. Note any error messages

### Step 2: Test Login Flow
1. Tap "Sign in with Line"
2. Complete Line authentication
3. Check if callback is received
4. Check if authorization check is performed

### Step 3: Verify Configuration
1. Check Line Console has correct callback URL
2. Verify app.json has deepLinks configured
3. Check Line channel ID and secret

### Step 4: Test API Endpoint
Use curl to test the API:
```bash
curl --location 'https://open-api.dataslot.app/search/wfm/v1/JNLVision' \
--header 'Content-Type: application/json' \
--header 'Accept: application/json' \
--data '{
    "hitsPerPage": 500,
    "page": 1,
    "filter": [
      "company = JNLVision",
      "workflowId IN [ \"HR_EMPLOYEE\" ]",
      "type = TASK",
      "ref1 = YOUR_LINE_ID"
    ],
    "sort": ["timestamp:desc"]
  }'
```

### Step 5: Check AsyncStorage
To verify user data is stored:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const userInfo = await AsyncStorage.getItem('lineUserInfo');
console.log('Stored user info:', userInfo);
```

## Log Examples

### Successful Login
```
Starting Line login...
Callback URL: natively://line-callback
Line Login URL: https://web.line.biz/dialog/oauth/weblogin?...
WebBrowser result: {type: 'success', url: 'natively://line-callback?code=...&state=...'}
Callback URL received: natively://line-callback?code=...&state=...
Authorization code: ...
Performing authorization check...
Checking authorization for Line ID: ...
API Request: {...}
API Response status: 200
API Response data: {hits: [...]}
User authorized - found 1 records
Line user info stored
User logged in successfully
```

### Failed Authorization
```
Starting Line login...
Callback URL: natively://line-callback
Line Login URL: https://web.line.biz/dialog/oauth/weblogin?...
WebBrowser result: {type: 'success', url: 'natively://line-callback?code=...&state=...'}
Callback URL received: natively://line-callback?code=...&state=...
Authorization code: ...
Performing authorization check...
Checking authorization for Line ID: ...
API Request: {...}
API Response status: 200
API Response data: {hits: []}
User not authorized - no records found
Authorization error: No authorization found
```

## Performance Tips

1. **Reduce API calls**: Cache authorization results
2. **Optimize deep linking**: Use proper URL encoding
3. **Handle timeouts**: Add timeout to API requests
4. **Batch requests**: Combine multiple API calls if possible

## Security Considerations

1. **Never log sensitive data**: Don't log tokens or secrets
2. **Validate responses**: Always validate API responses
3. **Handle errors gracefully**: Don't expose internal errors to users
4. **Use HTTPS**: Always use HTTPS for API calls
5. **Secure storage**: Use secure storage for sensitive data

## Testing Checklist

- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Test on web (if applicable)
- [ ] Test with valid Line ID
- [ ] Test with invalid Line ID
- [ ] Test with no internet connection
- [ ] Test logout functionality
- [ ] Test persistent login
- [ ] Test with different Line accounts
- [ ] Check console logs for errors

## Additional Resources

- [Line Developers Documentation](https://developers.line.biz/)
- [Expo Web Browser Documentation](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
- [Expo Linking Documentation](https://docs.expo.dev/versions/latest/sdk/linking/)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/)

## Getting Help

If you're still having issues:
1. Check the console logs carefully
2. Review the LINE_LOGIN_SETUP.md guide
3. Verify all configuration is correct
4. Test the API endpoint with curl
5. Try on a different device
6. Check Line Developers documentation
