# Focus - Minimalist Goal Tracker

## Introduction & Philosophy

Focus is a comprehensive yet minimalist goal tracking application designed to help users set, track, and achieve their personal goals with clarity and consistency. The application is built upon three core principles:

- **Simplicity First**: Minimalist interface removes distractions and cognitive load
- **Atomic Progress**: Break large goals into manageable daily actions
- **Positive Reinforcement**: Reward-based system to develop sustainable habits

Inspired by research in behavioral psychology and habit formation (particularly James Clear's "Atomic Habits" and B.J. Fogg's "Tiny Habits"), the app encourages users to break down large ambitions into manageable daily actions and rewards, fostering a sustainable path towards success.

The core philosophy is **"Stay focused. Start small. Make it happen."** The application is designed to reduce friction in two key ways:
1. **Zero-barrier entry**: Users can begin tracking a goal without registration
2. **Progressive engagement**: Advanced features become available as users develop commitment

## Core Usage Flow

### 1. User Access & Authentication

- **Guest Access (Zero-Commitment Entry)**: 
  - Users click "Try it instantly" on the landing page
  - System generates a temporary anonymous user ID with format `temp_[randomString]` 
  - ID stored in localStorage with 30-day persistence
  - All data created during this session is fully functional but tied to the temporary ID
  - Guest users can later convert to registered accounts, preserving all their data

- **Registration (Enhanced Security & Persistence)**:
  - Simple registration requiring username, email, and password
  - Email verification optional but recommended
  - Password requirements: minimum 8 characters, including uppercase, lowercase, and special characters
  - Social authentication intentionally not implemented to maintain privacy focus

### 2. Goal Setting (Onboarding)

New users (guest or registered) are guided through an intuitive, visually-driven onboarding flow to define their first goal:

- **Goal Title**: Clear, specific objective (e.g., "Complete JavaScript Course")
- **Motivation**: Personal reason for pursuing this goal, displayed as motivation during challenges
- **Resources Inventory**: Existing assets, skills, or support systems available to help
- **Daily Task**: Small, consistent action (typically requiring <15 minutes) to be performed daily
- **Reward System**: Small daily reward for task completion + larger reward upon goal achievement
- **Target Date**: Realistic timeframe for goal completion (system suggests appropriate ranges)
- **Vision Image**: (Optional) Visual representation uploaded or selected from library

The onboarding process implements progressive disclosure, showing one question at a time with contextual guidance. Each field includes subtle psychological framing to encourage effective goal setting (e.g., suggesting present-tense, positive language).

### 3. Dashboard Interface

The main interface employs a responsive design with three primary panels (collapsing appropriately on smaller screens):

- **Sidebar (Goal Management)**: 
  - Lists all active goals with visual priority indicators
  - "Add Goal" button for creating additional goals
  - Quick-access priority adjustment (High/Medium/Low with color coding)
  - Target date display and inline date picker for adjustments
  - Archive/completion functionality for finished goals
  - Smart sorting based on priority, recent activity, and completion rate

- **Goal Details (Central Panel)**:
  - Goal title and editable motivation statement
  - Vision image with inspirational quotes that rotate daily
  - Weekly calendar view with color-coded progress indicators
  - Expandable goal declaration section (commitment statement)
  - Progress statistics (streak count, completion percentage, consistency score)
  - Daily task quick-completion button
  - Weekly overview of activity patterns

- **Progress Report (Analytics Panel)**:
  - AI-generated analysis based on activity patterns
  - Time-range selection (7/30/90 days, custom range)
  - Interactive charts showing completion rates over time
  - Pattern recognition highlighting most productive days/times
  - Personalized improvement suggestions
  - Exportable reports in PDF format

### 4. Daily Progress Tracking

The core interaction loop centers around the `WeeklyDailyCards` & `DailyCardRecord` components:

- **Daily Card Interaction**:
  - Users click on the current day's card in the weekly view
  - Visual indicators show completed/missed/future days
  - Today's card is highlighted with a pulsing animation

