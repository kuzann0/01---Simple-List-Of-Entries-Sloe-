# 🔐 Google Sign-In Setup Guide - Secure OAuth 2.0

## Overview

Your SLOE app now has a **native Google Sign-In button** that securely authenticates users with their Gmail account. No more manual token pasting!

## Quick Setup (5 Minutes)

### Step 1: Get Your Google Client ID

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Select a Project" → "NEW PROJECT"
   - Name: `SLOE App`
   - Click "Create"
   - Wait for creation (2-3 minutes)

3. **Enable Google Sheets API**
   - Go to "Enabled APIs & services" (left menu)
   - Click "+ ENABLE APIS AND SERVICES"
   - Search for "Google Sheets API"
   - Click it and press "ENABLE"

4. **Create OAuth 2.0 Credentials**
   - Go to "Credentials" (left menu)
   - Click "+ CREATE CREDENTIALS" → "OAuth Client ID"
   - If asked: "Configure OAuth Consent Screen"
     - Choose "External"
     - Fill in: App name, User support email, Developer email
     - Add Scope: Search for "Sheets" and select `https://www.googleapis.com/auth/spreadsheets`
     - Add test user: Your email address
     - Save and Continue
   - Back to Credentials: Create OAuth Client ID
   - Application Type: **Web Application**
   - Add Authorized Redirect URIs:
     ```
     http://localhost:5177
     http://localhost:5173
     http://localhost:3000
     https://your-domain.com  (if you deploy)
     ```
   - Click "Create"

5. **Copy Your Client ID**
   - Copy the **Client ID** (long string like `XXX.apps.googleusercontent.com`)
   - Paste it in your code (see Step 2 below)

### Step 2: Add Your Client ID to SLOE App

1. **Open the SLOE code**
   - File: `src/Array.jsx`
   - Find line: `const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";`
   - Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID from Step 1

2. **Save the file**
   - Ctrl+S to save
   - Dev server automatically reloads

3. **Test it!**
   - Click "Add To Google Sheets" button
   - You should see the blue "Sign In with Google" button
   - Click it and authenticate with your Gmail
   - Success! ✓

---

## 🔒 Security Features

### What Makes This Secure?

✅ **OAuth 2.0 Protocol**

- Industry standard for secure authentication
- Google handles all password verification
- Your password is never sent to this app

✅ **No Password Storage**

- We never receive or store your Gmail password
- Google handles all authentication
- Your browser stores only access tokens

✅ **Permission-Based Access**

- Users explicitly grant permission to access Google Sheets
- Can be revoked anytime in Google account settings
- Minimal permissions (only Sheets API)

✅ **Secure Token Exchange**

- All communication uses HTTPS (encrypted)
- Tokens are stored in browser localStorage
- Tokens automatically expire for security

### How the Flow Works

```
1. User clicks "Sign In with Google"
   ↓
2. Google's login dialog appears in a popup
   ↓
3. User enters Gmail credentials (to Google, not this app)
   ↓
4. User grants permission to access Google Sheets
   ↓
5. Google returns an ID token to this app
   ↓
6. This app uses the token to communicate with Google Sheets API
   ↓
7. Entries are exported directly to Google Sheets
```

---

## 🔑 How to Revoke Access

If you want to remove this app's access to your Google account:

1. Go to: https://myaccount.google.com/permissions
2. Find "SLOE App" in the list
3. Click it and select "Remove Access"
4. Confirm

This immediately revokes all access. The app will ask you to sign in again on next use.

---

## 🚀 Production Deployment

When you deploy to a production server:

1. **Update Redirect URIs** in Google Cloud Console:
   - Add your production domain: `https://your-domain.com`
   - Remove localhost URIs

2. **Set the Client ID** in your production environment:
   - Create an `.env` file (or similar)
   - Add: `VITE_GOOGLE_CLIENT_ID=your_client_id`
   - Reference it in code: `const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID`

3. **Enable production OAuth consent**:
   - Go back to OAuth Consent Screen
   - Change from "External" to "Internal" (if within your organization)
   - Or keep as "External" if for public use

---

## 🐛 Troubleshooting

### Issue: "Sign In with Google" button doesn't appear

**Solution:**

- Check browser console (F12 → Console tab)
- Look for errors loading Google Identity Services
- Verify Client ID is correctly set (no typos)
- Check that redirect URIs include your current URL

### Issue: Popup blocked

**Solution:**

- Check browser popup blocker settings
- Allow popups for this site
- Refresh and try again

### Issue: "Invalid Client ID" error

**Solution:**

- Verify your Client ID matches exactly from Google Cloud Console
- Check for extra spaces or characters
- Ensure you're using Web Application type (not Desktop)

### Issue: Sheets export fails after login

**Solution:**

- Verify Google Sheets API is enabled (not just selected)
- Check that authorization scope includes Sheets API
- Ensure your Google account has permission to create sheets

### Issue: "Origin not allowed" error

**Solution:**

- Your URL isn't in the Redirect URIs list in Google Cloud Console
- Add your current URL (including http:// or https://)
- Example: `http://localhost:5177` or `https://myapp.com`

---

## 📋 Configuration Files

### Required Environment Setup

Create a `.env` file in your project root:

```env
# .env
VITE_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

Then reference in code:

```javascript
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID";
```

---

## 🎯 Complete Setup Checklist

- [ ] Google Cloud Project created
- [ ] Google Sheets API enabled
- [ ] OAuth 2.0 credentials created
- [ ] Client ID obtained
- [ ] Redirect URIs configured (including localhost:5177)
- [ ] Client ID added to `src/Array.jsx`
- [ ] Test "Sign In with Google" button works
- [ ] Successfully exported entries to Google Sheets
- [ ] Verified data appears in Google Sheet

---

## 🔗 Useful Links

- **Google Cloud Console:** https://console.cloud.google.com
- **OAuth Credentials Page:** https://console.cloud.google.com/apis/credentials
- **Revoke App Access:** https://myaccount.google.com/permissions
- **Google Identity Services Docs:** https://developers.google.com/identity/gsi/web
- **Google Sheets API Docs:** https://developers.google.com/sheets/api

---

## 📞 Support

### Common Questions

**Q: Is my Google password secure?**
A: Yes! Google never reveals your password to this app. Authentication is handled entirely by Google's secure servers.

**Q: What data is sent?**
A: Only your entry data (name, model, serial number, etc.). Your Google account information is never sent to our servers.

**Q: Can I use multiple Google accounts?**
A: Yes! Click "Change Account" in the setup modal to switch accounts.

**Q: What if Google changes their API?**
A: The app uses the stable v4 Google Sheets API. Changes are announced well in advance.

---

## 🎉 You're All Set!

Your SLOE app now has enterprise-grade secure authentication. Users can:

✓ Sign in with their Gmail in one click
✓ Rest assured their credentials are protected
✓ Easily export entries to Google Sheets
✓ Share sheets with their team
✓ Revoke access anytime they want

**Ready to use?** Click "Add To Google Sheets" and start exporting! 🚀
