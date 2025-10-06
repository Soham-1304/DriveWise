# 🎯 Quick Deploy Commands

## ✅ Backend Deployed!

**URL**: `https://backend-cbtlo2y62-2024sohamk-isuacins-projects.vercel.app`

## 📝 Add Environment Variables (Choose One Method)

### Method 1: Vercel Dashboard (Easiest - 2 minutes)

1. Go to: https://vercel.com/2024sohamk-isuacins-projects/backend/settings/environment-variables
2. Click **Add New** → **Environment Variable**
3. Add these 4 variables (copy exact values from `backend/.env.production`):

```
Name: MONGODB_URI
Value: mongodb+srv://2024sohamk_db_user:CsVBaiM0WDQYs9PC@cluster0.fjljoul.mongodb.net/fuel_db?retryWrites=true&w=majority&appName=Cluster0

Name: FRONTEND_URL
Value: https://fueloptimiser.web.app

Name: FIREBASE_ADMIN_SA
Value: {"type":"service_account","project_id":"fueloptimiser",...} (copy entire JSON)

Name: NODE_ENV
Value: production
```

4. Click **Save** for each

### Method 2: Command Line (if you prefer)

```bash
cd backend

# Add MongoDB URI
vercel env add MONGODB_URI production
# Paste: mongodb+srv://2024sohamk_db_user:CsVBaiM0WDQYs9PC@cluster0.fjljoul.mongodb.net/fuel_db?retryWrites=true&w=majority&appName=Cluster0

# Add Frontend URL
vercel env add FRONTEND_URL production
# Paste: https://fueloptimiser.web.app

# Add Firebase Admin
vercel env add FIREBASE_ADMIN_SA production
# Paste the entire JSON from .env.production

# Add Node Env
vercel env add NODE_ENV production
# Type: production
```

## 🔄 Redeploy Backend (after adding env vars)

```bash
cd backend
vercel --prod
```

## 🎨 Deploy Frontend

```bash
cd frontend

# Update .env.production with backend URL
# Change: VITE_API_URL=https://backend-cbtlo2y62-2024sohamk-isuacins-projects.vercel.app

# Build
npm run build

# Deploy
firebase deploy
```

## ✅ Done!

- **App**: https://fueloptimiser.web.app
- **API Docs**: https://fueloptimiser.web.app/api-docs.html
- **Backend**: https://backend-cbtlo2y62-2024sohamk-isuacins-projects.vercel.app
- **Health Check**: https://backend-cbtlo2y62-2024sohamk-isuacins-projects.vercel.app/health