- **Daily Record Dialog**:
  - Shows the defined daily task with checkbox for completion
  - Displays the associated reward as motivational reminder
  - Free-text journal field for recording thoughts, obstacles, or insights
  - Mood/energy level tracking (optional)
  - Time tracking feature (optional)
  - Save & close or save & add another option

- **Streak Maintenance**:
  - Continuous tracking of daily completion streaks
  - "Streak protection" feature allowing one missed day per week without breaking streak
  - Recovery suggestions when streaks are broken
  - Milestone celebrations at key streak numbers (7, 30, 100 days)

### 5. Goal Declaration System

A unique feature that leverages psychological commitment principles:

- **Auto-Generated Declaration**: System creates a personalized commitment statement based on the user's goal details
- **Customization Options**: Users can edit and personalize the declaration text
- **Visual Styling**: Declaration presented in an aesthetically pleasing, certificate-like format
- **Sharing Capabilities**: Option to download or share declaration (private link or social media)
- **Reminder Integration**: Scheduled reminders can include declaration excerpts for motivation

### 6. AI-Powered Progress Analysis

Sophisticated natural language processing provides personalized insights:

- **Data Collection**: Analysis based on completion patterns, journal entries, and interaction frequency
- **Report Generation**: AI generates human-like feedback in four key areas:
  1. **Progress Assessment**: Quantitative analysis of completion rates and consistency
  2. **Pattern Recognition**: Identification of optimal performance times and potential obstacles
  3. **Strategic Recommendations**: Personalized suggestions for improvement
  4. **Motivational Encouragement**: Positive reinforcement based on progress

- **Technical Implementation**:
  - Backend processing via Hugging Face's inference API
  - Privacy-preserving design (data processed but not stored by third party)
  - Customizable analysis parameters
  - Report caching to reduce API calls and improve performance

### 7. User Profile & Data Management

Comprehensive account controls with privacy emphasis:

- **Profile Management**:
  - Basic information editing (name, email, password)
  - Notification preferences
  - Theme selection (light/dark/system)
  - Account deletion with clear data handling information

- **Data Control Features**:
  - Export all data in JSON format
  - Data retention policies clearly explained
  - Option to delete individual goals or specific progress records
  - For guest users: streamlined registration process that preserves existing data

## Technical Architecture

### System Architecture Overview

The application follows a modern client-server architecture with clear separation of concerns:

```
                        ┌─────────────────┐
                        │                 │
                        │  Client (React) │
                        │                 │
                        └────────┬────────┘
                                 │
                                 │ HTTPS/REST
                                 ▼
┌─────────────────┐     ┌────────────────────┐     ┌─────────────────┐
│                 │     │                    │     │                 │
│     MongoDB     │◄────│   Server (Node.js) │────►│  Hugging Face   │
│                 │     │                    │     │   Inference     │
└─────────────────┘     └────────────────────┘     └─────────────────┘
                                 │
                                 │ HTTPS
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │   Cloudinary    │
                        │  (Image Store)  │
                        │                 │
                        └─────────────────┘
```

## Project Structure

The project is a monorepo containing the frontend client and the backend server.

```
FocusFinalProjectGitHub/
├── client/                 # React Frontend (Vite)
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── components/     # Reusable UI components (Sidebar, GoalDetails, etc.)
│   │   ├── pages/          # Page-level components (Home, Login, Register, etc.)
│   │   ├── services/       # API service layer (api.js using Axios)
│   │   ├── store/          # Global state management (Zustand)
│   │   ├── styles/         # CSS Modules and global styles
│   │   ├── theme/          # Material UI theme configuration
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main application component, routing setup
│   │   └── main.jsx        # Application entry point
│   ├── .env.production     # Production environment variables (e.g., VITE_API_URL)
│   ├── eslint.config.js    # ESLint configuration
│   ├── index.html          # HTML entry point
│   ├── package.json        # Frontend dependencies and scripts
│   └── vite.config.js      # Vite configuration
│
└── server/                 # Node.js Backend (Express)
    ├── config/             # Configuration files (db.js)
    ├── controllers/        # Request handlers, business logic
    ├── middleware/         # Express middleware (auth.js)
    ├── models/             # Mongoose data models (User, Goal, Progress, etc.)
    ├── routes/             # API route definitions
    ├── services/           # Service layer (e.g., ReportService)
    ├── utils/              # Utility functions
    ├── .env                # Development/production environment variables
    ├── app.js              # Express app setup (middleware registration)
    ├── package.json        # Backend dependencies and scripts
    └── server.js           # Server entry point, DB connection, route mounting
```

