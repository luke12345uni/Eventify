# ◆ Eventify — Setup & Run Instructions
**Module:** DAT6006 Full Stack Development
Luke evans st20271513

---

## Required Software

Before running this project you must have the following software installed on your machine:

| Software | Version | Download Link |
|---|---|---|
| Node.js | v18 or higher | https://nodejs.org |
| MongoDB Community Server | v6 or higher | https://www.mongodb.com/try/download/community |
| MongoDB Compass (optional) | Latest | https://www.mongodb.com/products/compass |
| Git | Latest | https://git-scm.com/downloads |
| A web browser | Any modern browser | Chrome recommended |


---

## Step 1 — Download the Project from GitHub

Open Terminal and run the following command to clone the repository to your computer:

```bash
git clone https://github.com/luke12345uni/Eventify.git
```

Then navigate into the project folder:

```bash
cd eventify
```

---

## Step 2 — Install Dependencies

Run the following command to install all required Node.js packages:

```bash
npm install
```

This will read the `package.json` file and automatically download all dependencies into a `node_modules` folder. This may take a minute.

---

## Step 3 — Create the Environment File

The project requires a `.env` file in the root of the project folder. Create one and add the following:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/eventify
SESSION_SECRET=eventify_session_secret
NODE_ENV=development
```

> *Note:* The `.env` file is not included in the GitHub repository for security reasons. You must create this file manually.

---

## Step 4 — Start MongoDB

Before running the server, MongoDB must be running on your machine.

**Mac (Homebrew):**
```bash
brew services start mongodb-community
```

**Windows:**
MongoDB runs as a background service automatically after installation. If it is not running, open Services and start MongoDB.

**To verify MongoDB is running**, open MongoDB Compass and connect to:
```
mongodb://localhost:27017
```

---

## Step 5 — Start the Server

Run the following command from inside the project folder:

```bash
npm start
```

You should see the following output in Terminal:

```
✅ Connected to MongoDB
🚀 Eventify running at http://localhost:3000
```

---

## Step 6 — Open the Website

Open your web browser and go to:

```
http://localhost:3000
```

The Eventify home page will load. Click **Get Started** to create an account, then log in to access the event management dashboard.

---

## Step 7 — Create an Account

1. Click **Get Started** on the home page
2. Enter a username, email address and password (minimum 6 characters)
3. Click **Register Your Account**
4. You will be redirected to the login page
5. Enter your email and password and click **Sign In**
6. You will be taken to the **All Events** dashboard

---

## Stopping the Server

To stop the server press **Ctrl + C** in Terminal.

To stop MongoDB (Mac):
```bash
brew services stop mongodb-community
```

---

## Project File Structure

```
eventify/
├── server/
│   ├── index.js              — Express app, session setup, routes
│   ├── models/
│   │   ├── User.js           — User schema with bcrypt hashing
│   │   └── Event.js          — Event schema with validation
│   └── routes/
│       ├── auth.js           — Login, register, logout routes
│       └── events.js         — Full CRUD + search and filter
├── client/
│   ├── pages/
│   │   ├── home.html         — Landing page
│   │   ├── login.html        — Login form
│   │   ├── register.html     — Registration form
│   │   ├── events.html       — Dashboard and events list
│   │   ├── add-event.html    — Add and edit event form
│   │   └── about.html        — About page
│   ├── css/
│   │   └── style.css         — Full design system stylesheet
│   └── js/
│       └── main.js           — Shared JavaScript
├── .env                      — Environment variables (create manually)
├── package.json              — Project dependencies
└── README.md                 — This file
```

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Create a new account | No |
| POST | `/auth/login` | Log in | No |
| GET | `/auth/logout` | Log out | Yes |
| GET | `/api/events` | Get all events (supports search and filter) | Yes |
| GET | `/api/events/:id` | Get a single event | Yes |
| POST | `/api/events` | Create a new event | Yes |
| PUT | `/api/events/:id` | Update an existing event | Yes |
| DELETE | `/api/events/:id` | Delete an event | Yes |

---

## Troubleshooting

**Port 3000 already in use:**
```bash
kill $(lsof -t -i:3000)
```
Then run `npm start` again.

**MongoDB connection error:**
Make sure MongoDB is running before starting the server. Run `brew services start mongodb-community` on Mac.

**Cannot find module error:**
Run `npm install` again to ensure all dependencies are installed.

**Page has no styling:**
Check that the `.env` file exists and that `MONGODB_URI` is spelled correctly with the underscore.

---

*Eventify — DAT6006 Full Stack Development — Cardiff Metropolitan University 2025–2026*
