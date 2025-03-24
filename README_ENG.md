# Focus - Smart Goal Tracking System

A web application focused on helping users set, track, and achieve personal goals, based on the SMART goal-setting method and vision psychology.

## Project Overview

Focus is a concise yet powerful goal tracking platform designed to help users:

- Create clear, measurable goals
- Track progress through daily checkpoints
- Receive AI-generated weekly reports and feedback
- Build a sense of achievement and confidence

## Security and Authentication Implementation Plan

### Phase 1: JWT Authentication & Cookie Management ✅

**Completed**

- ✅ Unify temporary user creation endpoint
- ✅ Remove createTempUser function from authController.js
- ✅ Update temporary user creation route in tempUserRoutes.js
- ✅ Generate JWT and set Cookie when creating temporary users
- ✅ Create authentication middleware
- ✅ Implement basic JWT parsing middleware
- ✅ Create functionality for verifying temporary and registered users

### Phase 2: Route Protection & Data Security 🔄

**In Progress**

- 🔄 Apply authentication middleware to existing routes
- 🔄 Protect specific routes to ensure only authorized users can access
- 🔄 Ensure users can only access their own data
- 🔄 Implement IP rate limiting
- 🔄 Create middleware to prevent excessive temporary user creation from the same IP

### Phase 3: Account Management Features 📝

**Planned**

- 📝 Implement user deletion functionality
- 📝 Add endpoint for deleting temporary users
- 📝 Add endpoint for deleting registered users
- 📝 Implement Cookie and local storage cleanup
- 📝 Optimize user experience
- 📝 Adjust frontend code to adapt to the new authentication mechanism
- 📝 Implement smooth transition from temporary to registered users

## Frontend Implementation Status

### Completed Features ✅

- ✅ User authentication and session management
- ✅ Login and logout functionality with error handling
- ✅ Guest/temporary user support
- ✅ Component-based architecture
- ✅ Responsive layout design
- ✅ Modern UI with improved visual design

### Current Work 🔄

- 🔄 Goal creation and management interface
- 🔄 Progress tracking visualization
- 🔄 User profile management
- 🔄 Task completion functionality

## User Role System

The system has implemented a basic user role framework, but currently only the regular user functionality is enabled:

- `regular`: Regular users with access to basic functionality
- `premium`: Premium users who may have additional features (to be implemented in the future)
- `admin`: Administrators who may have system management permissions (to be implemented in the future)

Temporary users (TempUser) and regular registered users (role='regular') have the same basic functionality permissions. The features for premium users and administrators may be expanded in the future according to business requirements.

## Project Environment Setup Steps

### 1. Create Project Basic Structure

```bash
# Create project root directory
mkdir focus-app
cd focus-app

# Initialize Git repository
git init

# Create basic directory structure
mkdir -p server/models server/routes server/controllers server/config
```

### 2. Set up Backend (Express + MongoDB) and Test MongoDB Connection After Installing Vite

```bash
# Enter backend directory
cd server

# Initialize package.json for backend
npm init -y

# Install core dependencies
npm install express mongoose dotenv cors jsonwebtoken bcryptjs

# Install development dependencies
npm install --save-dev nodemon

# Create .env file
touch .env
```

# Add necessary environment variables to `.env` file:

```env
PORT=5050
MONGODB_URI=mongodb+srv://FocusFinalProject_team:<password>@cluster0.nxsur.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
NODE_ENV=development

# JWT_SECRET=your_jwt_secret (skip first this line here)
```

Add the following scripts to `package.json`:

```json
"scripts": {
    "start": "node server/server.js",
    "dev": "nodemon server/server.js"
}
```

Change the following:

```json
"main": "server/server.js",
```

# In `server/config/db.js` (create this file)

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`🔥 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // when connection failed, exit the application
  }
};

module.exports = connectDB;
```

# In `server/server.js` (create this file with the following content)

```javascript
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// load env variables
dotenv.config();

// connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5050;

// test API
app.get("/", (req, res) => {
  res.send("Hello from Express Server!");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
```

### 3. Set up Frontend (React + Vite)

```bash
# Return to root directory
cd ..

# Use Vite to create React frontend project
npm create vite@latest client -- --template react
# above default setting : client, React, JS
# will suggest the following
# cd client, npm install, npm run dev

# Enter frontend directory
cd client

# Install dependencies (frontend)
npm install

# Install other frontend dependencies
npm install axios react-router-dom
```

Modify Vite configuration file `vite.config.js` to support proxying:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

