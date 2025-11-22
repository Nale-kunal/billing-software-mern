# Quick Start Deployment Guide

This is a condensed version of the deployment guide. For detailed instructions, see `DEPLOYMENT.md`.

---

## 🚀 Backend to Railway (5 Steps)

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Select your repository

2. **Configure Settings**
   - Set Root Directory: `backend`
   - Build Command: `npm install` (or auto-detect)
   - Start Command: `npm start`

3. **Add Environment Variables** (in Railway → Variables)
   ```env
   NODE_ENV=production
   JWT_SECRET=your_secret_key_here
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}  # Single-line JSON
   FRONTEND_URL=https://your-app.vercel.app  # Set after frontend deploy
   BACKEND_URL=https://your-backend.railway.app  # Set after Railway deploy
   ```

4. **Deploy & Copy URL**
   - Wait for deployment to complete
   - Copy the Railway URL (e.g., `https://your-backend.up.railway.app`)

5. **Update `BACKEND_URL`**
   - Update `BACKEND_URL` in Railway with your actual Railway URL

---

## 🌐 Frontend to Vercel (5 Steps)

1. **Create Vercel Project**
   - Go to [vercel.com](https://vercel.com)
   - Add New → Project
   - Import your GitHub repository

2. **Configure Settings**
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variable**
   ```env
   VITE_BACKEND_URL=https://your-backend.railway.app
   ```
   ⚠️ **Important:** Don't include `/api` - it's added automatically

4. **Deploy & Copy URL**
   - Click Deploy
   - Wait for deployment
   - Copy the Vercel URL (e.g., `https://your-app.vercel.app`)

5. **Update Backend CORS**
   - Go back to Railway
   - Update `FRONTEND_URL` with your Vercel URL
   - Backend will auto-restart

---

## ✅ Verify Deployment

- [ ] Backend accessible: `https://your-backend.railway.app`
- [ ] Frontend accessible: `https://your-app.vercel.app`
- [ ] Test login/register works
- [ ] No CORS errors in browser console
- [ ] Firebase connection working (check Railway logs)

---

## 🔧 Key Environment Variables

### Backend (Railway)
- `FIREBASE_PROJECT_ID` - Your Firebase project ID
- `FIREBASE_SERVICE_ACCOUNT` - Complete JSON as single line
- `JWT_SECRET` - Secret key for tokens
- `FRONTEND_URL` - Your Vercel URL
- `BACKEND_URL` - Your Railway URL

### Frontend (Vercel)
- `VITE_BACKEND_URL` - Your Railway backend URL (without /api)

---

## 🚨 Common Issues

### CORS Error
**Fix:** Update `FRONTEND_URL` in Railway with exact Vercel URL (no trailing slash)

### API Calls Fail
**Fix:** Ensure `VITE_BACKEND_URL` doesn't include `/api` suffix

### Firebase Connection Fails
**Fix:** Verify `FIREBASE_SERVICE_ACCOUNT` is complete JSON on single line

---

**For detailed instructions and troubleshooting, see `DEPLOYMENT.md`**

