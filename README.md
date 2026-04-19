# CurrencyX — ML-Powered Currency Converter

> API-Free currency conversion using Linear Regression ML · React + Node.js + MongoDB Atlas

---

## 📁 Project Structure

```
currencyx/
├── backend/                  ← Node.js + Express (port 5000)
│   ├── middleware/auth.js
│   ├── ml/predictor.js       ← Linear Regression ML model
│   ├── models/
│   │   ├── User.js
│   │   └── History.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── conversion.js
│   │   └── history.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/                 ← React + Vite (port 5173)
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   └── utils/
    ├── package.json
    └── .env.example
```

---

## ✅ PART 1 — LOCAL SETUP (Pehle yeh karo)

### Prerequisites
- Node.js v18+ installed → https://nodejs.org
- MongoDB Atlas free account → https://cloud.mongodb.com
- Git installed → https://git-scm.com

---

### Step 1 — MongoDB Atlas Setup (Free)

1. https://cloud.mongodb.com pe jaao → Sign up
2. **"Build a Database"** → **FREE M0** select karo
3. Region: Singapore (India ke paas) → **Create**
4. **"Database Access"** tab → **Add New Database User**
   - Username: `currencyx_user`
   - Password: koi bhi strong password (note kar lo)
   - Role: **Atlas Admin** → **Add User**
5. **"Network Access"** tab → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) → Confirm
6. **"Database"** tab → **Connect** → **Drivers** → Copy the connection string

Connection string format:
```
mongodb+srv://currencyx_user:YOURPASSWORD@cluster0.xxxxx.mongodb.net/currencyx?retryWrites=true&w=majority
```

---

### Step 2 — Backend Local Setup

```bash
# Terminal 1 — Backend

cd currencyx/backend

# 1. Dependencies install karo
npm install

# 2. .env file banao
cp .env.example .env
```

Ab `.env` file open karo aur fill karo:
```env
MONGO_URI=mongodb+srv://currencyx_user:YOURPASSWORD@cluster0.xxxxx.mongodb.net/currencyx?retryWrites=true&w=majority
JWT_SECRET=koi_bhi_random_lambi_string_likho_jaise_x8k2mQ9pL3vN7wR1
PORT=5000
FRONTEND_URL=http://localhost:5173
```

```bash
# 3. Server start karo
npm run dev
```

✅ Dekhna chahiye: `MongoDB Connected ✅` aur `Server running on port 5000`

Test karo browser mein: http://localhost:5000 → `{"message":"CurrencyX API Running ✅"}`

---

### Step 3 — Frontend Local Setup

```bash
# Terminal 2 — Frontend (naya terminal kholo)

cd currencyx/frontend

# 1. Dependencies install karo
npm install

# 2. .env file banao
cp .env.example .env
```

`.env` file mein yeh hona chahiye:
```env
VITE_API_URL=http://localhost:5000
```

```bash
# 3. Frontend start karo
npm run dev
```

✅ Browser mein khulega: http://localhost:5173

---

### Step 4 — Admin User Banana (Local)

1. Site pe Register karo (normal user ban jaata hai)
2. MongoDB Atlas → **Browse Collections** → `currencyx` → `users`
3. Apna user dhundho → **Edit** button
4. `"role": "user"` ko `"role": "admin"` kar do → **Update**
5. Site pe logout karo → login karo → Admin tab dikhega ✅

---

## 🚀 PART 2 — DEPLOYMENT GUIDE

---

### Step 1 — GitHub Pe Upload

```bash
# Root currencyx folder mein jaao
cd currencyx

git init
git add .
git commit -m "Initial commit — CurrencyX fullstack"

# GitHub pe naya repo banao: currencyx
# Phir yeh commands run karo:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/currencyx.git
git push -u origin main
```

---

### Step 2 — Backend Deploy on Render

1. https://render.com → GitHub se Sign up
2. **"New +"** → **Web Service**
3. GitHub repo connect karo → `currencyx` select karo
4. Settings:

| Setting | Value |
|---------|-------|
| Name | `currencyx-backend` |
| Region | Singapore |
| Branch | `main` |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |

5. **"Advanced"** → **Environment Variables** add karo:

| Key | Value |
|-----|-------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Wahi jo local .env mein hai |
| `PORT` | `5000` |
| `FRONTEND_URL` | Abhi blank rakho |

6. **"Create Web Service"** → 3-4 min wait karo
7. URL milega: `https://currencyx-backend.onrender.com`
8. Test karo: URL kholo → `{"message":"CurrencyX API Running ✅"}` dikhna chahiye

---

### Step 3 — Frontend Deploy on Vercel

1. https://vercel.com → GitHub se Sign up
2. **"Add New..."** → **Project**
3. `currencyx` repo import karo
4. Settings:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

5. **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://currencyx-backend.onrender.com` |

6. **"Deploy"** → 2 min wait → URL milega: `https://currencyx.vercel.app`

---

### Step 4 — CORS Fix (Important!)

1. Render pe jaao → `currencyx-backend` → **Environment**
2. `FRONTEND_URL` update karo → `https://currencyx.vercel.app`
3. **Save** → Render auto-redeploy karega

---

### Step 5 — Admin on Production

1. Live site pe register karo
2. MongoDB Atlas → Browse Collections → `currencyx` → `users`
3. `role` field: `"user"` → `"admin"` karo → Update
4. Login karo → Admin panel visible! ✅

---

## 🔄 Changes Push Karna (Future Updates)

```bash
git add .
git commit -m "kya badla describe karo"
git push origin main
# Render + Vercel automatically redeploy ho jaayega!
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Charts | Chart.js + react-chartjs-2 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| ML | Linear Regression (custom JS, no library) |
| Deploy Frontend | Vercel |
| Deploy Backend | Render |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ User | Profile |
| GET | `/api/auth/users` | 👑 Admin | All users |
| DELETE | `/api/auth/users/:id` | 👑 Admin | Delete user |
| GET | `/api/convert/currencies` | ❌ | Currency list |
| GET | `/api/convert/rates/:from/:to` | ❌ | Rates + ML prediction |
| POST | `/api/convert` | ✅ User | Convert + save |
| GET | `/api/history` | ✅ User | My history |
| DELETE | `/api/history/:id` | ✅ User | Delete entry |
| GET | `/api/history/all` | 👑 Admin | All history |

---

## ❗ Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `MongoDB Error: Authentication failed` | .env mein username/password check karo |
| `CORS Error` in browser | `FRONTEND_URL` backend .env mein sahi set hai? |
| `Cannot GET /api/...` | Backend server chal raha hai? `npm run dev` |
| Vercel build fail | `VITE_API_URL` environment variable add kiya? |
| Render "Service unavailable" | Free tier sleep hoti hai, 30 sec wait karo |
