import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/common/Login';
import Home from './components/common/Home';
import SignUp from './components/common/SignUp';
import ForgotPassword from './components/common/ForgotPassword';
import ResetPassword from './components/common/ResetPassword';
import ProtectedRoute from './components/common/ProtectedRoute';
import AgentHome from './components/agent/AgentHome';
import HomePage from './components/user/HomePage';
import Status from './components/user/Status';
import AdminHome from './components/admin/AdminHome';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path='/' element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route
          path='/agent'
          element={
            <ProtectedRoute allowedRoles={['Agent']}>
              <AgentHome />
            </ProtectedRoute>
          }
        />
        <Route
          path='/user'
          element={
            <ProtectedRoute allowedRoles={['Ordinary']}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/status'
          element={
            <ProtectedRoute allowedRoles={['Ordinary']}>
              <Status />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminHome />
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
