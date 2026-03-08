# ✅ Vercel Deployment Guide - 100% Working

## TL;DR - Complete Checklist

- [ ] Push code to GitHub
- [ ] Connect GitHub to Vercel
- [ ] Update Google Cloud OAuth Redirect URIs
- [ ] Add environment variables to Vercel
- [ ] Deploy
- [ ] ✓ Works perfectly!

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Local Repository

#### 1a. Update Your Environment Variables

**Local Development (.env.local):**

```env
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
VITE_APP_URL=http://localhost:5177
```

**DO NOT commit `.env.local` to GitHub** (already in .gitignore)

#### 1b. Test Locally

```bash
npm run dev
# Verify everything works at http://localhost:5177
```

#### 1c. Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Set Up Vercel

#### 2a. Go to Vercel

1. Visit: **https://vercel.com**
2. Sign up/Login with GitHub account
3. Click "Add New Project"
4. Select your SLOE repository
5. Click "Import"

#### 2b. Configure Build Settings

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- Leave everything else as default

#### 2c. Add Environment Variables

In Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add:
   ```
   Key: VITE_GOOGLE_CLIENT_ID
   Value: [Your Google Client ID]
   ```
   Select: Production, Preview, Development
3. Click "Add"
4. Deploy!

### Step 3: Update Google Cloud Console

#### 3a. Find Your Vercel Domain

After deploying, Vercel shows your URL:

- Default: `https://sloe-[random].vercel.app`
- Custom: `https://yourdomain.com` (if you add it)

#### 3b. Update Redirect URIs in Google Cloud

1. Go to: **https://console.cloud.google.com**
2. Project: SLOE App
3. APIs & Services → Credentials
4. Click your OAuth Client ID
5. Update **Authorized redirect URIs:**

**Add these:**

```
https://your-vercel-domain.vercel.app
https://yourdomain.com (if using custom domain)
```

