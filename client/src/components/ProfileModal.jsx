import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import '../styles/ProfileModal.css';

/**
 * ProfileModal Component
 * 
 * 功能：
 * 1. 顯示用戶個人資料的模態窗口
 * 2. 允許用戶更新資料（用戶名、電子郵件）
 * 3. 允許用戶更改密碼
 * 4. 允許用戶刪除帳戶
 * 5. 對臨時用戶顯示註冊選項
 */
function ProfileModal({ isOpen, onClose, user }) {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  
  // 用戶資料
  const [profile, setProfile] = useState(null);
  // 編輯模式
  const [isEditing, setIsEditing] = useState(false);
  // 更改密碼模式
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  // 確認刪除模式
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // 加載狀態
  const [loading, setLoading] = useState(true);
  // 錯誤信息
  const [error, setError] = useState('');
  // 成功信息
  const [successMessage, setSuccessMessage] = useState('');
  
  // 表單數據
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  
  // 密碼表單數據
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // 處理點擊外部關閉模態窗口
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // 檢查用戶是否已登錄，並獲取資料
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchUserProfile = async () => {
      setLoading(true);
      setError('');
      
      try {
        // 如果是臨時用戶
        if (user.isGuest) {
          setProfile({
            username: 'Guest User',
            email: '',
            createdAt: new Date(),
            isGuest: true
          });
          setFormData({
            username: 'Guest User',
            email: '',
          });
          setLoading(false);
          return;
        }
        
        // 對於註冊用戶，獲取用戶資料
        const response = await axios.get('http://localhost:5050/api/users/profile', {
          withCredentials: true
        });
        
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
        if (error.response && error.response.status === 401) {
          setError('請先登錄以訪問您的個人資料。');
        } else {
          setError('獲取用戶資料時出錯。請稍後再試。');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [isOpen, user]);
  
  // 處理表單輸入變化
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // 處理密碼表單輸入變化
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };
  
  // 處理資料提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await axios.put('http://localhost:5050/api/users/profile', formData, {
        withCredentials: true
      });
      
      if (response.data && response.data.success) {
        setProfile(response.data.data);
        setSuccessMessage('資料已成功更新！');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error.message);
      } else {
        setError('更新資料時出錯。請稍後再試。');
      }
    }
  };
  
  // 處理密碼更改
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // 驗證新密碼和確認密碼是否匹配
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('新密碼和確認密碼不匹配。');
      return;
    }
    
    try {
      const response = await axios.put('http://localhost:5050/api/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        withCredentials: true
      });
      
      if (response.data && response.data.success) {
        setSuccessMessage('密碼已成功更新！');
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Failed to update password:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error.message);
      } else {
        setError('更新密碼時出錯。請稍後再試。');
      }
    }
  };
  
  // 處理註冊導航
  const handleRegister = () => {
    onClose();
    navigate('/register');
  };
  
  // 處理帳戶刪除
  const handleDeleteAccount = async () => {
    setError('');
    setSuccessMessage('');
    
    try {
      if (user.isGuest) {
        // 刪除臨時用戶
        const tempId = localStorage.getItem('tempId');
        if (tempId) {
          await axios.delete(`http://localhost:5050/api/temp-users/${tempId}`, {
            withCredentials: true
          });
          
          // 清除本地存儲
          localStorage.removeItem('tempId');
          
          setSuccessMessage('您的臨時帳戶已成功刪除。正在重定向到登錄頁面...');
          
          // 延遲重定向，讓用戶閱讀成功信息
          setTimeout(() => {
            onClose();
            navigate('/login');
          }, 2000);
        }
      } else {
        // 刪除註冊用戶
        const response = await axios.delete('http://localhost:5050/api/users/account', {
          withCredentials: true
        });
        
        if (response.data && response.data.success) {
          // 清除本地存儲
          localStorage.removeItem('userId');
          
          setSuccessMessage('您的帳戶已成功刪除。正在重定向到登錄頁面...');
          
          // 延遲重定向，讓用戶閱讀成功信息
          setTimeout(() => {
            onClose();
            navigate('/login');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error.message);
      } else {
        setError('刪除帳戶時出錯。請稍後再試。');
      }
      setShowDeleteConfirm(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal" ref={modalRef}>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <h1>個人資料</h1>
        
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        
        {loading ? (
          <p className="loading-text">加載中...</p>
        ) : profile && (
          <div className="profile-content">
            {!isEditing && !isChangingPassword && !showDeleteConfirm && (
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-label">用戶名：</span>
                  <span className="info-value">{profile.username}</span>
                </div>
                {!profile.isGuest && (
                  <div className="info-row">
                    <span className="info-label">電子郵件：</span>
                    <span className="info-value">{profile.email}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">註冊日期：</span>
                  <span className="info-value">{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                {!profile.isGuest && profile.lastLogin && (
                  <div className="info-row">
                    <span className="info-label">最後登錄：</span>
                    <span className="info-value">{new Date(profile.lastLogin).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="profile-actions">
                  {profile.isGuest ? (
                    <button onClick={handleRegister} className="btn register-btn">
                      註冊帳戶
                    </button>
                  ) : (
                    <>
                      <button onClick={() => setIsEditing(true)} className="btn edit-btn">
                        編輯資料
                      </button>
                      <button onClick={() => setIsChangingPassword(true)} className="btn password-btn">
                        更改密碼
                      </button>
                    </>
                  )}
                  <button onClick={() => setShowDeleteConfirm(true)} className="btn delete-btn">
                    刪除帳戶
                  </button>
                </div>
              </div>
            )}
            
            {isEditing && (
              <form onSubmit={handleSubmit} className="profile-form">
                <h2>編輯個人資料</h2>
                <div className="form-group">
                  <label htmlFor="username">用戶名</label>
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
                  <label htmlFor="email">電子郵件</label>
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
                    保存
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
                    取消
                  </button>
                </div>
              </form>
            )}
            
            {isChangingPassword && !profile.isGuest && (
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <h2>更改密碼</h2>
                <div className="form-group">
                  <label htmlFor="currentPassword">當前密碼</label>
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
                  <label htmlFor="newPassword">新密碼</label>
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
                  <label htmlFor="confirmPassword">確認新密碼</label>
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
                    更改密碼
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
                    取消
                  </button>
                </div>
              </form>
            )}
            
            {showDeleteConfirm && (
              <div className="delete-confirmation">
                <h2>確認刪除帳戶</h2>
                <p>您確定要刪除您的{profile.isGuest ? '臨時' : ''}帳戶嗎？此操作無法撤銷。</p>
                <div className="form-actions">
                  <button
                    onClick={handleDeleteAccount}
                    className="btn delete-confirm-btn"
                  >
                    確認刪除
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn cancel-btn"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileModal; 