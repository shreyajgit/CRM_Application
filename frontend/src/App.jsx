import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Layout Components
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

// Page Components
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import AITools from "./pages/AITools";

// Customer Components
import CustomerDashboard from "./components/CustomerDashboard";
import CustomerDetail from "./pages/CustomerDetail";
import CustomerForm from "./pages/CustomerForm";

// Campaign Components
import CampaignList from "./pages/CampaignList";
import CampaignForm from "./components/CampaignForm";
import CampaignDetail from "./components/CampaignDetail";

// Order Components
import OrderList from "./pages/OrderList";
import OrderDetail from "./pages/OrderDetail";

import "./index.css";

// Protected route wrapper component
const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state?.user?.user);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout wrapper with sidebar and topbar
const DashboardLayout = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isVisible={sidebarVisible} setIsVisible={setSidebarVisible} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar toggleSidebar={() => setSidebarVisible(!sidebarVisible)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  const user = useSelector((state) => state?.user?.user);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Routes>
          {/* Public landing page - Redirect to dashboard if already logged in */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
          />

          {/* Dashboard Layout with nested routes */}
          <Route element={<DashboardLayout />}>
            {/* Main Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Customer Routes */}
            <Route path="/customers">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute>
                    <CustomerDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="new"
                element={
                  <ProtectedRoute>
                    <CustomerForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="edit/:id"
                element={
                  <ProtectedRoute>
                    <CustomerForm />
                  </ProtectedRoute>
                }
              />
            </Route>
            
            {/* Campaign Routes */}
            <Route path="/campaigns">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <CampaignList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="create"
                element={
                  <ProtectedRoute>
                    <CampaignForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="edit/:id"
                element={
                  <ProtectedRoute>
                    <CampaignForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute>
                    <CampaignDetail />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Order Routes */}
            <Route path="/orders">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <OrderList />
                  </ProtectedRoute>
                }
              />
              <Route
                path=":id"
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* AI Tools Route */}
            <Route
              path="/ai-tools"
              element={
                <ProtectedRoute>
                  <AITools />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all redirect for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;