**Keep these (don't remove):**

```
http://localhost:5177
http://localhost:5173
```

6. Click "Save"
7. ✓ Done!

---

## ✅ What Will Work

### ✓ Google Sign-In

- Click "Add To Google Sheets"
- Click "Sign In with Google"
- Gmail login works perfectly
- Authentication succeeds

### ✓ Data Export

- Export to Google Sheets works
- All entries appear correctly
- No errors or issues

### ✓ Features

- All SLOE features work
- PDF download works
- CSV export works
- Full page view works
- Keyboard shortcuts work
- Mobile responsive works

### ✓ Performance

- Vite builds optimized
- Fast load times
- Instant deployment updates
- CDN acceleration included

---

## ⚠️ Common Issues & Fixes

### Problem: "Invalid Client ID"

**Solution:**

1. Check Client ID in Vercel environment variables (exact match)
2. Rebuild: Vercel → Deployments → Redeploy
3. Clear browser cache (Ctrl+Shift+Del)
4. Try again

### Problem: "Origin not allowed"

**Solution:**

1. Get exact Vercel domain from Vercel Dashboard
2. Go to Google Cloud Console → OAuth credentials
3. Add your Vercel domain to Redirect URIs
4. Example: `https://sloe-xyz123.vercel.app`
5. Save
6. Rebuild in Vercel

### Problem: Blank page after deploy

**Solution:**

1. Check browser console (F12 → Console)
2. Look for errors
3. Vercel → Deployments → View logs
4. Most common: Environment variables not set

### Problem: Sheets export fails

**Solution:**

1. Verify Google OAuth token is stored
2. Check localStorage in dev tools
3. Verify redirect URIs include your domain
4. Clear browser data and re-authenticate

---

## 🔐 Security Best Practices

### ✓ What to Do

- Store Client ID in environment variables ✓
- Use `.env.local` for development ✓
- Never commit `.env.local` to GitHub ✓
- Use `.env.example` as template ✓
- Add environment variables in Vercel Dashboard ✓

### ✗ What NOT to Do

- Don't hardcode Client ID in source code ✗
- Don't commit `.env.local` to GitHub ✗
- Don't expose credentials in comments ✗
- Don't use generic passwords ✗

---

## 📋 Pre-Deployment Checklist

- [ ] **Code**: Everything working on `http://localhost:5177`
- [ ] **Git**: Pushed to GitHub `main` branch
- [ ] **Environment**: `.env.local` configured with your Client ID
- [ ] **Environment**: `.env.local` in .gitignore (don't commit)
- [ ] **Google**: Client ID obtained from Google Cloud Console
- [ ] **Google**: Redirect URIs include `http://localhost:5177`
- [ ] **Vercel**: Account created
- [ ] **Vercel**: GitHub connected
- [ ] **Vercel**: SLOE repository imported
- [ ] **Vercel**: Environment variables added
- [ ] **Vercel**: Deployment shows success
- [ ] **Google**: Redirect URIs updated with Vercel domain
- [ ] **Test**: Sign-in with Google works
- [ ] **Test**: Export to Sheets works
- [ ] **Test**: Mobile responsive works

---

## 🎯 Complete Deployment Sequence

```
1. GitHub Push
   ├─ Code committed
   └─ Pushed to main branch

2. Vercel Import
   ├─ Connect GitHub account
   ├─ Select SLOE repository
   └─ Import project

3. Configure Build
   ├─ Framework: Vite
   ├─ Build: npm run build
   └─ Output: dist

4. Add Environment Variables
   ├─ VITE_GOOGLE_CLIENT_ID
   └─ Add to all environments

5. First Deploy
   ├─ Automatic build
   ├─ Get Vercel domain
   └─ Deployment successful ✓

6. Update Google OAuth
   ├─ Add Vercel domain to redirect URIs
   └─ Save changes

7. Test Live
   ├─ Visit your domain
   ├─ Sign in with Google
   ├─ Export to Sheets
   └─ All working ✓✓✓
```

---

## 🔗 Useful Vercel Features

### Auto-Deployments

- Every push to `main` auto-deploys
- Deployments take 1-2 minutes
- See build logs in Vercel Dashboard

### Preview Deployments

- Every PR gets preview URL
- Test before merging
- Share with team

### Custom Domain

- Add in Vercel → Settings → Domains
- Points to your Vercel instance
- Automatic HTTPS/SSL

### Environment Variables

- Different values per environment
- Production/Preview/Development
- Never exposed in source code

---

## 📞 Troubleshooting

### Build Fails

**Check:**

1. Vercel → Deployments → Click failed deployment
2. View logs (scroll down)
3. Look for error messages
4. Run `npm run build` locally to test

**Common causes:**

- Syntax errors in code
- Missing dependencies
- Environment variables missing

### App Blank After Deploy

**Check:**

1. Browser console (F12 → Console tab)
2. Vercel logs
3. Network tab (any failing requests?)

**Common causes:**

- Environment variable not set
- Client ID wrong format
- JavaScript error

### Sign-In Fails

**Check:**

1. Is Vercel domain in Google OAuth redirect URIs?
2. Is Client ID correct in Vercel?
3. Try clearing browser cache
4. Try incognito/private window

---

## 💡 Pro Tips

1. **Use .env.example**
   - Share with team
   - Shows what variables needed
   - Don't commit actual values

2. **Keep .env.local Private**
   - Already in .gitignore
   - Never push to GitHub
   - Each developer has their own

3. **Redeploy After Changes**
   - Environment variable changes need redeploy
   - OAuth URI changes need redeploy
   - Just push empty commit: `git commit --allow-empty -m "Redeploy"`

4. **Test in Preview First**
   - PRs get preview deployments
   - Test before merging to main
   - Use for team review

5. **Monitor Vercel Analytics**
   - Real-time request logs
   - Error tracking
   - Performance metrics

---

## 🎬 Quick Start (5 Minutes)

```bash
# 1. Update environment variables
echo "VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com" > .env.local

# 2. Test locally
npm run dev
# Verify it works at http://localhost:5177

# 3. Push to GitHub
git add .
git commit -m "Ready for Vercel"
git push

# 4. Go to https://vercel.com
# - Import GitHub repository
# - Add environment variables
# - Deploy

# 5. Update Google OAuth
# - Add your-vercel-domain.vercel.app to redirect URIs

# 6. Test live site
# ✓ All working!
```

---

## ✨ After Deployment

### Your Domain

- Production: `https://sloe-xyz.vercel.app`
- Custom: `https://yourdomain.com` (optional)
- HTTPS: Automatic ✓

### Your Features

- ✓ Google Sign-In working
- ✓ Sheets export working
- ✓ PDF download working
- ✓ CSV export working
- ✓ All data persists
- ✓ Mobile responsive
- ✓ Fast performance

### Your App

- Auto-updates with every GitHub push
- Automatic HTTPS/SSL
- Global CDN distribution
- Uptime monitoring
- Error tracking

---

## 🚀 You're Ready to Ship!

Everything is configured and ready. Follow the checklist above and you'll have a working production app in minutes!

**Questions?** Check the troubleshooting section or Google Cloud Console logs.

**Status: ✅ READY TO DEPLOY**
