# City Evolution Simulator - Server Setup

## 1. How to run locally

### Frontend

1. Open a terminal.
2. Move to the frontend folder:

```bash
cd /home/superdragon/city-evolution-simulator/frontend
```

3. Install Vite:

```bash
npm install
```

4. Start the frontend dev server:

```bash
npm run dev
```

### Backend

1. Open another terminal.
2. Move to the backend folder:

```bash
cd /home/superdragon/city-evolution-simulator/backend
```

3. Install backend packages:

```bash
npm install
```

4. Start the backend server:

```bash
npm start
```

## 2. Example local addresses

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3100`
- Health check: `http://localhost:3100/api/health`

## 3. How leaderboard data is stored

- The backend saves results in `backend/data/leaderboard.json`.
- Each saved run includes:
  - nickname
  - final city type
  - 4 stats
  - total score
  - save time
- The backend sorts the leaderboard by highest total score first.
- If the JSON file does not exist, the server creates it automatically.

## 4. What to change later when deploying

- Update the frontend API address in `frontend/main.js`.
- Right now it uses:

```js
const API_BASE_URL = "http://localhost:3100";
```

- Later, change that to your real backend domain or server address.
- Example:

```js
const API_BASE_URL = "https://your-domain.com";
```

## 5. Basic deployment preparation notes

### Domain connection

- A domain is the website address people type in the browser.
- Later, you can connect your domain so users open the frontend with a real address like `https://your-domain.com`.

### Reverse proxy

- A reverse proxy is a server tool that sends browser requests to the correct app.
- Example idea:
  - requests to `/` go to the frontend
  - requests to `/api` go to the Express backend
- Popular reverse proxy tools include Nginx and Caddy.

### Process manager

- A process manager keeps the backend running even if the server restarts or the app crashes.
- A common example is PM2.
- It helps restart `node server.js` automatically.

### Environment or config values to update

- Backend port if your host uses a different port
- Frontend API base URL
- Domain name
- CORS settings if frontend and backend use different domains

## Simple project idea for deployment

- Keep `frontend/` and `backend/` separate.
- Build the frontend and serve it with a web server.
- Run the backend as a Node.js process.
- Connect both with the same domain later using a reverse proxy.

## 6. Render deployment (Blueprint)

This repository now includes a root `render.yaml`.

- Backend service:
  - type: `web`
  - root: `backend/`
  - health check: `/api/health`
- Frontend service:
  - type: `static` (`type: web`, `runtime: static`)
  - root: `frontend/`
  - publish path: `dist`
  - SPA rewrite: `/* -> /index.html`

### Deploy steps

1. Commit and push `render.yaml` to your Git remote.
2. Open Render Blueprint:
   - `https://dashboard.render.com/blueprint/new?repo=<YOUR_HTTPS_REPO_URL>`
3. Click **Apply** in Render Dashboard.
4. After deploy, open:
   - Backend health: `https://<api-service>.onrender.com/api/health`
   - Frontend site: `https://<frontend-service>.onrender.com`

### API URL behavior in frontend

- Priority order:
  1. `VITE_API_BASE_URL` (build-time)
  2. `window.CITY_API_BASE_URL`
  3. `localStorage.CITY_API_BASE_URL`
  4. local fallback (`http://localhost:3100`) only on localhost

So for Render static deploy, no manual browser setup is required when `VITE_API_BASE_URL` is provided by Blueprint.

This structure is simple for local testing now and easy to expand later.
