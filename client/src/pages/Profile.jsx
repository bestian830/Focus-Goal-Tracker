import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/Profile.css';

/**
 * Profile Component
 * 
 * FUNCTION:
 * 1. Display user profile information
 * 2. Allow users to update their data (username, email)
 * 3. Allow users to change their password
 * 4. Allow users to delete their account
 */
function Profile() {
  const navigate = useNavigate();
  
  // user data
  const [profile, setProfile] = useState(null);
  // edit mode
  const [isEditing, setIsEditing] = useState(false);
  // change password mode
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  // confirm delete mode
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // loading state
  const [loading, setLoading] = useState(true);
  // error message
  const [error, setError] = useState('');
  // success message
  const [successMessage, setSuccessMessage] = useState('');
  // API connection state
  const [apiConnected, setApiConnected] = useState(true);
  
  // form data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  
  // password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // 檢查API連接
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const isHealthy = await apiService.healthCheck();
        setApiConnected(isHealthy);
      } catch (error) {
        console.error("API健康檢查失敗:", error);
        setApiConnected(false);
      }
    };
    
    checkApiConnection();
  }, []);
  
  // check if the user is logged in and get the data
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError('');
      
      // if the API connection fails, display the error message
      if (!apiConnected) {
        setError('Connection failed. Please check your network connection or try again later.');
        setLoading(false);
        return;
      }
      
      try {
        // check if there is a temp user ID
        const tempId = localStorage.getItem('tempId');
        if (tempId) {
          // temp user cannot access the profile page
          setError('臨時用戶不能訪問此頁面。請先註冊或登錄。');
          setLoading(false);
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        // get the user ID
        const userId = localStorage.getItem('userId');
        if (!userId) {
          // user is not logged in, redirect to login page
          navigate('/login');
          return;
        }
        
        // get the user data
        const response = await apiService.users.getProfile();
        
        if (response.data && response.data.success) {
          const userData = response.data.data;
          setProfile(userData);
          setFormData({
            username: userData.username,
            email: userData.email,
          });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        if (error.code === 'ERR_NETWORK') {
          setError('無法連接到服務器。請檢查您的網絡連接或稍後再試。');
        } else if (error.response && error.response.status === 401) {
          setError('您需要登錄才能訪問個人資料頁面。');
          // 重定向到登錄頁面
          setTimeout(() => navigate('/login'), 2000);
        } else if (error.response && error.response.data && error.response.data.error) {
          setError(error.response.data.error.message);
        } else {
          setError('獲取用戶資料失敗。請稍後再試。');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [navigate, apiConnected]);
  
  // handle form input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // handle password form input change
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };
  
  // handle data submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await apiService.users.updateProfile(formData);
      
      if (response.data && response.data.success) {
        setProfile(response.data.data);
        setSuccessMessage('個人資料更新成功！');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      if (error.code === 'ERR_NETWORK') {
        setError('無法連接到服務器。請檢查您的網絡連接或稍後再試。');
      } else if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error.message);
      } else {
        setError('更新資料失敗。請稍後再試。');
      }
    }
  };
  
  // handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // validate if the new password and confirm password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('新密碼和確認密碼不一致。');
      return;
    }
    
    try {
      const response = await apiService.users.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data && response.data.success) {
        setSuccessMessage('密碼更新成功！');
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Failed to update password:', error);
      if (error.code === 'ERR_NETWORK') {
        setError('無法連接到服務器。請檢查您的網絡連接或稍後再試。');
      } else if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error.message);
      } else {
        setError('更新密碼失敗。請稍後再試。');
      }
    }
  };
  
  // handle account deletion
  const handleDeleteAccount = async () => {
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await apiService.users.deleteAccount();
      
      if (response.data && response.data.success) {
        // remove the user ID from the local storage
        localStorage.removeItem('userId');
        
        setSuccessMessage('您的帳戶已成功刪除。正在重定向到首頁...');
        
        // delay redirecting, so the user can read the success message
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      if (error.code === 'ERR_NETWORK') {
        setError('無法連接到服務器。請檢查您的網絡連接或稍後再試。');
      } else if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error.message);
      } else {
        setError('刪除帳戶失敗。請稍後再試。');
      }
      setShowDeleteConfirm(false);
    }
  };
  
  // 重試連接
  const handleRetry = () => {
    window.location.reload();
  };
  
  // loading state
  if (loading) {
    return <div className="profile-container"><p>載入中...</p></div>;
  }
  
  // 顯示API連接錯誤
  if (!apiConnected) {
    return (
      <div className="profile-container">
        <h2>連接錯誤</h2>
        <p className="error-message">無法連接到服務器。請檢查您的網絡連接或稍後再試。</p>
        <button onClick={handleRetry} className="btn">重試</button>
      </div>
    );
  }
  
  // render error message
  if (error && !profile) {
    return (
      <div className="profile-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/')} className="btn">返回首頁</button>
      </div>
    );
  }
  
  return (
    <div className="profile-container">
      <h1>Profile</h1>
      
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      
      {profile && (
        <div className="profile-content">
          {!isEditing && !isChangingPassword && !showDeleteConfirm && (
            <div className="profile-info">
              <div className="info-row">
                <span className="info-label">Username：</span>
                <span className="info-value">{profile.username}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email：</span>
                <span className="info-value">{profile.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Registration Date：</span>
                <span className="info-value">{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <span className="info-label">最後登錄：</span>
                <span className="info-value">{profile.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : '無記錄'}</span>
              </div>
              
              <div className="profile-actions">
                <button onClick={() => setIsEditing(true)} className="btn edit-btn">
                  Edit Data
                </button>
                <button onClick={() => setIsChangingPassword(true)} className="btn password-btn">
                  Change Password
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} className="btn delete-btn">
                  Delete Account
                </button>
                <button onClick={() => navigate('/')} className="btn back-btn">
                  Back to Home
                </button>
              </div>
            </div>
          )}
          
          {isEditing && (
            <form onSubmit={handleSubmit} className="profile-form">
              <h2>Edit Profile</h2>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
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
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn save-btn">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      username: profile.username,
                      email: profile.email,
                    });
                  }}
                  className="btn cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          
          {isChangingPassword && (
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <h2>Change Password</h2>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn save-btn">
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="btn cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          
          {showDeleteConfirm && (
            <div className="delete-confirmation">
              <h2>Confirm Delete Account</h2>
              <p>Are you sure you want to delete your account? This action cannot be undone.</p>
              <div className="form-actions">
                <button
                  onClick={handleDeleteAccount}
                  className="btn delete-confirm-btn"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile; 
// =======
// import ProfileInfo from '../components/Profile/ProfileInfo';
// import ChangePassword from '../components/Profile/ChangePassword';
// import '../style/style.css';

// export default function Profile() {
//     return (
//         <div className="profile-container">
//             <ProfileInfo />
//             <ChangePassword />
//         </div>
//     );
// }
// >>>>>>> b560d1e7384e6cf25894eebe0dda7abde88ab209
