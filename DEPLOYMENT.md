# VibeForge Digital Agency - Deployment Guide (Netlify + Render)

This guide provides clear instructions to deploy:
- **Frontend (`client/`)** to **Netlify**
- **Backend (`server/`)** to **Render**

---

## 1. Backend Deployment (Render)

### Step 1.1: Push Code to GitHub / GitLab
Make sure your repository has the `server/` directory pushed to GitHub or GitLab.

### Step 1.2: Create Render Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Web Service**.
2. Connect your GitHub/GitLab repository.
3. Set the following settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In **Environment Variables**, add:
   - `MONGO_URI`: Your MongoDB Atlas URI (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/vibeforge`)
   - `JWT_SECRET`: A strong secret key
   - `CLIENT_URL`: Your Netlify App URL (e.g. `https://vibeforge.netlify.app`)
5. Click **Create Web Service**.
6. Once deployed, copy your Render server URL (e.g. `https://vibeforge-hq68.onrender.com`).

---

## 2. Frontend Deployment (Netlify)

### Step 2.1: Deploy to Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com/) and click **Add new site** > **Import an existing project**.
2. Connect your GitHub repository.
3. Set the following settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
4. In **Site Configuration** > **Environment variables**, add:
   - `VITE_API_URL`: Your Render backend URL (e.g. `https://vibeforge-hq68.onrender.com`)
   - `VITE_API_BASE_URL`: Optional backward-compatible alias for older deploy scripts
5. Click **Deploy Site**.

---

## 3. Local Development

- **Run Frontend locally**:
  ```bash
  cd client
  npm install
  npm run dev
  ```
  App will start at `http://localhost:5173`.

- **Run Backend locally**:
  ```bash
  cd server
  npm install
  npm run dev
  ```
  Server will start at `http://localhost:5000`.
