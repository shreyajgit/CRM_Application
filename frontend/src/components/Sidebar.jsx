import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUsers, FaShoppingCart, FaEnvelope, FaBullhorn } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const Sidebar = ({ isVisible, setIsVisible }) => {
  const navItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/customers', icon: <FaUsers />, label: 'Customers' },
    { path: '/orders', icon: <FaShoppingCart />, label: 'Orders' },
    { path: '/communication-logs', icon: <FaEnvelope />, label: 'Communication Logs' },
    { path: '/campaigns', icon: <FaBullhorn />, label: 'Campaigns' }
  ];

  // Add optional chaining to safely access user
  const user = useSelector(state => state?.user?.user);
  
  if (!user) return null; // Don't render sidebar if user is not logged in
  
  return (
    <>
      {/* Overlay for mobile - only visible when sidebar is open on mobile */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 xl:hidden"
          onClick={() => setIsVisible(false)}
        ></div>
      )}
      
      <div className={`bg-gray-800 text-white w-64 min-h-screen fixed md:static transition-transform duration-300 ease-in-out transform ${isVisible ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-8">CRM System</h1>
          <nav>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                        isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                      }`
                    }
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;