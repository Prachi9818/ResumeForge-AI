# ResumeForge AI (Full-Stack)

Full-stack Resume Builder & Career Tracker built with Vanilla HTML/CSS/JS, Express.js, MongoDB (Mongoose), `bcryptjs`, and `jsonwebtoken` (JWT).

## Project Structure

```text
resumeforge-ai/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
└── backend/
    ├── config/db.js
    ├── middleware/auth.js
    ├── models/
    │   ├── User.js
    │   ├── Resume.js
    │   └── Application.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── resumeRoutes.js
    │   ├── appRoutes.js
    │   └── progressRoutes.js
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── package.json
    └── server.js
```

## Setup & Run

### 1. Start MongoDB
Make sure MongoDB is running locally on `mongodb://127.0.0.1:27017` (or update `MONGO_URI` in `backend/.env` with your MongoDB Atlas URI).

### 2. Run the Backend
```bash
cd backend
npm install
npm run dev
```
The API will start on `http://localhost:5000`.

### 3. Run the Frontend
Open `frontend/index.html` using VS Code **Live Server** (or run `npx serve frontend`).

## API Endpoints

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Public | Register user (bcrypt hash + default resume) |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | JWT | Get logged-in user profile & progress |
| PUT | `/api/auth/profile` | JWT | Update display name & email |
| GET | `/api/resumes` | JWT | List user's resume versions |
| POST | `/api/resumes` | JWT | Create a new resume version |
| PUT | `/api/resumes/:id` | JWT | Update a resume version |
| DELETE | `/api/resumes/:id` | JWT | Delete a resume version |
| GET | `/api/applications` | JWT | List job applications |
| POST | `/api/applications` | JWT | Add a job application |
| PUT | `/api/applications/:id` | JWT | Update an application |
| DELETE | `/api/applications/:id` | JWT | Delete an application |
| PUT | `/api/progress` | JWT | Sync skill progress, roadmap, and last match |
