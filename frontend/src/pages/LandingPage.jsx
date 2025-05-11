import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../slices/userSlice';
import api from '../utils/api'; 

export default function LandingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left side - Hero content */}
        <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4">
            Welcome to Mini CRM
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            The all-in-one platform for customer relationship management,
            segmentation, and personalized campaign delivery.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span className="ml-3 text-gray-700">Smart customer segmentation</span>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span className="ml-3 text-gray-700">AI-powered campaign optimization</span>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <span className="ml-3 text-gray-700">Intuitive analytics dashboard</span>
            </div>
          </div>
        </div>
        
        {/* Right side - Login */}
        <div className="md:w-2/5 bg-gradient-to-br from-blue-600 to-blue-800 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-8">Get Started</h2>
            
            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Login Failed')}
                theme="filled_blue"
                text="signin_with"
                size="large"
                shape="pill"
              />
            </div>
            
            <p className="text-blue-200 text-sm">
              By logging in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}