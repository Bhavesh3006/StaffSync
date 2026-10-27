import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Route Protection
import MainLayout from './layouts/MainLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Employees from './pages/Employees.jsx';
import Attendance from './pages/Attendance.jsx';
import Leaves from './pages/Leaves.jsx';
import Announcements from './pages/Announcements.jsx';
import Trainings from './pages/Trainings.jsx';
import Profile from './pages/Profile.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated Routes with MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leaves" element={<Leaves />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/trainings" element={<Trainings />} />
            <Route path="/profile" element={<Profile />} />

            {/* Manager and HR only */}
            <Route element={<ProtectedRoute allowedRoles={['manager', 'hr']} />}>
              <Route path="/employees" element={<Employees />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

