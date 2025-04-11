import { Navigate } from 'react-router-dom';

/**
 * AuthProtected - A higher-order component for route protection
 * 
 * This component:
 * 1. Checks if the user is authenticated by looking for userId and token in localStorage
 * 2. If authenticated, renders the protected component
 * 3. If not authenticated, redirects to the login page
 * 
 * @param {Object} ProtectedComponent - The component to render if authenticated
 * @returns React component
 */
const AuthProtected = ({ component: ProtectedComponent }) => {
  // Check if user is authenticated
  const isAuthenticated = () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    
    // For guest users, we only have userId but no token
    // For registered users, we should have both userId and token
    return !!userId;
  };

  // If authenticated, render the protected component
  // Otherwise, redirect to login page
  return isAuthenticated() ? (
    <ProtectedComponent />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default AuthProtected; 