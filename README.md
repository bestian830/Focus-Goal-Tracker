# Focus App - Goal Tracking and Focus Management Application

## Project Overview

Focus App is a full-stack application designed to help users set, track, and accomplish personal goals. Built on the MERN (MongoDB, Express, React, Node.js) technology stack, it offers rich functionality including user authentication, goal management, progress tracking, AI-generated reports, and data visualization.

## Technical Architecture

### Frontend Technology Stack

- **React 19**: JavaScript library for building user interfaces
- **React Router 7.3.0**: Handles frontend routing
- **Material UI 7.0**: Modern UI component library
- **Emotion**: CSS-in-JS solution for component style management
- **Zustand 5.0.3**: Lightweight state management library
- **Axios 1.8.4**: HTTP client for API communication
- **Date-fns**: Date manipulation utility library
- **html2canvas & jspdf**: For PDF report generation and export
- **Vite 6.2.0**: Modern frontend build tool
- **ESLint 9.21.0**: Code quality checking tool

### Backend Technology Stack

- **Node.js**: JavaScript runtime environment
- **Express 4.21.2**: Web application framework
- **MongoDB 6.14.2**: NoSQL database
- **Mongoose 8.12.1**: MongoDB object modeling tool
- **JSON Web Token**: For authentication and authorization
- **bcryptjs**: For password hashing
- **OpenAI API**: For AI functionality integration
- **HuggingFace Inference**: For AI functionality integration
- **Cloudinary**: For image upload and storage
- **dotenv**: For environment variable management

## Project Structure
```
FocusFinalProject/
├── client/                   # Frontend application
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route page components
│   │   ├── services/         # API services
│   │   ├── store/            # Zustand state management
│   │   ├── styles/           # Global styles
│   │   ├── App.jsx           # Main application component
│   │   └── main.jsx          # Entry file
│   ├── public/               # Static resources
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration file
│
├── server/                   # Backend application
│   ├── config/               # Configuration files
│   ├── controllers/          # Controllers (handle requests)
│   ├── middleware/           # Middleware
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── services/             # Business logic services
│   ├── utils/                # Utility functions
│   ├── app.js                # Express application configuration
│   └── server.js             # Server entry file
│
├── .env                      # Environment variables (root directory)
└── package.json              # Project dependencies and scripts
```
## Database Design

### Model Design (MongoDB Schemas)

#### 1. User Model (User.js)
```javascript
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function(){ return !this.googleId } },
  googleId: { type: String, sparse: true },
  username: { type: String, required: true },
  tempId: { type: String, sparse: true },
  avatarUrl: { type: String, default: null },
  role: { type: String, enum: ['regular', 'premium', 'admin'], default: 'regular' },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});
```

#### 2. Temporary User Model (TempUser.js)
Provides temporary access for unregistered visitors

#### 3. Goal Model (Goal.js)
Records goals created by users

#### 4. Progress Model (Progress.js)
Tracks goal completion progress

#### 5. Report Model (Report.js)
AI-generated progress reports and analysis results

## Key Features

### 1. User Authentication System
- Traditional email/password registration and login
- Temporary user (guest) functionality
- JWT authentication and authorization
- User role management (regular user, premium user, administrator)

### 2. Goal Management
- Create, read, update, and delete goals
- Set goal deadlines and priorities
- Goal categorization and tag management
- Visual goal representation

### 3. Progress Tracking
- Record goal progress and completion status
- Progress charts and data visualization
- Progress history
- Timeline view

### 4. AI Integration
- Generate analysis reports based on user progress data
- AI-assisted goal setting and recommendations
- Utilizes OpenAI and HuggingFace models

### 5. Image Upload
- User avatar upload
- Goal-related image upload
- Image storage and processing with Cloudinary

### 6. Reporting and Export
- Generate PDF progress reports
- Data export functionality
- Implemented using html2canvas and jspdf

## Installation Guide

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB database
- Cloudinary account (for image uploads)
- OpenAI API key (for AI functionality)
- HuggingFace API key (for AI functionality)

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/your-username/focus-app.git
cd focus-app
```

2. Install dependencies:
```bash
npm run install-all
```
This will install all dependencies for the root directory, frontend, and backend.

3. Configure environment variables:
   
Create `.env` file in the root directory:
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string

Create `.env` file in the `server` directory:
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173

Create `.env` file in the `client` directory (needed for production):
VITE_API_URL=http://localhost:5050/api

4. Start the development server:
```bash
npm run dev
```
This will start both frontend and backend servers.

## API Structure

### Authentication APIs
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/guest` - Guest login
- `GET /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user information

### Goal APIs
- `GET /api/goals` - Get all user goals
- `POST /api/goals` - Create new goal
- `GET /api/goals/:id` - Get single goal details
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Progress APIs
- `GET /api/progress/:goalId` - Get progress for specific goal
- `POST /api/progress` - Record new progress
- `GET /api/progress/summary` - Get progress summary

### Report APIs
- `POST /api/reports/generate` - Generate AI report
- `GET /api/reports/:id` - Get specific report
- `GET /api/reports/user/:userId` - Get all user reports

### User APIs
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/profile` - Delete user account

### Upload APIs
- `POST /api/uploads/avatar` - Upload user avatar
- `POST /api/uploads/goal-image` - Upload goal-related image

## Frontend Architecture

### State Management (Zustand)

Using Zustand for lightweight state management, more concise and intuitive than Redux:

