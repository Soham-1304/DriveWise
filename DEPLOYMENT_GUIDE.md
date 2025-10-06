# FuelOptimizer Deployment Guide

## 🚀 Quick Deployment Steps

### Prerequisites

1. **Firebase CLI**: `npm install -g firebase-tools`
2. **Vercel CLI**: `npm install -g vercel`
3. **Firebase Project**: Create at [console.firebase.google.com](https://console.firebase.google.com)
4. **MongoDB Atlas**: Get connection string from [cloud.mongodb.com](https://cloud.mongodb.com)

---

## 📦 Step 1: Deploy Backend to Vercel

### 1.1 Login to Vercel

```bash
cd backend
vercel login
```

### 1.2 Deploy Backend

```bash
vercel deploy --prod
```

### 1.3 Set Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fueloptimizer
FRONTEND_URL=https://your-project.web.app
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
NODE_ENV=production
```

**Note**: Copy your Firebase service account JSON from Firebase Console → Project Settings → Service Accounts → Generate New Private Key

### 1.4 Get Backend URL

After deployment, Vercel will show:

```
✅ Production: https://fuel-optimizer-backend.vercel.app
```

**Copy this URL** - you'll need it for frontend!

---

## 🎨 Step 2: Deploy Frontend to Firebase

### 2.1 Update Firebase Project ID

Edit `frontend/.firebaserc`:

```json
{
  "projects": {
    "default": "your-actual-firebase-project-id"
  }
}
```

### 2.2 Update Environment Variables

Edit `frontend/.env.production`:

```env
VITE_API_URL=https://fuel-optimizer-backend.vercel.app
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Get Firebase config**: Firebase Console → Project Settings → Your apps → Web app config

### 2.3 Build Frontend

```bash
cd frontend
npm run build
```

### 2.4 Login to Firebase

```bash
firebase login
```

### 2.5 Initialize Firebase (if not done)

```bash
firebase init hosting
# Select:
# - Use existing project
# - Public directory: dist
# - Single-page app: Yes
# - Overwrite index.html: No
```

### 2.6 Deploy to Firebase

```bash
firebase deploy --only hosting
```

### 2.7 Get Frontend URL

Firebase will show:

```
✅ Hosting URL: https://your-project.web.app
```

---

## 🔗 Step 3: Update CORS Settings

### 3.1 Update Backend Environment Variables

Go back to Vercel Dashboard and update:

```env
FRONTEND_URL=https://your-project.web.app
```

### 3.2 Redeploy Backend

```bash
cd backend
vercel deploy --prod
```

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Backend API

```bash
curl https://fuel-optimizer-backend.vercel.app/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 4.2 Test Frontend

Visit: `https://your-project.web.app`

### 4.3 Test CORS

Open browser console on frontend and make API call:

```javascript
fetch("https://fuel-optimizer-backend.vercel.app/api/auth/profile", {
  headers: { Authorization: "Bearer YOUR_TOKEN" },
});
```

### 4.4 Test API Docs

Visit: `https://your-project.web.app/api-docs.html`

---

## 📝 Step 5: Update API Docs with Live Links

The API docs need to be updated with your live backend URL. This will be done automatically after deployment.

---

## 🐛 Troubleshooting

### CORS Errors

- Verify `FRONTEND_URL` in Vercel matches your Firebase hosting URL
- Check browser console for blocked origins
- Ensure backend redeploy after changing CORS settings

### 404 on Firebase Routes

- Ensure `firebase.json` has rewrites configured
- Rebuild frontend: `npm run build`
- Redeploy: `firebase deploy`

### Backend 500 Errors

- Check Vercel logs: `vercel logs`
- Verify MongoDB URI is correct
- Verify Firebase service account JSON is valid

### Build Failures

- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Try build locally: `npm run build`

---

## 📊 Quick Commands Reference

### Backend (Vercel)

```bash
# Deploy
vercel deploy --prod

# View logs
vercel logs

# List deployments
vercel ls
```

### Frontend (Firebase)

```bash
# Build
npm run build

# Deploy
firebase deploy --only hosting

# View logs
firebase functions:log
```

---

## 🎯 Final Checklist

- [ ] Backend deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Frontend deployed to Firebase
- [ ] .env.production updated with Vercel URL
- [ ] CORS configured and tested
- [ ] API docs accessible at /api-docs.html
- [ ] All endpoints working (test in API docs)
- [ ] Live tracking functional
- [ ] Route optimization working

---

## 📱 Your Live URLs

After deployment, you'll have:

- **Frontend**: `https://your-project.web.app`
- **API Docs**: `https://your-project.web.app/api-docs.html`
- **Backend API**: `https://fuel-optimizer-backend.vercel.app`
- **Health Check**: `https://fuel-optimizer-backend.vercel.app/health`

---

## 🔐 Security Notes

1. **Never commit** `.env` or `.env.production` files
2. **Use environment variables** for all secrets
3. **Rotate Firebase service account keys** regularly
4. **Enable Firebase App Check** for production
5. **Set up MongoDB IP whitelist** (allow all: 0.0.0.0/0 for Vercel)

---

## 🚀 Continuous Deployment (Optional)

### Connect GitHub to Vercel (Backend)

1. Go to Vercel Dashboard → Import Project
2. Connect GitHub repository
3. Auto-deploy on push to main branch

### Connect GitHub to Firebase (Frontend)

```bash
firebase init hosting:github
```

Now every push to main will auto-deploy! 🎉
