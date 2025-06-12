# Authentication Issues Troubleshooting Guide

This guide helps diagnose and fix common authentication issues in the Renavest application.

## Common Issues

### 1. "Failed to send reset link" Error

**Symptoms:**
- User clicks "Forgot Password" and gets "Failed to send reset link" error
- Error occurs regardless of email address entered

**Possible Causes:**

#### A. Account Not Found in Clerk
- **Issue**: The email address is not registered in Clerk's user database
- **Solution**: User needs to sign up for an account first
- **Error Message**: "No account found with this email address. Please check your email or sign up for a new account."

#### B. Social Login Account
- **Issue**: The email is associated with a social login (Google, etc.) but user is trying password reset
- **Solution**: User should sign in using their social account instead
- **Error Message**: "This email is associated with a social login. Please sign in using your social account."

#### C. Environment Configuration Issues
- **Issue**: Missing or incorrect Clerk environment variables
- **Check**: Use the debug endpoint `/api/debug/auth-status` (development only)

### 2. "Couldn't find account" Error

**Symptoms:**
- User enters credentials and gets "couldn't find account" error
- Occurs when user enters an old password

**Possible Causes:**

#### A. Account Doesn't Exist
- **Issue**: No account exists with the provided email address
- **Solution**: User needs to sign up for a new account
- **Error Message**: "No account found with this email address. Please check your email or sign up for a new account."

#### B. Incorrect Password
- **Issue**: Account exists but password is wrong
- **Solution**: User should use "Forgot password?" to reset their password
- **Error Message**: "Incorrect password. Please try again or use 'Forgot password?' to reset it."

## Environment Configuration Checklist

### Required Environment Variables

```bash
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... # or pk_live_ for production
CLERK_SECRET_KEY=sk_test_... # or sk_live_ for production

# Optional but Recommended
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/

# Webhook (if using webhooks)
CLERK_WEBHOOK_SECRET=whsec_...
```

### Validation Steps

1. **Check Environment Variables**
   ```bash
   # In development, check the debug endpoint
   curl http://localhost:3000/api/debug/auth-status
   ```

2. **Verify Clerk Dashboard Settings**
   - Go to your Clerk Dashboard
   - Check Email, phone, username settings
   - Ensure Password authentication is enabled
   - Verify Email verification code is enabled

3. **Check Application Domain**
   - In Clerk Dashboard > Domains
   - Ensure your application domain is correctly configured
   - For development: `localhost:3000`
   - For production: your actual domain

## Debugging Steps

### Step 1: Environment Validation

In development, visit `/api/debug/auth-status` to check:
- Environment variable configuration
- Clerk key validity
- Current authentication status

### Step 2: Check Browser Console

Look for Clerk-related errors in the browser console:
- Network errors (401, 403, 500)
- JavaScript errors related to Clerk
- CORS issues

### Step 3: Check Server Logs

Monitor server logs for:
- Clerk middleware errors
- Authentication failures
- Environment variable warnings

### Step 4: Test with Known Account

1. Create a test account through the sign-up flow
2. Try logging in with the test account
3. Try password reset with the test account

## Common Solutions

### Solution 1: Reset Environment Configuration

1. Verify all required environment variables are set
2. Restart the development server
3. Clear browser cache and cookies
4. Test authentication again

### Solution 2: Verify Clerk Dashboard Settings

1. Go to Clerk Dashboard > Authentication
2. Ensure these are enabled:
   - Email address (as identifier)
   - Password (authentication strategy)
   - Email verification code (verification method)

### Solution 3: Check User Account Status

1. Go to Clerk Dashboard > Users
2. Search for the user's email
3. Check account status and verification state
4. Manually verify user if needed

### Solution 4: Domain Configuration

1. In Clerk Dashboard > Domains
2. Add your development domain: `http://localhost:3000`
3. Add your production domain (if applicable)
4. Save and test again

## Prevention

### Development Best Practices

1. **Use Environment Validation**
   - The app now logs environment issues on startup
   - Check console for validation warnings

2. **Test Authentication Flow Regularly**
   - Test sign-up, sign-in, and password reset
   - Use different email addresses
   - Test both valid and invalid scenarios

3. **Monitor Error Messages**
   - The app now provides specific error messages
   - Use these to guide users appropriately

### Production Considerations

1. **Use Production Clerk Keys**
   - Ensure `pk_live_` and `sk_live_` keys in production
   - Never use test keys in production

2. **Configure Proper Domains**
   - Set correct production domain in Clerk Dashboard
   - Ensure HTTPS is properly configured

3. **Monitor Webhook Endpoints**
   - Ensure webhook secret is configured
   - Monitor webhook delivery in Clerk Dashboard

## Contact Support

If issues persist after following this guide:

1. **Gather Debug Information**
   - Environment validation output
   - Browser console errors
   - Server log errors
   - Specific user email (if safe to share)

2. **Contact Channels**
   - Internal Slack channel
   - Create GitHub issue with debug information
   - Email support with detailed reproduction steps 