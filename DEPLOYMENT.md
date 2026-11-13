# Deployment

## Frontend on Vercel

The repository's `vercel.json` builds the React app in `frontend/` and routes frontend paths to the SPA. Create a Vercel project from this repository and add this environment variable for **Production, Preview, and Development**:

```text
REACT_APP_BACKEND_URL=https://<your-api-host>
```

The value must be the public base URL of the FastAPI service, without a trailing slash. Vercel hosts the frontend with the current configuration; it does not deploy the Python API in `backend/`.

## API and data

Deploy `backend/` to a Python-compatible host and configure its environment from `backend/.env.example`. Set `ADMIN_EMAIL` to any valid email address you choose; it is the login name and is not email-verified. Create a password hash with `cd backend && python3 hash_admin_password.py`, then save the printed hash as `ADMIN_PASSWORD_HASH` in the API host's secret settings. Passwords require at least six ASCII characters, including a letter and a number. The password is entered invisibly and is never stored in the database. The API limits repeated failed logins and issues a protected seven-day session cookie. Set `COOKIE_SECURE=true` on the HTTPS API host (`false` only for local HTTP). Replacing the password hash invalidates existing sessions.

Set `FRONTEND_ORIGINS` to the exact frontend origins, comma-separated, including your Vercel production domain and any preview domain you intend to use. Use a managed MongoDB database and set `MONGO_URL` and `DB_NAME` on the API host. The admin login no longer depends on Google or an OAuth callback.

Uploaded files currently go to `backend/uploads`. That directory is suitable for local development, but should not be treated as permanent storage on a serverless or ephemeral host. Before publishing, move uploads to persistent object storage and store the returned public URLs in MongoDB.

## Local development

Copy `frontend/.env.example` to `frontend/.env` and set `REACT_APP_BACKEND_URL` to the local API URL. Copy `backend/.env.example` to `backend/.env` and set the database URL, admin email, generated password hash, and AI key as needed. Keep real `.env` files and credentials out of Git.

