# 🚀 Simple Deployment Guide

## Step 1: Deploy Backend to Vercel (5 minutes)

### 1. Login to Vercel

```bash
cd backend
vercel login
```

### 2. Deploy Backend

```bash
vercel --prod
```

**That's it!** Vercel will ask a few questions:

- Set up and deploy? → **Yes**
- Which scope? → **Your account**
- Link to existing project? → **No**
- Project name? → **fuel-optimizer-backend** (or whatever)
- Directory? → **./backend** (or just press Enter)
- Override settings? → **No**

**Copy the URL** you get (e.g., `https://fuel-optimizer-backend.vercel.app`)

### 3. Add Environment Variables in Vercel Dashboard

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these **3 variables** (copy from `backend/.env.production`):

| Name                | Value                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`       | `mongodb+srv://2024sohamk_db_user:CsVBaiM0WDQYs9PC@cluster0.fjljoul.mongodb.net/fuel_db?retryWrites=true&w=majority&appName=Cluster0` |
| `FRONTEND_URL`      | `https://fueloptimiser.web.app`                                                                                                       |
| `FIREBASE_ADMIN_SA` | `{"type":"service_account"...}` (entire JSON from .env.production)                                                                    |

### 4. Redeploy

```bash
vercel --prod
```

✅ **Backend Done!** Test it: `https://your-backend.vercel.app/health`

---

## Step 2: Deploy Frontend to Firebase (3 minutes)

### 1. Update Backend URL

Edit `frontend/.env.production` and replace:

```env
VITE_API_URL=https://your-backend.vercel.app
```

With your actual Vercel URL from Step 1.

### 2. Build Frontend

```bash
cd frontend
npm run build
```

### 3. Deploy to Firebase

```bash
firebase deploy
```

✅ **Frontend Done!** Visit: `https://fueloptimiser.web.app`

---

## Step 3: Update API Docs Link (1 minute)

Your API docs are automatically deployed at:

```
https://fueloptimiser.web.app/api-docs.html
```

Open it and verify the "Base URL" shows your Vercel backend URL!

---

## 🎉 You're Live!

**Your URLs:**

- 🌐 App: `https://fueloptimiser.web.app`
- 📚 API Docs: `https://fueloptimiser.web.app/api-docs.html`
- ⚡ Backend: `https://your-backend.vercel.app`

---

## 🔧 Quick Commands Reference

### Backend (Vercel)

```bash
# Deploy
cd backend
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls
```

### Frontend (Firebase)

```bash
# Build
cd frontend
npm run build

# Deploy
firebase deploy

# Deploy only hosting
firebase deploy --only hosting
```

---

## ⚠️ Troubleshooting

### CORS Errors

1. Check `FRONTEND_URL` in Vercel environment variables
2. Make sure it's `https://fueloptimiser.web.app` (no trailing slash)
3. Redeploy backend: `vercel --prod`

### 404 on Frontend Routes

- Rebuild: `npm run build`
- Redeploy: `firebase deploy`

### Backend 500 Errors

- Check Vercel logs: `vercel logs`
- Verify environment variables are set
- Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

---

## 📝 MongoDB Atlas Setup (if needed)

1. Go to MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (allow from anywhere - needed for Vercel)
3. Save

This allows Vercel's dynamic IPs to connect to your database.
