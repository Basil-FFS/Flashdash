# FlashDash

A modern, secure dashboard for agent and admin management, credit report lookup, and performance metrics.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [AWS Deployment](#aws-deployment)
- [User Roles & Access](#user-roles--access)
- [API Endpoints](#api-endpoints)
- [Development Notes](#development-notes)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Features

- **Role-based authentication** (admin, agent, viewer)
- **Admin-only user management** (add, edit, delete users)
- **Agent dashboard** with personal details and performance metrics
- **Credit report lookup** (integrated with ForthCRM)
- **Modern, responsive UI** with sidebar navigation
- **Secure JWT authentication**
- **No public sign-up**; only admins can add users
- **Coming soon** placeholders for future features
- **AWS Lambda deployment** for scalable backend

---

## Project Structure

```
FLASH DASH v0.9/
  flashdash-backend/
    controllers/
    middleware/
    routes/
    utils/
    createAdmin.js
    createUser.js
    db.js
    schema.sql
    server.js
    serverless.yml
    ...
  flashdash-frontend/
    src/
      components/
        AdminPanel.js
        Dashboard.js
        Login.js
        Sidebar.js
      pages/
        CreditSearch.js
        Filters.js
        Home.js
      utils/
        api.js
      App.js
      index.js
      index.css
    ...
```

---

## Setup Instructions

### Backend

1. **Install dependencies:**
   ```bash
   cd flashdash-backend
   npm install
   ```

2. **Configure your database:**
   - Update your database connection string in `db.js` or use the provided Supabase connection.

3. **Create the users table:**
   ```sql
   -- Run in your SQL client or use schema.sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     role TEXT DEFAULT 'user'
   );
   ```

4. **Create the first admin user:**
   ```bash
   node createAdmin.js
   ```
   - Follow the prompts to set up your admin account.

5. **Start the backend server (local development):**
   ```bash
   npm start
   ```

### Frontend

1. **Install dependencies:**
   ```bash
   cd flashdash-frontend
   npm install
   ```

2. **Start the frontend:**
   ```bash
   npm start
   ```
   - The app will run on [http://localhost:3000](http://localhost:3000)

### AWS Deployment

1. **Install Serverless Framework globally:**
   ```bash
   npm install -g serverless
   ```

2. **Configure AWS credentials:**
   ```bash
   aws configure
   ```

3. **Set environment variables:**
   Create a `.env` file in the backend directory with:
   ```
   DATABASE_URL=your_database_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Deploy to AWS:**
   ```bash
   cd flashdash-backend
   npm run deploy
   ```

5. **Update frontend API endpoint:**
   The frontend is already configured to use the AWS API Gateway endpoint:
   ```
   https://1813b6ckkf.execute-api.us-east-1.amazonaws.com/dev
   ```

---

## User Roles & Access

- **Admin:** Full access to all features, including user management and admin settings.
- **Agent:** Access to their dashboard and credit report lookup.
- **Viewer:** Read-only access (future feature).

**Note:** Only admins can add new users. There is no public sign-up.

---

## API Endpoints

### Production API Gateway
```
https://1813b6ckkf.execute-api.us-east-1.amazonaws.com/dev
```

### Auth
- `POST /api/login` — User login
- `GET /api/me` — Get current user info

### Admin (admin only)
- `GET /api/admin/users` — List all users
- `POST /api/admin/users` — Create a new user
- `PUT /api/admin/users/:id` — Update user info
- `DELETE /api/admin/users/:id` — Delete a user

### Credit Report
- `POST /api/forthcrm/credit-report` — Lookup credit report (requires auth)

---

## Development Notes

- **Sidebar navigation** is consistent across all pages and includes a sign-out option.
- **Responsive design:** The dashboard and all pages are mobile-friendly and adapt to different screen sizes.
- **Modern UI:** Uses Tailwind CSS for styling and React for the frontend.
- **Serverless deployment:** Backend is deployed on AWS Lambda for scalability.

---

## Security

- **JWT authentication** for all protected routes.
- **Role-based access control** enforced in backend middleware.
- **No public registration:** Only admins can create users.
- **Passwords** are securely hashed with bcryptjs.
- **CORS** is configured for production domains.

---

## Troubleshooting

- **401 Unauthorized:** Make sure you are logged in and your token is valid. Log out and log in again if needed.
- **Cannot see users/admin panel:** Only admins can access user management features.
- **Database connection issues:** Check your connection string and database status.
- **Frontend not updating:** Try clearing your browser cache or restarting the frontend server.
- **AWS deployment issues:** Check your AWS credentials and environment variables.

---

## Future Features

- More detailed agent performance metrics
- Viewer role and permissions
- Additional admin analytics
- Integration with more external APIs

---

**For any issues or feature requests, please contact the project maintainer.** 