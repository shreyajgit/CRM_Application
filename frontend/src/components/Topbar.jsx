import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BellIcon, MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { GoogleLogin } from '@react-oauth/google';
import { setUser, clearUser } from '../slices/userSlice';
import api from '../utils/api'; // Import the axios instance

export default function Topbar({ toggleSidebar }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state?.user?.user);
  const menuRef = useRef(null);
  // Check for existing token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        dispatch(setUser(response.data.data));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post('/auth/google', {
        token: credentialResponse.credential
      });

      if (response.data.success) {
        // Save token to localStorage
        localStorage.setItem('token', response.data.token);
        
        // Set user in Redux state
        dispatch(setUser(response.data.user));
        
        // Navigate to dashboard
        navigate('/');
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(clearUser());
    navigate('/');
    api.get('/auth/logout')
      .catch(error => console.error('Logout error:', error));
  };

  return (
    <header className="w-full h-16 bg-white shadow flex items-center justify-between px-4 lg:px-8 transition-colors">
      {/* Mobile menu button - only visible on small screens */}
      <div className="flex items-center xl:hidden">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 transition"
        >
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        </button>
      </div>

      {/* Left section with logo and search */}
      <div className="hidden xl:flex items-center gap-4">
        <div className="text-2xl font-bold text-blue-700">Mini CRM</div>
        <div className="relative ml-4">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Right section with notifications and user */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <button className="relative p-2 rounded-full hover:bg-blue-100 transition">
              <BellIcon className="h-6 w-6 text-blue-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="flex items-center gap-2 focus:outline-none"
              >
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold shadow">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="hidden md:block text-gray-700 font-medium">{user.name}</span>
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Login Failed')}
              theme="filled_blue"
              text="signin_with"
              size="large"
            />
          </div>
        )}
      </div>
    </header>
  );
}