// Authentication utilities
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Check if token is expired by parsing the JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp < currentTime) {
      // Token is expired, remove it
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      return false;
    }
    
    return true;
  } catch (error) {
    // Invalid token format
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    return false;
  }
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  } : {
    'Content-Type': 'application/json'
  };
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
};

export const getUserId = () => {
  return localStorage.getItem('userId');
};