Confirm scripts in `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

# Running npm run dev
You should see the following in the console:
🚀 Server running on port 5050
🔥 MongoDB Connected: cluster0-shard-00-01.nxsur.mongodb.net

### 4. Set up MongoDB (using Mongoose) - Already completed above.

### 5. Set up Root Directory package.json (Optional)

```bash
# Return to root directory
cd ..

# Initialize root directory package.json (in the focus-app folder)
npm init -y
```

```bash
npm install --save-dev concurrently
# focus-app/package.json manages both frontend and backend scripts
```

Modify `package.json` to add concurrent running scripts:

```json
{
  "name": "focus-app",
  "scripts": {
    "server": "cd server && npm run dev",
    "client": "cd client && npm run dev",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "install-all": "npm install && cd server && npm install && cd ../client && npm install"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

###
```bash
npm run install-all
# Ensure client frontend and server backend dependencies are correctly installed.

npm run dev # Start frontend and backend
```

## Recommended Project Structure

The recommended project structure is similar to what is shown in the screenshot, but slightly simplified:

```
focus-app/
├── server/                # Backend section
│   ├── models/            # MongoDB models
│   │   ├── User.js        # User model (users collection)
│   │   ├── Goal.js        # Goal model (goals collection)
│   │   ├── Progress.js    # Progress model (progresses collection)
│   │   ├── Report.js      # Report model (reports collection)
│   │   └── TempUser.js    # Temporary user model (temp_users collection)
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── goals.js
│   │   ├── users.js
│   │   └── ...
│   ├── controllers/       # Business logic
│   ├── config/            # Configuration files
│   ├── server.js          # Main entry point
│   └── .env               # Environment variables
│
├── client/                # Frontend section (Vite + React)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Header/    # Header components
│   │   │   ├── Sidebar/   # Sidebar components
│   │   │   ├── GoalDetails/ # Goal detail components
│   │   │   └── ProgressReport/ # Progress components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS styles
│   │   ├── App.jsx        # Main application
│   │   └── main.jsx       # Entry file
│   └── ...
```

This structure maintains clear organization while simplifying some unnecessary complexity, especially suitable for the MVP development stage.

## Core Features

### Goal Management

- Goal setting based on SMART principles
- Tracking up to 3 priority goals simultaneously
- Personalized vision statements
- Custom checkpoints

### Progress Tracking

- Daily task completion records
- Progress notes and reflections
- Image upload support
- Mood tracking (optional)

### AI Smart Analysis

- Weekly auto-generated summary reports
- Intelligent feedback based on user records
- Achievement reminders and encouragement
- Self-reward suggestions

## Technology Stack

### Frontend

- React.js (built with Vite)
- React Router
- Axios
- Optional: Tailwind CSS or Material UI

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Nodemon (development mode)

### Other Tools

- dotenv (environment variable management)
- Mongoose (MongoDB ODM)
- JWT (authentication)

### External APIs

- Google OAuth 2.0 (user authentication)
- OpenAI API (AI-driven report generation)

## Data Model Details

### 1. Users Collection (users)

Main fields:

- email: User email (unique)
- googleId: Google authentication ID
- tempID: if exists (needed for transition from TempUser to User)
- username: User name
- goals: Array of associated goal IDs
- preferences: User preference settings
  - language: Language preference
  - timezone: Time zone
  - notifications: Notification settings

### 2. Goals Collection (goals)

Main fields:

- userId: Associated user ID
- title: Goal title
- description: Goal description
- priority: Priority (1-3)
- status: Status (active/completed/archived)
- targetDate: Target date
- progress: Array of associated progress record IDs
- declaration: Goal declaration
  - content: Declaration content
  - vision: Vision
  - checkpoints: Array of checkpoints

### 3. Progress Collection (progresses)

Main fields:

- goalId: Associated goal ID
- userId: Associated user ID
- date: Record date
- records: Array of progress records
  - content: Content
  - duration: Duration
  - mood: Mood
  - images: Array of image URLs
- checkpoints: Checkpoint completion status

### 4. Reports Collection (reports)

Main fields:

- goalId: Associated goal ID
- userId: Associated user ID
- type: Report type (weekly/monthly)
- period: Report period
- content: Report content
- insights: AI-generated insights
- recommendations: Recommended suggestions

### 5. Temporary Users Collection (temp_users) (MongoDB syntax rules)

Main fields:

- tempId: Temporary user ID
- expiresAt: Expiration time
- goals: Temporary goal data
- convertedToUser: Whether converted to a formal user

## Page Requirements

### 1. Home Page (/)

- Display website purpose and feature introduction
- Anonymous users can browse basic content
- Logged-in users can see personal goal summaries
- Dynamic content of recent goal progress

### 2. Login/Registration Page

- Support Google account login
- Only require login when user identity is needed
- Guest mode option

### 3. Profile Page (/profile)

- Display user information
- Goals and progress overview
- Personal information editing functionality

### 4. Search/Results Page (/search)

- Goal and progress search functionality
- Results summary display
- Links to detailed pages

### 5. Detailed Page (/goals/:id)

- Goal detailed information
- Progress history records
- AI-generated analysis and suggestions

## Project Progress Plan

### Iteration 1 (Days 1-10) ✅

**Goal:** Establish basic architecture, implement frontend-backend connection and core data models

- ✅ Initialize React frontend and Express backend projects
- ✅ Design and implement MongoDB data models (users, goals, progress, reports, temp_users)
- ✅ Develop basic home page (/), including content visible to anonymous users
- ✅ Establish routing system
- ✅ Implement basic CRUD API endpoints
- ✅ Design basic UI for goal creation and tracking

**Deliverables:**

- ✅ Runnable frontend-backend connected application
- ✅ Complete data models
- ✅ Basic CRUD function API endpoints
- ✅ Simple but functional home page

### Iteration 2 (Days 11-20) 🔄

**Goal:** Expand core functionality, integrate external APIs, improve user experience

- 🔄 Complete all CRUD operation APIs and frontend implementations
- 🔄 Integrate Google OAuth for user authentication
- 🔄 Implement goal creation and management interface
- 🔄 Develop progress tracking and checkpoint system
- 🔄 Add search/filter functionality
- 🔄 Implement detailed page display
- 🔄 Preliminary integration of OpenAI API
- 🔄 Optimize navigation and user experience
- 🔄 Add error handling and data validation

**Deliverables:**

- Improved CRUD operations
- Integration with external APIs
- Enhanced user interface and experience
- Search and detailed page implementation

### Iteration 3 (Days 21-30) 📝

**Goal:** Refine application, add advanced features, ensure application usability and responsive design

- 📝 Complete user authentication and profile page
- 📝 Implement AI-driven weekly report generation functionality
- 📝 Add user roles and permissions system
- 📝 Ensure all pages have responsive design
- 📝 Conduct accessibility optimization
- 📝 Perform comprehensive testing and adjustments
- 📝 Prepare for final deployment
- 📝 Refine documentation and demonstration materials

**Deliverables:**

- Full-featured application
- Responsive design supporting mobile devices
- High accessibility score
- Complete user authentication and personalized experience

## Team Division of Labor

### Member 1

- Responsible for project architecture and backend development
- Database design and API implementation
- OpenAI API integration

### Member 2

- Responsible for frontend development and UI design
- Implement responsive interface
- Google OAuth integration

## Development and Deployment Instructions

### Development Mode

```bash
# Run backend in development mode
cd server
npm run dev

# Run frontend in development mode
cd client
npm run dev

# Or run both simultaneously from root directory (if root package.json is set up)
npm run dev
```

### Production Build

```bash
# Build frontend
cd client
npm run build

# Start backend server (production mode)
cd ../server
npm start
```

## Notes

1. For MVP stage (approximately 100 users), project structure can be simplified, not requiring as complex file organization as shown in the example
2. Prioritize implementation of core functionality, focusing first on user, goal, and progress management
3. Use dotenv to separate configuration, keeping sensitive information secure
4. Ensure MongoDB connection uses the correct connection string format
5. Consider using MongoDB Atlas as a cloud database to avoid local configuration issues

## Project Status

✅ **Iteration 1** has been completed. The application now has a functioning authentication system, basic UI components, and the foundation for goal tracking functionality.

🔄 Currently working on **Iteration 2**, expanding core functionality and improving the user interface.

```
Product Type

Personal diary system, emphasizing "Simple recording, pressure-free use"

User Types

guest / register

Guest Characteristics

No account/password, exists for only 21 days, has tempId (stored in localStorage)

Registered User Characteristics

Can register manually, or transition from guest

Goal 1️⃣

Don't want to interrupt the guest experience (convenient entry, no need to fill out forms)

Goal 2️⃣

Avoid malicious guest account creation causing database pressure / DDoS (security)

Existing Measures

MongoDB TTL mechanism clears expired guests ✔️

Concern 1️⃣

Users might remember _id and try to bypass verification

Concern 2️⃣

localStorage can be deleted, causing users to become new guests 