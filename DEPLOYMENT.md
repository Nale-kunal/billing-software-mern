# Deployment Guide - Billing Software

This guide provides step-by-step instructions to deploy the frontend to Vercel and backend to Railway.

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Firebase Project** - Already configured and connected
4. **GitHub Repository** - Code should be pushed to GitHub

---

## 🚀 Part 1: Backend Deployment to Railway

### Step 1: Prepare Railway Project

1. Go to [railway.app](https://railway.app) and log in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will detect the backend directory automatically

### Step 2: Configure Build Settings

Railway should auto-detect Node.js. Verify these settings:

- **Root Directory**: `backend` (if not detected automatically, set it)
- **Build Command**: `npm install` (or leave empty - Railway handles it)
- **Start Command**: `npm start`

### Step 3: Set Environment Variables

In Railway dashboard, go to your service → **Variables** tab and add:

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-backend.railway.app
```

**Important Notes:**
- `FIREBASE_SERVICE_ACCOUNT` must be a **complete JSON string** on a single line
- Get the service account JSON from Firebase Console → Project Settings → Service Accounts → Generate New Private Key
- Copy the entire JSON content and paste it as a single-line string
- `BACKEND_URL` - Set this **after** Railway provides your deployment URL
- `FRONTEND_URL` - Set this **after** Vercel deployment (include all domains that need access)

### Step 4: Deploy

1. Railway will automatically start deployment
2. Wait for the build to complete
3. Railway will provide a public URL (e.g., `https://your-backend.up.railway.app`)
4. Copy this URL - you'll need it for frontend configuration
5. Update `BACKEND_URL` in Railway variables with your actual Railway URL

### Step 5: Verify Backend Deployment

1. Visit `https://your-backend.railway.app` - should see "🧾 Grocery Billing Software Backend is running..."
2. Test API: `https://your-backend.railway.app/api/auth/register` (should return error, not crash)
3. Check Railway logs for "📦 Firestore connected successfully"

---

## 🌐 Part 2: Frontend Deployment to Vercel

### Step 1: Prepare Vercel Project

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (set this in "Configure Project")
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2: Set Environment Variables

In Vercel project settings → **Environment Variables**, add:

```env
VITE_BACKEND_URL=https://your-backend.railway.app
```

**Note:** 
- Replace `https://your-backend.railway.app` with your actual Railway backend URL
- Vite requires `VITE_` prefix for environment variables
- No quotes needed for URLs

### Step 3: Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your frontend
3. After deployment, you'll get a URL (e.g., `https://your-app.vercel.app`)
4. Copy this URL

### Step 4: Update Backend CORS

1. Go back to Railway dashboard
2. Update `FRONTEND_URL` environment variable:
   ```
   https://your-app.vercel.app,https://your-app-git-main.vercel.app
   ```
   (Include both production and preview URLs)
3. Redeploy backend or wait for automatic restart

### Step 5: Verify Frontend Deployment

1. Visit your Vercel URL
2. Test login/register functionality
3. Verify API calls are working

---

## 🔧 Environment Variables Reference

### Backend (Railway) - Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port (Railway sets this automatically) | `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key_here` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `my-project-12345` |
| `FIREBASE_SERVICE_ACCOUNT` | Complete Firebase service account JSON as string | `{"type":"service_account",...}` |
| `FRONTEND_URL` | Comma-separated list of frontend URLs | `https://app.vercel.app,https://preview.vercel.app` |
| `BACKEND_URL` | Your Railway backend URL | `https://backend.railway.app` |

### Frontend (Vercel) - Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API URL (without /api) | `https://backend.railway.app` |

### Optional Variables (if using Firebase Client SDK)

**Backend:**
```env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

**Frontend:**
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 🔍 Troubleshooting

### Backend Issues

**Problem:** Firebase connection fails
- **Solution:** Verify `FIREBASE_SERVICE_ACCOUNT` is a complete, valid JSON string on one line
- Check Railway logs for specific Firebase errors

**Problem:** CORS errors from frontend
- **Solution:** Ensure `FRONTEND_URL` includes your exact Vercel URL(s)
- Check that URLs in `FRONTEND_URL` match exactly (no trailing slashes)

**Problem:** Server crashes on startup
- **Solution:** Check Railway logs
- Verify all required environment variables are set
- Ensure `FIREBASE_SERVICE_ACCOUNT` is properly formatted

### Frontend Issues

**Problem:** API calls fail
- **Solution:** Verify `VITE_BACKEND_URL` is set correctly in Vercel
- Check browser console for network errors
- Ensure backend URL doesn't have `/api` suffix (it's added automatically)

**Problem:** Build fails
- **Solution:** Check Vercel build logs
- Ensure `package.json` has correct build script
- Verify all dependencies are listed

**Problem:** Environment variables not working
- **Solution:** Vite requires `VITE_` prefix for environment variables
- Redeploy after adding new variables
- Check Vercel environment variable settings

---

## 📝 Post-Deployment Checklist

- [ ] Backend deployed and accessible at Railway URL
- [ ] Frontend deployed and accessible at Vercel URL
- [ ] All environment variables set correctly
- [ ] CORS configured with frontend URL
- [ ] Firebase connection verified in backend logs
- [ ] API endpoints responding correctly
- [ ] Frontend can communicate with backend
- [ ] Authentication flow working
- [ ] All features tested in production

---

## 🔄 Continuous Deployment

Both Railway and Vercel support automatic deployments:

- **Railway**: Automatically deploys when you push to your main branch (if configured)
- **Vercel**: Automatically deploys on every push to main branch
- **Preview Deployments**: Vercel creates preview deployments for pull requests

---

## 📞 Support

If you encounter issues:
1. Check the logs in Railway/Vercel dashboards
2. Verify all environment variables are set correctly
3. Ensure Firebase service account has proper permissions
4. Test endpoints individually to isolate issues

---

## ✅ Success Indicators

Your deployment is successful when:
- ✅ Backend responds at Railway URL
- ✅ Frontend loads at Vercel URL
- ✅ User registration/login works
- ✅ API calls complete successfully
- ✅ No CORS errors in browser console
- ✅ Firebase operations complete successfully

