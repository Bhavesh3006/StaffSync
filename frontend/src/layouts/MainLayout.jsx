import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { ChevronRight, Home } from 'lucide-react';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Generate breadcrumb title from path
  const getPageTitle = (path) => {
    const cleanPath = path.replace('/', '');
    switch (cleanPath) {
      case 'dashboard':
        return 'Dashboard';
      case 'employees':
        return 'Employee Directory';
      case 'attendance':
        return 'Attendance Management';
      case 'leaves':
        return 'Leave Management';
      case 'announcements':
        return 'Company Announcements';
      case 'trainings':
        return 'Training & Skills';
      case 'profile':
        return 'My Profile';
      default:
        return 'Workspace';
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />

      <main className="flex-grow-1 main-content-wrapper p-2 p-sm-3 p-md-4">
        <div className="content-container">
          {/* Breadcrumb Bar */}
          <nav aria-label="breadcrumb" className="mb-3 d-none d-sm-block">
            <ol className="breadcrumb mb-0 small text-muted">
              <li className="breadcrumb-item">
                <Link to="/dashboard" className="text-secondary text-decoration-none d-flex align-items-center gap-1">
                  <Home size={14} /> Home
                </Link>
              </li>
              {location.pathname !== '/dashboard' && (
                <li className="breadcrumb-item active text-dark fw-medium" aria-current="page">
                  {pageTitle}
                </li>
              )}
            </ol>
          </nav>

          <Outlet />
        </div>
      </main>

      <footer className="footer-wrapper py-3 px-3 px-md-4 border-top bg-white text-muted small">
        <div className="content-container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 text-center text-sm-start">
          <span>© {new Date().getFullYear()} StaffSync Human Resource Management System. All rights reserved.</span>
          <span className="text-muted" style={{ fontSize: '11px' }}>
            Enterprise Role-Based Access Control (RBAC)
          </span>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