## Authentication

Authentication is handled using JSON Web Tokens (JWT) stored in HTTP-only cookies.

1.  **Registration (`/api/auth/register`):**
    *   User provides username, email, and password.
    *   Password is hashed using bcrypt on the server (`User` model pre-save hook).
    *   A new user document is created in MongoDB.
2.  **Login (`/api/auth/login`):**
    *   User provides email and password.
    *   Server finds the user by email.
    *   Compares the provided password with the hashed password stored in the DB using bcrypt.
    *   If credentials are valid, a JWT is generated containing the user ID.
    *   The JWT is sent back to the client in an `HttpOnly` cookie (named `token`).
3.  **Guest Access (`/api/temp-users`):**
    *   Client requests a temporary user session.
    *   Server generates a unique temporary ID (e.g., `temp_xxxxx`).
    *   Stores this ID briefly (or associates it with minimal data if needed).
    *   Client stores this `tempId` in `localStorage`.
4.  **Authenticated Requests:**
    *   For subsequent requests to protected routes, the browser automatically sends the `token` cookie.
    *   The `requireAuth` middleware on the server verifies the JWT.
        *   It decodes the token using the `JWT_SECRET`.
        *   If valid, it extracts the user ID and attaches it to the `req.user` object.
        *   If invalid or expired, it returns a 401 Unauthorized error.
5.  **Ownership Middleware (`requireOwnership`):**
    *   Certain routes (like modifying a specific goal) use additional middleware (`requireOwnership`) to ensure the authenticated user (`req.user.id`) owns the resource they are trying to access (e.g., checks if `goal.userId` matches `req.user.id`).
6.  **Logout (`/api/auth/logout`):**
    *   Clears the `token` cookie on the server side.
    *   Client removes `userId` or `tempId` from `localStorage`.

## Database Interaction

*   **Database:** MongoDB Atlas (Cloud-hosted MongoDB).
*   **ODM:** Mongoose is used as the Object Data Mapper to interact with the MongoDB database.
*   **Connection:** The connection to MongoDB is established in `server/config/db.js` using the `MONGODB_URI` environment variable and initiated in `server/server.js`.
*   **Models (`server/models/`):** Define the schema for data structures like `User`, `Goal`, `Progress`, `Report`, etc. They include data types, validation rules, default values, and pre-save hooks (e.g., for password hashing).
*   **Controllers (`server/controllers/`):** Contain the core logic for handling API requests. They interact with Mongoose models to perform CRUD (Create, Read, Update, Delete) operations on the database. For example, `goalsController.js` handles creating, fetching, updating, and deleting goals.
*   **Data Flow:**
    1.  API request hits a route defined in `server/routes/`.
    2.  The route calls the corresponding controller function.
    3.  The controller uses Mongoose models (e.g., `Goal.findById()`, `new Progress().save()`) to interact with the database.
    4.  Data retrieved from or saved to the database is then formatted and sent back as the API response.

## External APIs & Tools

### Backend (Server)

