# Environment Variables Reference

This document lists all environment variables needed for deployment.

## 🔧 Backend Environment Variables (Railway)

Create these in Railway Dashboard → Your Service → Variables

### Required Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secret - Change this to a secure random string (minimum 32 characters)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Firebase Configuration (Backend uses Firebase Admin SDK)
# Get this from Firebase Console → Project Settings → Service Accounts → Generate New Private Key
FIREBASE_PROJECT_ID=your_firebase_project_id

# Service Account JSON - Copy entire JSON and paste as single-line string
# IMPORTANT: Must be on a single line, escape quotes if needed
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your_project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

# Deployment URLs
# Set FRONTEND_URL after Vercel deployment (comma-separated for multiple URLs)
FRONTEND_URL=https://your-app.vercel.app,https://your-app-git-main.vercel.app

# Set BACKEND_URL after Railway deployment
BACKEND_URL=https://your-backend.railway.app
```

### Optional Variables (if using Firebase Client SDK in backend)

```env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

---

## 🌐 Frontend Environment Variables (Vercel)

Create these in Vercel Dashboard → Your Project → Settings → Environment Variables

### Required Variables

```env
# Backend API URL (without /api suffix - it's added automatically)
# Set this to your Railway backend URL
VITE_BACKEND_URL=https://your-backend.railway.app
```

### Optional Variables (if using Firebase Client SDK in frontend)

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 📝 Variable Details

### Backend Variables

#### `PORT`
- **Description:** Server port number
- **Default:** Railway sets this automatically (usually 5000 or dynamic)
- **Required:** Yes (but Railway handles it)
- **Example:** `5000`

#### `NODE_ENV`
- **Description:** Environment mode
- **Values:** `production` | `development`
- **Required:** Yes (set to `production` for deployment)
- **Example:** `production`

#### `JWT_SECRET`
- **Description:** Secret key for signing JWT tokens
- **Required:** Yes
- **Length:** Minimum 32 characters recommended
- **Security:** Use a strong, random string
- **Example:** `my_super_secret_jwt_key_2024_production_xyz123`

#### `FIREBASE_PROJECT_ID`
- **Description:** Your Firebase project ID
- **Where to find:** Firebase Console → Project Settings → General
- **Required:** Yes
- **Example:** `my-billing-app-12345`

#### `FIREBASE_SERVICE_ACCOUNT`
- **Description:** Complete Firebase service account JSON credentials
- **Where to get:** Firebase Console → Project Settings → Service Accounts → Generate New Private Key
- **Required:** Yes
- **Format:** Single-line JSON string
- **Important:** 
  - Copy the entire JSON file content
  - Paste it as a single-line string in Railway
  - Railway may automatically escape special characters
  - The JSON should start with `{"type":"service_account"...`
- **Example:** `{"type":"service_account","project_id":"my-project",...}`

#### `FRONTEND_URL`
- **Description:** Comma-separated list of frontend URLs allowed by CORS
- **Required:** Yes (after frontend deployment)
- **Format:** Comma-separated URLs, no spaces
- **Example:** `https://my-app.vercel.app,https://my-app-git-main.vercel.app`

#### `BACKEND_URL`
- **Description:** Your Railway backend URL (for reference)
- **Required:** Optional (used for documentation/logging)
- **Example:** `https://my-backend.up.railway.app`

### Frontend Variables

#### `VITE_BACKEND_URL`
- **Description:** Backend API base URL
- **Required:** Yes
- **Format:** URL without `/api` suffix (it's added automatically)
- **Important:** 
  - Do NOT include `/api` in the URL
  - Use `https://` (not `http://`)
  - No trailing slash
- **Example:** `https://my-backend.up.railway.app`

---

## 🔐 Security Notes

1. **Never commit `.env` files to Git** - They contain sensitive information
2. **Use strong JWT_SECRET** - Generate a random string for production
3. **Keep FIREBASE_SERVICE_ACCOUNT secure** - This is equivalent to admin access
4. **Rotate secrets regularly** - Especially after team member changes
5. **Use different values for production vs development**

---

## 📋 Setup Checklist

### Backend (Railway)
- [ ] Create Railway account
- [ ] Deploy backend service
- [ ] Set `NODE_ENV=production`
- [ ] Generate and set `JWT_SECRET`
- [ ] Get Firebase project ID
- [ ] Generate Firebase service account key
- [ ] Set `FIREBASE_PROJECT_ID`
- [ ] Set `FIREBASE_SERVICE_ACCOUNT` (as single-line JSON)
- [ ] Get Railway deployment URL
- [ ] Set `BACKEND_URL` (optional)
- [ ] After frontend deployment, set `FRONTEND_URL`

### Frontend (Vercel)
- [ ] Create Vercel account
- [ ] Deploy frontend service
- [ ] Get Railway backend URL
- [ ] Set `VITE_BACKEND_URL` to Railway backend URL
- [ ] Redeploy if needed
- [ ] Get Vercel deployment URL(s)
- [ ] Update `FRONTEND_URL` in Railway with Vercel URL(s)

---

## 🚨 Common Issues

### Issue: Firebase connection fails
**Solution:** 
- Verify `FIREBASE_SERVICE_ACCOUNT` is complete JSON on single line
- Check that `FIREBASE_PROJECT_ID` matches your Firebase project
- Ensure service account has proper permissions

### Issue: CORS errors
**Solution:**
- Verify `FRONTEND_URL` includes your exact Vercel URL
- Check for trailing slashes (should be none)
- Ensure URLs match exactly (case-sensitive)
- Use comma-separated format for multiple URLs

### Issue: API calls fail from frontend
**Solution:**
- Verify `VITE_BACKEND_URL` is set correctly in Vercel
- Ensure URL doesn't include `/api` suffix
- Check that backend URL is accessible (test in browser)
- Verify CORS is configured correctly

### Issue: Environment variables not working
**Solution:**
- For Vite (frontend): Variables must start with `VITE_`
- Redeploy after adding new variables
- Check variable names for typos
- Ensure variables are set in correct environment (Production/Preview/Development)

---

## 📞 Need Help?

If you encounter issues:
1. Check deployment logs in Railway/Vercel
2. Verify all required variables are set
3. Ensure variable values are correct format
4. Test endpoints individually
5. Review error messages carefully

