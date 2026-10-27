import React from 'react';
import { useSelector } from 'react-redux';
import HRDashboard from './HRDashboard.jsx';
import ManagerDashboard from './ManagerDashboard.jsx';
import EmployeeDashboard from './EmployeeDashboard.jsx';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  if (user?.role === 'hr') {
    return <HRDashboard />;
  }

  if (user?.role === 'manager') {
    return <ManagerDashboard />;
  }

  return <EmployeeDashboard />;
};

export default Dashboard;

