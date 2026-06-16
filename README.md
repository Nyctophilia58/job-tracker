# Job Tracker

A full-stack job application tracking platform that helps users organize and manage their job search process in one place.


## Live Demo

**Frontend:** https://job-tracker-one-gules.vercel.app

**Backend API:** https://job-tracker-ux6t.onrender.com

---

## Features

* User authentication with JWT
* Secure registration and login
* Track job applications
* Create, update, and delete job entries
* Manage application statuses
* Responsive user interface
* RESTful API architecture
* MongoDB database integration
* API documentation with Swagger

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* React Router
* Tailwind CSS

### Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* JWT Authentication
* Bcrypt
* Swagger

### Deployment

* Frontend: Vercel
* Backend: Render

---

## Project Structure

```text
job-tracker
├── frontend
│   ├── src
│   └── ...
│
├── backend
│   ├── src
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/Nyctophilia58/job-tracker.git
cd job-tracker
```

---

## Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
```

Start development server:

```bash
npm run dev
```

Build project:

```bash
npm run build
```

Run production build:

```bash
npm start
```

---

## Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Run development server:

```bash
npm run dev
```

Build project:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## API Endpoints

### Authentication

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | /api/auth/register |
| POST   | /api/auth/login    |

### Jobs

| Method | Endpoint      |
| ------ | ------------- |
| GET    | /api/jobs     |
| POST   | /api/jobs     |
| PUT    | /api/jobs/:id |
| DELETE | /api/jobs/:id |

---

## Environment Variables

### Backend

```env
PORT=
MONGO_URI=
JWT_SECRET=
FRONTEND_URL=
```

### Frontend

```env
VITE_API_URL=
```

---

## Deployment

### Frontend (Vercel)

```env
VITE_API_URL=https://job-tracker-ux6t.onrender.com/api
```

### Backend (Render)

```env
FRONTEND_URL=https://job-tracker-one-gules.vercel.app
```

---

## Future Improvements

* Interview scheduling
* Email notifications
* Role-based access control

---

## Author

**Homiya Nowshin Ananna**

GitHub: https://github.com/Nyctophilia58
