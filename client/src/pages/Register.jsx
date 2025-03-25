import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import apiService from '../services/api';
import '../styles/Register.css'; // We'll create this CSS file later

/**
 * Register Component
 * 
 * This component:
 * 1. Displays a registration form with username, email, and password fields
 * 2. Handles form submission and user creation
 * 3. Stores user data and token in localStorage on successful registration
 * 4. Provides a link to the Login page
 * 
 * Route: /register
 * Next route: / (after successful registration)
 */
function Register() {
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Loading state for form submission
  const [loading, setLoading] = useState(false);
  
  // Error message state
  const [error, setError] = useState('');
  
  // Navigation hook for redirect after registration
  const navigate = useNavigate();

  /**
   * Update form data when inputs change
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user types
    if (error) setError('');
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      // Check for temp user ID in localStorage
      const tempId = localStorage.getItem('tempId');
      
      // Prepare registration data
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      
      // Include tempId if available to migrate guest data
      if (tempId) {
        registrationData.tempId = tempId;
      }
      
      // Call the registration API
      const response = await apiService.auth.register(registrationData);
      
      // Store user data and token in localStorage
      localStorage.setItem('userId', response.data.data.id);
      localStorage.setItem('token', response.data.data.token);
      
      // Remove temporary user ID if it exists
      localStorage.removeItem('tempId');
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Display appropriate error message
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h1>Focus</h1>
      <p className="subtitle">Create your account</p>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            placeholder="Choose a username"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            placeholder="your@email.com"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            placeholder="Choose a password"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            placeholder="Confirm your password"
          />
        </div>
        
        <button 
          type="submit"
          className="register-button"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      
      <div className="register-options">
        <p>
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register; 