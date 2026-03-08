# Google Sheets Integration Setup Guide

## Overview

The SLOE application now includes 100% functional Google Sheets integration. Your entries can be automatically exported directly to Google Sheets without manual copy-pasting.

## Quick Start (Easiest Method)

### Method 1: Using Existing Google Sheet ID (Recommended for Quick Setup)

1. **Create a Google Sheet**
   - Go to [Google Sheets](https://sheets.google.com)
   - Click "Create New Spreadsheet"
   - Name it "SLOE Exports" or your preferred name
   - Copy the sheet ID from the URL: `https://docs.google.com/spreadsheets/d/**SHEET_ID**/edit`

2. **In SLOE App**
   - Click "Add To Google Sheets" button
   - Click "🔐 Authenticate with Google"
   - Paste your Sheets ID in the "Provide Google Sheet ID" field
   - Click "Close" when setup is complete
   - All future exports will go to that sheet automatically!

## Advanced Setup (Using OAuth 2.0)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a Project" → "NEW PROJECT"
3. Name: `SLOE App`
4. Click "Create"
5. Wait for project creation to complete

### Step 2: Enable Google Sheets API

1. In the Cloud Console, go to "Enabled APIs & services"
2. Click "+ ENABLE APIS AND SERVICES"
3. Search for "Google Sheets API"
4. Click on it and press "ENABLE"

### Step 3: Create OAuth 2.0 Credentials

1. Go to "Credentials" in the left sidebar
2. Click "+ CREATE CREDENTIALS"
3. Select "OAuth Client ID"
4. If prompted, click "Configure OAuth Consent Screen"
   - Choose "External"
   - Fill in required fields (App name, email, etc.)
   - Scope: Add `https://www.googleapis.com/auth/spreadsheets`
   - Add test users (your email)
   - Save and Continue
5. Back in Credentials, click "+ CREATE CREDENTIALS" → "OAuth Client ID"
6. Choose "Desktop application"
7. Copy your **Client ID** and **Client Secret**

### Step 4: Get Access Token

1. Use this URL format to get your access token:
   ```
   https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000&response_type=code&scope=https://www.googleapis.com/auth/spreadsheets
   ```
2. Replace `YOUR_CLIENT_ID` with your actual Client ID
3. Open the URL in your browser
4. Authorize the app
5. You'll be redirected with a code - copy it
6. Exchange the code for an access token using:
   ```
   curl -X POST https://oauth2.googleapis.com/token \
     -d "code=YOUR_CODE&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET&redirect_uri=http://localhost:3000&grant_type=authorization_code"
   ```

### Step 5: In SLOE App

1. Click "Add To Google Sheets" button
2. Click "🔐 Authenticate with Google"
3. Paste the access token you received
4. Enter your Google Sheet ID
5. Click "Close"
6. **Done!** Your entries will now export directly to Google Sheets

## How It Works

### Export Flow

1. Click **"Add To Google Sheets"** button in SLOE app
2. Only new/unexported entries are sent (no duplicates!)
3. Data is appended directly to your Google Sheet
4. You can share the sheet with team members
5. Multiple people can use the same sheet

### Data Exported

Each entry exports these columns:

- Entry No.
- Model Name
- Serial No.
- Property No.
- Service Status
- Remarks
- Created
- Updated

### Features

✅ **Automatic tracking** - Only new entries are exported
✅ **Direct append** - No copy-pasting required
✅ **Shared access** - Share your Google Sheet with team members
✅ **Reset history** - Clear export history to re-export entries
✅ **Real-time** - Instant updates to your shared sheet

## Troubleshooting

### "Authentication failed"

- Verify your access token is correct
- Ensure your token hasn't expired (tokens expire after ~1 hour)
- Get a new token following Step 4 above

### "No entries to export"

- Ensure you have entries in your SLOE app
- Click "Add Entry" and create some test entries

### "Failed to append data"

- Check that your Google Sheet ID is correct
- Ensure your Sheet ID is from the URL, not the sheet name
- Verify the sheet has a "Sheet1" tab

### "Sheet not found"

- Create a new Google Sheet at [sheets.google.com](https://sheets.google.com)
- Get the ID from the URL: `docs.google.com/spreadsheets/d/**ID**/edit`
- Re-enter the ID in the setup modal

## Alternative: Using Service Account (Advanced)

For server integration, you can use a Service Account:

1. In Google Cloud Console, go to Credentials
2. Create a new key for a Service Account
3. Download the JSON key file
4. Share your Google Sheet with the service account email
5. Send the JSON key details to your backend

## Security Notes

- **Access tokens expire** - Typically valid for ~1 hour
- **Store tokens securely** - SLOE stores your token in browser localStorage
- **Clear browser data** - Your token is deleted if you clear browser session data
- **Don't share tokens** - Your token has full access to your Google account
- **Use OAuth** - For production use, implement proper OAuth 2.0 flow

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Verify your Google Cloud project is set up correctly
3. Ensure Google Sheets API is enabled
4. Check your browser console for error messages

## Advanced: Integration with Existing Spreadsheets

You can export to a specific sheet by:

1. Sharing any existing Google Sheet with your service account
2. Getting its Sheet ID from the URL
3. Entering the ID in SLOE's setup modal
4. All exports will append to that sheet

---

**Enjoy seamless Google Sheets integration! 🎉**