```javascript
// User state store example
const useUserStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await api.login(credentials);
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    await api.logout();
    set({ user: null, isAuthenticated: false });
  }
}));
```

### Component Structure

- **Layout Components**: Page layouts and navigation bars
- **Form Components**: For data input and user interaction
- **Display Components**: For displaying data and content
- **Functional Components**: Components that implement specific functionality
- **Higher-Order Components**: Components for sharing logic

### Routing Design

Using React Router v7 for frontend routing:

```javascript
<Router>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/goals" element={<ProtectedRoute><GoalsList /></ProtectedRoute>} />
    <Route path="/goals/:id" element={<ProtectedRoute><GoalDetail /></ProtectedRoute>} />
    <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
  </Routes>
</Router>
```

## Backend Architecture

### Middleware

- **Authentication Middleware**: Validates user identity and permissions
  ```javascript
  // JWT authentication middleware example
  export const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    
    if (!token) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized, token missing' } });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ success: false, error: { message: 'Token invalid or expired' } });
    }
  };
  ```
  
- **Rate Limiting Middleware**: Prevents API abuse
- **Error Handling Middleware**: Centrally handles errors and returns responses in a unified format

### Controllers

Controllers handle HTTP requests, call service layer methods, and return responses:

```javascript
// Goal controller example
export const createGoal = async (req, res) => {
  try {
    const { title, description, targetDate, category } = req.body;
    const userId = req.user._id;

    const goal = await Goal.create({
      userId,
      title,
      description,
      targetDate,
      category
    });

    res.status(201).json({
      success: true,
      data: goal
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: { message: error.message }
    });
  }
};
```

### Service Layer

The service layer encapsulates business logic for controller use:

```javascript
// Report service example
export const generateAIReport = async (userId, goalId, timeframe) => {
  // Get user and goal data
  const user = await User.findById(userId);
  const goal = await Goal.findById(goalId);
  const progress = await Progress.find({ goalId }).sort({ date: 1 });
  
  // Prepare data
  const reportData = {
    user: { username: user.username },
    goal: {
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate
    },
    progress: progress.map(p => ({
      date: p.date,
      value: p.value,
      notes: p.notes
    }))
  };
  
  // Call AI API to generate report
  const reportContent = await callAIService(reportData, timeframe);
  
  // Save report to database
  const report = await Report.create({
    userId,
    goalId,
    content: reportContent,
    type: 'ai-generated',
    createdAt: new Date()
  });
  
  return report;
};
```

## Deployment Guide

### Frontend Deployment (Render.com)

1. Register a Render.com account
2. Create a new Static Site service
3. Connect to GitHub repository
4. Configure build command: `cd client && npm install && npm run build`
5. Publish directory: `client/dist`
6. Add environment variables: `VITE_API_URL=https://your-backend-url.onrender.com/api`

### Backend Deployment (Render.com)

1. Create a new Web Service
2. Connect to GitHub repository
3. Build command: `npm install`
4. Start command: `node server/server.js`
5. Add all necessary environment variables (MongoDB URI, JWT key, various API keys, etc.)

## API Key Configuration

For security reasons, all API keys and sensitive information should be stored in the `.env` file and excluded in `.gitignore`. Users need to obtain their own API keys:

### OpenAI API
1. Create an OpenAI account: https://platform.openai.com/signup
2. Generate API key: https://platform.openai.com/api-keys
3. Add the key to server/.env file: `OPENAI_API_KEY=your_key`

### HuggingFace API
1. Create a HuggingFace account: https://huggingface.co/join
2. Generate API token: https://huggingface.co/settings/tokens
3. Add the token to server/.env file: `HUGGINGFACE_API_KEY=your_key`

### Cloudinary Setup
1. Create a Cloudinary account: https://cloudinary.com/users/register
2. Get cloud name, API key, and secret from the dashboard
3. Add information to server/.env file

### MongoDB Setup
1. Create a MongoDB Atlas account: https://www.mongodb.com/cloud/atlas/register
2. Create a new cluster and database
3. Get the connection string and add to .env file: `MONGODB_URI=your_connection_string`

## Technology Selection Rationale

### Frontend Technology

- **React**: Component-based development, rich ecosystem, Facebook support
- **Material UI**: Provides high-quality pre-designed components following Material Design guidelines
- **Emotion**: Powerful CSS-in-JS solution supporting dynamic styles and theming
- **Zustand**: Simpler state management than Redux, reduces boilerplate code
- **Vite**: Faster development build tool than webpack, supports hot module replacement

### Backend Technology

- **Express**: Flexible Node.js web framework, easy to extend
- **MongoDB**: Flexible NoSQL database, suitable for storing variably structured data
- **Mongoose**: Powerful object data modeling tool providing data validation and middleware functionality
- **JWT**: Secure user authentication and session management

### Cloud Services

- **Cloudinary**: Specialized service for image management, provides optimization and transformation capabilities
- **OpenAI API**: Provides advanced language models for generating insightful reports
- **HuggingFace**: Platform for open-source AI models, provides diverse AI functionality

## Project Summary

Focus App is a comprehensive goal tracking application built using modern frontend and backend technologies. It not only provides basic goal management functionality but also integrates AI-driven report generation and data analysis to help users achieve their goals more effectively. The project uses a layered architecture design to ensure code maintainability and extensibility.

## Contribution Guidelines

Contributions to this project are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open-source under the ISC license.
