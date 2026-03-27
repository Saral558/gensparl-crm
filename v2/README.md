# Delivery CRM v2.0 Setup Guide

## 1. Database Setup
1. Log in to your Supabase SQL Editor.
2. Copy and paste the contents of `v2/database/schema.sql` and run it.
3. This will create the `users` and `deliveries` tables.

## 2. Backend Configuration
1. Navigate to `v2/backend`.
2. Open `.env` and fill in your Supabase credentials:
   - `JWT_SECRET`: Any random string (e.g. `your_secret_key`).
   - `DATABASE_URL`: Your Supabase PostgreSQL Connection String (Transaction mode recommended).
3. Run `npm install`.
4. Run `node src/scripts/seed-admin.js` to create your first admin account.
   - **Credentials**: `admin@dineshcrm.com` / `adminpassword123`

## 3. Running Locally
- **Backend**: In `v2/backend`, run `npm start`. The server will run on `http://localhost:5000`.
- **Frontend**: Simply open `v2/frontend/index.html` in your browser (or use a Live Server like VS Code extension).

## 4. Deployment
- **Backend**: Deploy to any Node.js host (Render, Heroku, Railway). Ensure Environment Variables are set.
- **Frontend**: Since it's a static site, you can host on Vercel, Netlify, or GitHub Pages.
- **CORS**: If you deploy to different domains, update the `CORS` settings in `v2/backend/server.js`.

---

## Technical Features
- **JWT Auth**: Tokens are valid for 24 hours.
- **RBAC**: Admins can manage users; Staff can only see/manage their own deliveries.
- **Modular Frontend**: Plain JavaScript used in a scalable SPA pattern for performance and maintainability.
