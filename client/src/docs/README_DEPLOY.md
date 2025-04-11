# Focus App Deployment Guide and Experience Summary

This guide will help you set up and deploy the frontend and backend of Focus App, and summarizes the issues encountered during deployment and their solutions.

## Deployment Experience Summary

During the deployment process, we encountered several key issues and successfully resolved them:

### Backend Deployment Challenges

1. **Converting CommonJS to ES Modules**:
   - Problem: The backend initially used CommonJS (`require`/`module.exports`) format, but needed to be converted to ES Modules (`import`/`export`) to accommodate Vite and modern JavaScript.
   - Solution: We systematically changed all `require` statements to `import`, and `module.exports` to `export default` or named `export`.
   - Example:
     ```javascript
     // From
     const mongoose = require("mongoose");
     module.exports = mongoose.model("User", UserSchema);
     
     // Changed to
     import mongoose from "mongoose";
     const User = mongoose.model("User", UserSchema);
     export default User;
     ```

2. **Cross-Origin Resource Sharing (CORS) Setup**:
   - Problem: The frontend and backend were deployed on different domains, causing CORS errors.
   - Solution: Updated the CORS configuration to allow requests from the production frontend and ensure cookies could be transmitted across domains.
   ```javascript
   app.use(
     cors({
       origin: function(origin, callback) {
         const allowedOrigins = [
           process.env.CLIENT_URL || "http://localhost:5173",
           "https://focusappdeploy-frontend.onrender.com"
         ];
         if(!origin || allowedOrigins.indexOf(origin) !== -1) {
           callback(null, true);
         } else {
           callback(new Error('Not allowed by CORS'));
         }
       },
       credentials: true,
       methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
       allowedHeaders: ["Content-Type", "Authorization"],
     })
   );
   ```

3. **Cookie Settings**:
   - Problem: When clearing cookies, the same parameters as when setting them were not applied, leading to cross-domain cookie handling issues.
   - Solution: Ensured that the same options were used when clearing cookies as when setting them:
   ```javascript
   const clearTokenCookie = (res) => {
     res.clearCookie('token', {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
       path: '/'
     });
   };
   ```

4. **Environment Variables**:
   - Problem: NODE_ENV was not correctly set to production, causing incorrect cookie security settings.
   - Solution: Ensured `NODE_ENV=production` was set in the production environment.

### Frontend Deployment Challenges

1. **Hardcoded API URLs**:
   - Problem: The frontend code directly hardcoded the local address of the backend API (`http://localhost:5050`).
   - Solution: Created a centralized API service file (`api.js`) that uses environment variables to set the base URL.
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
   ```

2. **Environment Variable Configuration**:
   - Problem: Lack of proper environment variable setup made switching between development and production environments difficult.
   - Solution: Created `.env` and `.env.production` files, and set corresponding environment variables in the Render deployment configuration.

3. **Vite Configuration**:
   - Problem: The proxy settings in the Vite configuration used hardcoded URLs.
   - Solution: Updated `vite.config.js` to use environment variables:
   ```javascript
   export default defineConfig(({ mode }) => {
     const env = loadEnv(mode, process.cwd())
     return {
       // ...
       server: {
         proxy: {
           "/api": {
             target: env.VITE_API_URL || "http://localhost:5050",
             changeOrigin: true,
           },
         },
       },
     }
   });
   ```

## Environment Variable Configuration

### Frontend Environment Variables

Focus App frontend uses environment variables to determine the API server URL. You need to set the following environment variables:

- `VITE_API_URL`: The URL of the API server

#### Development Environment

For the development environment, we've created a `.env` file containing default settings:

```
VITE_API_URL=http://localhost:5050
```

#### Production Environment

For the production environment, we've created a `.env.production` file containing production settings:

```
VITE_API_URL=https://focusappdeploy-backend.onrender.com
```

### Backend Environment Variables

The backend needs the following environment variables:

```
PORT=5050
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
CLIENT_URL=https://focusappdeploy-frontend.onrender.com
JWT_SECRET=your_jwt_secret_key
```

## Manual Deployment Steps

### Frontend Deployment

1. **Install Dependencies**:
   ```bash
   cd client
   npm install
   ```

2. **Build the Application**:
   ```bash
   npm run build
   ```
   This will generate a `dist` directory containing static files.

3. **Deploy Static Files**:
   Upload the files in the `dist` directory to your static file server (such as Render, Netlify, Vercel, etc.).

### Backend Deployment

1. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Build the Application** (if needed):
   ```bash
   npm run build
   ```

3. **Deploy the Service**:
   Deploy the backend code to a platform that supports Node.js (such as Render, Heroku, etc.).

## Deploying on Render

### Frontend Deployment

1. Log in to your Render account and create a new Static Site service.

2. **Connect your GitHub repository, or upload project files**.

3. Set the following configuration:
   - **Name**: `focus-app-frontend` (or any name you prefer)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
   - **Environment Variables**:
     - Add the environment variable `VITE_API_URL` and set it to your backend service URL (such as `https://focusappdeploy-backend.onrender.com`)

4. Click the "Create Static Site" button.

### Backend Deployment

1. Log in to your Render account and create a new Web Service.

2. Connect your GitHub repository, or upload project files.

3. Set the following configuration:
   - **Name**: `focusappdeploy-backend` (or any name you prefer)
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node server.js`
   - **Environment Variables**:
     - Add all necessary environment variables, including `NODE_ENV=production`, `CLIENT_URL`, etc.

4. Click the "Create Web Service" button.

## Testing the Deployment

After deployment is complete, test whether the application is working properly with the following steps:

1. Visit the deployed frontend URL (e.g., `https://focusappdeploy-frontend.onrender.com`).
2. Try to log in or continue as a guest.
3. Verify that communication with the backend API is working correctly.
4. Check the console for any errors or CORS issues.

## Troubleshooting

### CORS Issues

If you encounter CORS errors:

1. Ensure the CORS configuration in the backend is correct and includes the frontend domain.
2. Make sure cookie settings allow cross-domain (with `secure: true` and `sameSite: 'none'`).
3. Check if frontend API calls include `withCredentials: true`.

### Authentication Issues

If you encounter 401 Unauthorized errors:

1. Check that cookie settings are correct.
2. Make sure the environment variable `NODE_ENV` is set to `production`.
3. Check if frontend requests are using the correct API URL.

### API Connection Issues

If the frontend cannot connect to the backend:

1. Ensure the environment variable `VITE_API_URL` is set correctly.
2. Check if network requests are reaching the backend server.
3. Verify that the backend service is running properly.

## Best Practices Summary

1. **Environment Variables**: Use environment variables to manage configuration differences between different environments.
2. **API Service Encapsulation**: Create a centralized API service file instead of using axios directly in components.
3. **CORS Configuration**: Correctly set up CORS to allow cross-domain requests and cookies.
4. **Cookie Settings**: Ensure `secure: true` and `sameSite: 'none'` are used in cross-domain environments.
5. **ES Modules**: Modern JavaScript applications recommend using ES module syntax (`import`/`export`). 