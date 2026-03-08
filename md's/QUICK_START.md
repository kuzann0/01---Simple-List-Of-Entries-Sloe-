# 🚀 Google Sheets Export - Quick Start Guide

## ⚡ 3-Minute Setup

### Step 1: Get Your Sheet ID (30 seconds)

```
1. Go to sheets.google.com
2. Create new spreadsheet
3. Copy this part from the URL:
   docs.google.com/spreadsheets/d/[THIS_PART]/edit
```

### Step 2: Set Up in SLOE (2 minutes)

```
1. Click "Add To Google Sheets" button
2. Click "🔐 Authenticate with Google"
3. Get temporary token (see below)
4. Paste it in the prompt
5. Enter your Sheet ID
6. Click "Close"
```

### Step 3: Export Your Entries (30 seconds)

```
1. Click "Add To Google Sheets" again
2. Your entries instantly appear in Google Sheets
3. Share the link with your team!
```

---

## 🔑 Getting Your Authentication Token (Quick Method)

### For Development/Testing:

```javascript
// In browser console (F12):
// Paste and run this code to generate a test token

fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  body: new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: "YOUR_REFRESH_TOKEN",
    client_id: "YOUR_CLIENT_ID",
    client_secret: "YOUR_CLIENT_SECRET",
  }),
})
  .then((r) => r.json())
  .then((d) => console.log(d.access_token));
```

**OR** Follow detailed setup in: **GOOGLE_SHEETS_SETUP.md**

---

## ✨ What Happens When You Click "Add To Google Sheets"

1. **System checks** - Token exists? Sheet ID exists?
2. **Finds new entries** - Only unsent entries are selected
3. **Formats data** - Adds headers and rows
4. **Sends to Google** - HTTPS request to Google Sheets API
5. **Updates locally** - Marks entries as exported
6. **Shows success** - Notification appears
7. **Opens sheet** - Your Google Sheet opens in a new tab

---

## ✅ How to Know It's Working

✓ Button shows export count: `(3/10)` = 3 sent, 10 total  
✓ Clicking opens Google Sheet automatically  
✓ Data appears in Google Sheet instantly  
✓ Can share sheet link with team  
✓ No errors in browser console

---

## ⚠️ If Something Isn't Working

| Problem           | Solution                     |
| ----------------- | ---------------------------- |
| "Auth failed"     | Get new token from Google    |
| "No entries"      | Create entries first         |
| "Sheet not found" | Check Sheet ID is correct    |
| "Append error"    | Verify permissions and token |

---

## 🎯 Common Tasks

### Export your data

```
Click "Add To Google Sheets" → Done in 1 second
```

### Share with team

```
Get Google Sheet link → Share via email/Slack → Done
```

### Export again

```
Click "Reset Export" → Click "Add To Google Sheets" → Done
```

### Change target sheet

```
Click "Google Sheets" button → Enter new Sheet ID → Done
```

---

## 🔒 Security Notes

- Your token is stored only in your browser
- Token expires after ~1 hour
- Get a new token to continue exporting
- Tokens have access to your Google data
- Delete browser data = tokens deleted

---

## 📞 Still Need Help?

1. Read **GOOGLE_SHEETS_SETUP.md** for complete guide
2. Check **IMPLEMENTATION_SUMMARY.md** for details
3. Verify browser console for error messages (F12)
4. Ensure token is valid and not expired

---

## 📊 Example: Complete Export Flow

```
Your SLOE App                           Google Sheets
─────────────────────                   ──────────────
Enter 3 items
↓
Click Export
↓
Check auth ✓
↓
Format data ✓
↓
Send to Google ──────HTTPS Request─→ Google API
↓                  ←─Response─        ↓
Success! ✓         (Success)         Add 3 rows
↓                                     ↓
Mark exported ✓                       Sheet updated ✓
↓
Open sheet ────────────────→  Your team can see it!
```

---

## 🎓 Pro Tips

1. **Share the sheet** - Multiple people can view exports
2. **Keep token safe** - Regenerate if compromised
3. **Check sheet** - Verify data after each export
4. **Clear history** - Reset when sheet gets too full
5. **Use shortcuts** - Press Alt+G for quick export

---

## ⏱️ Export Times

- Setup: 2-3 minutes (first time)
- Each export: < 1 second
- Multiple exports: All entries at once
- Share: Instant link generation

---

**Ready? Click "Add To Google Sheets" and start exporting!** 🎉
