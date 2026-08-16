# ComplaintCare

A full-stack complaint management platform built with React and Express. Users can raise, track, and resolve complaints. Admins assign complaints to agents, and agents manage resolution through a built-in chat system.

**Live Demo:** [https://complaintcare.netlify.app](https://complaintcare.netlify.app)

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, React Router, Axios |
| Backend  | Express 5, Node.js, Mongoose        |
| Database | MongoDB Atlas                       |
| Auth     | JWT (JSON Web Tokens)               |
| Hosting  | Netlify (frontend), Render (backend)|

---

## Features

- User registration and login with JWT authentication
- Password reset via email
- Raise complaints with address, city, state, pincode, and description
- Track complaint status (Pending → In Progress → Resolved)
- Admin dashboard to view all complaints, users, and agents
- Admin assigns complaints to agents
- Agent dashboard with search, filter, and status management
- Real-time chat between users and agents per complaint
- Rate limiting on authentication endpoints
- Input validation and NoSQL injection protection

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB)
- [Git](https://git-scm.com/)

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/Hari-Krishna-9999/ComplaintCare.git
cd ComplaintCare
```

### 2. Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file by copying the example:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```
PORT=5000
MONGO_URI=mongodb+srv://<your-username>:<your-password>@cluster0.mongodb.net/complaintSystem?retryWrites=true&w=majority
JWT_SECRET=<generate-a-strong-64-char-random-string>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

To generate a strong JWT secret, run:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start the backend:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Setup the frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file:

```bash
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

Start the frontend:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

---

## Project Structure

```
ComplaintCare/
├── backend/
│   ├── server.js                  # Entry point
│   ├── app.js                     # Express app setup
│   └── src/
│       ├── config/
│       │   ├── db.js              # MongoDB connection
│       │   └── env.js             # Environment variable loader
│       ├── controllers/
│       │   ├── authController.js  # Register, login, password reset
│       │   ├── complaintController.js
│       │   ├── adminController.js
│       │   └── messageController.js
│       ├── middleware/
│       │   ├── authMiddleware.js   # JWT protect & role authorize
│       │   ├── errorMiddleware.js  # Global error handler
│       │   └── rateLimiter.js      # Rate limiting
│       ├── models/
│       │   ├── User.js
│       │   ├── Complaint.js
│       │   ├── AssignedComplaint.js
│       │   └── Message.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── complaintRoutes.js
│       │   ├── adminRoutes.js
│       │   └── messageRoutes.js
│       └── utils/
│           ├── generateToken.js
│           └── sendEmail.js
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                # Routes
│       ├── api/api.js             # Axios instance
│       ├── utils/auth.js          # Auth helpers
│       └── components/
│           ├── common/            # Login, SignUp, Home, ChatWindow, etc.
│           ├── user/              # HomePage, Status
│           ├── admin/             # AdminHome
│           └── agent/             # AgentHome
│
└── README.md
```

---

## API Endpoints

### Auth
| Method | Endpoint                       | Description         |
|--------|--------------------------------|---------------------|
| POST   | `/api/auth/register`           | Register a new user |
| POST   | `/api/auth/login`              | Login               |
| POST   | `/api/auth/forgot-password`    | Request password reset |
| POST   | `/api/auth/reset-password/:token` | Reset password   |

### Complaints (requires auth)
| Method | Endpoint                       | Description              |
|--------|--------------------------------|--------------------------|
| GET    | `/api/complaints`              | Get all complaints (Admin) |
| POST   | `/api/complaints`              | Create a complaint       |
| GET    | `/api/complaints/user/:userId` | Get user's complaints    |
| GET    | `/api/complaints/:id`          | Get complaint by ID      |
| PUT    | `/api/complaints/:id`          | Update a complaint       |
| DELETE | `/api/complaints/:id`          | Delete a complaint       |

### Admin (requires Admin role)
| Method | Endpoint                           | Description              |
|--------|------------------------------------|--------------------------|
| GET    | `/api/admin/agents`                | Get all agents           |
| GET    | `/api/admin/users`                 | Get all ordinary users   |
| DELETE | `/api/admin/users/:id`             | Delete a user            |
| PUT    | `/api/admin/users/:id`             | Update a user            |
| POST   | `/api/admin/assign`                | Assign complaint to agent|
| GET    | `/api/admin/assigned/:agentId`     | Get agent's assignments  |
| PUT    | `/api/admin/status/:complaintId`   | Update complaint status  |

### Messages (requires auth)
| Method | Endpoint                       | Description              |
|--------|--------------------------------|--------------------------|
| POST   | `/api/messages`                | Send a message           |
| GET    | `/api/messages/:complaintId`   | Get messages for complaint|

---

## User Roles

| Role     | Access                                         |
|----------|-------------------------------------------------|
| Ordinary | Raise complaints, track status, chat with agent |
| Agent    | View assigned complaints, update status, chat   |
| Admin    | View all data, assign complaints, manage users  |

---

## Environment Variables

| Variable        | Required | Description                          |
|-----------------|----------|--------------------------------------|
| `PORT`          | No       | Backend port (default: 5000)         |
| `MONGO_URI`     | Yes      | MongoDB connection string            |
| `JWT_SECRET`    | Yes      | Secret key for signing JWT tokens    |
| `JWT_EXPIRES_IN`| No       | Token expiry (default: 7d)           |
| `CLIENT_URL`    | Yes      | Frontend URL for CORS                |
| `NODE_ENV`      | No       | Environment (default: development)   |
| `EMAIL_HOST`    | Prod     | SMTP host for password reset emails  |
| `EMAIL_PORT`    | Prod     | SMTP port                            |
| `EMAIL_USER`    | Prod     | SMTP username                        |
| `EMAIL_PASSWORD`| Prod     | SMTP password                        |
| `EMAIL_FROM`    | Prod     | Sender email address                 |
| `EMAIL_SECURE`  | No       | Use TLS (default: false)             |

---

## Running Tests

```bash
cd backend
npm test
```

---

## Deployment

**Backend** is deployed on [Render](https://render.com) as a Web Service.

**Frontend** is deployed on [Netlify](https://netlify.com) with the build command `npm run build` and publish directory `dist/`.

Set `VITE_API_URL` in Netlify environment variables to your Render backend URL (e.g., `https://complaintcare-zomt.onrender.com/api`).

---