*   **Framework:** Express.js
*   **Database:** MongoDB Atlas
*   **ODM:** Mongoose
*   **Authentication:** JWT (jsonwebtoken library), bcrypt (for hashing), cookie-parser
*   **Environment Variables:** dotenv
*   **CORS:** cors middleware
*   **AI Feedback:** Hugging Face Inference API (`@huggingface/inference`) - Used in `ReportService` to generate text-based feedback. Requires `HUGGING_FACE_API_KEY`.
*   **(Potential/Implied) File Uploads:** Cloudinary (Based on `/api/uploads` route in `server.js`, though implementation details aren't visible in provided code). Requires Cloudinary credentials (API Key, Secret, Cloud Name) usually set via environment variables.

### Frontend (Client)

*   **Framework/Library:** React
*   **Build Tool:** Vite
*   **State Management:** Zustand (with `devtools` and `persist` middleware)
*   **UI Library:** Material UI (MUI) - Core components, Icons, Date Pickers (`@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`)
*   **Routing:** React Router (`react-router-dom`)
*   **HTTP Client:** Axios
*   **Date Handling:** date-fns (`@mui/x-date-pickers/AdapterDateFns`)
*   **Styling:** CSS Modules, Global CSS (`src/styles`)
*   **Linting:** ESLint (`eslint.config.js`)
*   **Notifications:** React Hot Toast (`react-hot-toast`)

## Deployment

### Backend (Server - Express/Node.js)

1.  **Platform:** Choose a platform like Render, Heroku, AWS EC2, Google Cloud Run, etc. Render is often user-friendly for Node.js apps.
2.  **Environment Variables:** Set the following environment variables on the hosting platform:
    *   `MONGODB_URI`: Your MongoDB connection string.
    *   `PORT`: The port the server should listen on (often provided by the platform).
    *   `JWT_SECRET`: A strong, secret key for signing JWTs.
    *   `NODE_ENV`: Set to `production`.
    *   `CLIENT_URL`: The URL of your deployed frontend (for CORS configuration).
    *   `HUGGING_FACE_API_KEY`: Your API key for the Hugging Face service.
    *   **(If using Cloudinary):** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
3.  **Build & Start:**
    *   Ensure your `package.json` has a `start` script (e.g., `"start": "node server.js"`).
    *   The platform will typically run `npm install` (or `yarn install`) and then `npm start`.
4.  **CORS:** Double-check that the `CLIENT_URL` environment variable is correctly set and included in the `allowedOrigins` array in `server.js` (or managed via the `cors` middleware configuration) to allow requests from your deployed frontend.

### Frontend (Client - React/Vite)

1.  **Platform:** Choose a static hosting platform like Netlify, Vercel, Render (Static Sites), GitHub Pages, etc. Vercel and Netlify offer excellent integration with Git repositories.
2.  **Environment Variables:** Set the following environment variable on the hosting platform:
    *   `VITE_API_URL`: The URL of your deployed backend API.
3.  **Build Command:** Configure the platform to use `npm run build` (or `yarn build`). Vite will create a production-ready build in the `dist` directory.
4.  **Publish Directory:** Set the publish directory to `client/dist` (or just `dist` if building from within the `client` directory context).
5.  **Routing:** Configure URL rewriting for client-side routing. For most platforms, you'll need to set up a rule so that all requests that don't match a static file are redirected to `index.html`.
    *   **Netlify:** Create a `public/_redirects` file with `/* /index.html 200`.
    *   **Vercel:** Create a `vercel.json` file with rewrite rules.

## Local Development Setup

1.  **Prerequisites:**
    *   Node.js and npm (or yarn) installed.
    *   MongoDB instance (local or cloud like MongoDB Atlas).
2.  **Clone Repository:**
    ```bash
    git clone <your-repository-url>
    cd FocusFinalProjectGitHub
    ```
3.  **Backend Setup:**
    ```bash
    cd server
    npm install
    # Create a .env file in the server directory
    # Add your environment variables (MONGODB_URI, JWT_SECRET, etc.)
    # Example .env:
    # MONGODB_URI=mongodb+srv://...
    # PORT=5050
    # JWT_SECRET=your_super_secret_key
    # HUGGING_FACE_API_KEY=your_hf_key
    # CLIENT_URL=http://localhost:5173 # For local dev
    npm run dev # Or your defined dev script (e.g., using nodemon)
    ```
4.  **Frontend Setup:**
    ```bash
    cd ../client
    npm install
    # Ensure .env.development or similar contains VITE_API_URL=http://localhost:5050 (or your server port)
    # Vite automatically loads .env files
    npm run dev
    ```
5.  **Access:**
    *   Frontend should be available at `http://localhost:5173` (or the port Vite assigns).
    *   Backend API will be running at `http://localhost:5050` (or the port defined in `server/.env`). 