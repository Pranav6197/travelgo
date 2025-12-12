import axiosInstance from '@/helpers/axios-instance';
import userState from '@/utils/user-state';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useAuthData = () => {
  const location = useLocation();
  const [data, setData] = useState({
    _id: '',
    role: '',
    token: '',
    loading: true,
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        // Call the general check endpoint which relies on the cookie
        const res = await axiosInstance.get('/api/auth/check');
        const { user, token } = res.data;

        if (user && user._id) {
          // Update local state
          setData({
            _id: user._id,
            role: user.role,
            token: token,
            loading: false,
          });
          // Ensure userState is synced
          userState.setUser({ _id: user._id, role: user.role });
        } else {
          throw new Error("No user data");
        }

      } catch (error) {
        // If check fails, clear state
        setData({
          _id: '',
          role: '',
          token: '',
          loading: false,
        });
        // Only remove user if we are sure the session is invalid
        // userState.removeUser(); 
      }
    }
    checkAuth();
  }, [location.pathname]); // Re-run on route change

  return data;
};

export default useAuthData;
