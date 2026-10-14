# KEVIN — Campus Skill Exchange & Smart Team Matcher

> **Finding the right teammates for hackathons and projects shouldn't be guesswork.**  
> **KEVIN** helps college students build dream teams backed by real code evidence from GitHub and smart AI matching.

---

## 💡 What is KEVIN?

Most campus team formation happens on WhatsApp or Discord with messages like *"Anyone know Machine Learning?"*. This usually leads to unbalanced squads, people ghosting, or discovering at 2 AM in a hackathon that someone only watched a tutorial and never wrote real code.

**KEVIN solves this:**
1. **No Fake Profiles:** It connects to your GitHub and verifies your actual coding history (original repos, commit depth, languages).
2. **Campus Identity:** Sign in with your college account or Google. You know who you're working with.
3. **AI Team Matcher:** Type in your project idea (e.g., *"Drone inspection app using AI and React"*). KEVIN figures out what technical skills your team is missing and recommends students on campus who fill those exact gaps.

---

## ✨ Key Features

- **🔍 Smart Team Formation:** Create a project team, see your current team's strengths, and let the AI find missing talent.
- **⚡ GitHub Verification:** Automatically scans repositories to show real skill levels, separating original projects from simple forks.
- **🏆 Campus Hackathons:** Browse upcoming hackathons, see dates, and register your team directly.
- **👥 Student Talent Directory:** Search for campus peers by skill (e.g., Python, React, PyTorch, Rust).
- **🔒 Secure & Fast:** Rate-limited authentication, Google sign-in support, and fully mobile-friendly.

---

## 🚀 Quick Start Guide (How to Run Locally)

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Git**

---

### 2. Setup the Backend Server

Open your terminal in the project root:

```bash
# 1. Install dependencies
npm install

# 2. Make sure your .env has the basic config (example):
# PORT=5000
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# GEMINI_API_KEY=your_gemini_key

# 3. Start the backend
npm run dev
```

The backend API will run at `http://localhost:5000`.  
You can check if it's running by visiting: `http://localhost:5000/health`.

---

### 3. Setup the Frontend Website

In a second terminal window, navigate to the `frontend` folder:

```bash
# 1. Go into the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open your browser and visit: **`http://localhost:5173`** 🎉

---

## 🧭 How to Use the App

1. **Sign Up / Log In**:
   - Click **Login** or **Register**, or click **Continue with Google** for instant 1-click access.
2. **Connect GitHub (Optional but Recommended)**:
   - Head to your **Dashboard** and connect your GitHub profile to showcase your verified skills.
3. **Create or Join a Team**:
   - Go to **Teams** → click **Create a Team**.
   - Open your team details and click **Find Teammates** to get AI-powered recommendations based on your project goals!
4. **Discover Campus Hackathons**:
   - Go to **Hackathons** to explore competitions and register your squad.

---

## 🛠️ Built With

- **Frontend**: React, Vite, Modern Responsive Vanilla CSS
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **Authentication**: Firebase Auth (Email & Google OAuth)
- **AI & Forensics**: Google Gemini API & GitHub REST API

---

## 👥 The Team (Innovate365)

Built for **DSU DEVHACK 3.0** at *Sahyadri College of Engineering & Management*:

- **Thanvi JR** — AI & Backend Architecture
- **Rajath K** — Database & GitHub Integration
- **Gahan** — Core Backend & Matching Logic

---

Made with ❤️ for students, hackers, and builders.