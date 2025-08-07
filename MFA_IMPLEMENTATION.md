# Multi-Factor Authentication (MFA) Implementation

This document describes the Supabase MFA (TOTP) implementation that has been added to your Nuxt application.

## Overview

The MFA implementation provides Time-based One-Time Password (TOTP) authentication using authenticator apps like Google Authenticator, Authy, or 1Password. Users are required to set up MFA after their initial login.

## Features Implemented

### 1. MFA Middleware (`app/middleware/mfa.ts`)

- Automatically checks MFA status on protected routes
- Redirects users to appropriate MFA flows based on their status
- Excludes certain routes from MFA checks (login, enrollment, verification pages)

### 2. MFA Enrollment Page (`app/pages/mfa-enroll.vue`)

- QR code display for easy setup with authenticator apps
- Manual secret key entry option
- Live verification during enrollment
- Modern UI with DaisyUI components

### 3. MFA Verification Page (`app/pages/mfa-verify.vue`)

- Code entry for users who need to verify their MFA
- Recovery help and troubleshooting information
- Automatic redirection after successful verification

### 4. Settings Integration (`app/components/Settings.vue`)

- MFA status display in user settings
- Easy access to MFA management
- Visual indicator of MFA enabled/disabled state

### 5. MFA Composable (`app/composables/useMFA.js`)

- Centralized MFA operations
- Status checking utilities
- Helper functions for enrollment and verification

### 6. Server API Endpoints

- `/api/auth/mfa/enroll.post.js` - Server-side MFA enrollment
- `/api/auth/mfa/challenge.post.js` - Challenge creation
- `/api/auth/mfa/verify.post.js` - Server-side verification

## User Flow

### First-Time Login Flow

1. User logs in with email/OTP
2. System checks MFA status
3. If no MFA enrolled → Redirect to `/mfa-enroll`
4. User scans QR code with authenticator app
5. User enters verification code to complete enrollment
6. User gains access to the application

### Subsequent Login Flow

1. User logs in with email/OTP
2. System detects MFA enrolled but not verified in current session
3. User redirected to `/mfa-verify`
4. User enters TOTP code from their authenticator app
5. User gains access to the application

### MFA Status Levels

- **AAL1**: Single-factor authentication (email/password only)
- **AAL2**: Multi-factor authentication verified

## Configuration

The MFA implementation uses the existing Supabase configuration in `nuxt.config.ts`. No additional configuration is required as TOTP MFA is enabled by default on all Supabase projects.

## Security Considerations

1. **Middleware Protection**: The `mfa` middleware is applied to the main index page to ensure MFA enforcement
2. **Route Exclusions**: Critical routes like login and MFA pages are excluded from middleware checks
3. **Server-side Validation**: All MFA operations include server-side validation with Joi schemas
4. **Error Handling**: Comprehensive error handling with user-friendly messages

## Customization Options

### Adding MFA to Additional Pages

Add the middleware to any page that requires MFA protection:

```javascript
definePageMeta({
	middleware: "mfa",
});
```

### Customizing MFA Requirements

To make MFA optional, modify the middleware logic in `app/middleware/mfa.ts` to redirect based on user preferences or admin settings.

### Styling

The MFA pages use DaisyUI components and can be customized by modifying the CSS classes in the Vue components.

## Testing

### Test MFA Enrollment

1. Create a new user account
2. Log in and observe automatic redirect to MFA enrollment
3. Use an authenticator app to scan the QR code
4. Complete the verification process

### Test MFA Verification

1. With MFA already enrolled, log out and log back in
2. Observe redirect to MFA verification page
3. Enter TOTP code from authenticator app
4. Confirm successful access to the application

## Troubleshooting

### Common Issues

1. **QR Code Not Displaying**: Check browser console for SVG encoding errors
2. **Verification Fails**: Ensure device time is synchronized
3. **Middleware Loops**: Check excluded routes in middleware configuration

### Debug Mode

Enable verbose logging by checking browser console for MFA-related error messages.

## Dependencies

The implementation uses existing project dependencies:

- `@nuxtjs/supabase` - Supabase integration
- `joi` - Server-side validation
- `@nuxt/icon` - Icons for UI
- `daisyui` - UI components

No additional packages need to be installed.

## Security Best Practices

1. Users should be educated about TOTP security
2. Consider implementing backup codes for account recovery
3. Regular security audits of MFA implementation
4. Monitor for suspicious authentication patterns

## Future Enhancements

Potential improvements to consider:

1. Backup codes for account recovery
2. SMS-based MFA as an alternative
3. MFA disable/reset functionality for administrators
4. Support for multiple TOTP devices per user
5. MFA enforcement policies per user role
