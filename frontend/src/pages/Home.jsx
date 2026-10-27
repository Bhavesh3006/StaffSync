import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Users,
  Clock,
  CalendarCheck,
  Megaphone,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice.js';
import API from '../services/api.js';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleQuickLogin = async (email, password) => {
    try {
      dispatch(loginStart());
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        dispatch(
          loginSuccess({
            token: res.data.token,
            user: res.data.user,
            employee: res.data.employee,
          })
        );
        navigate('/dashboard');
      }
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
      navigate('/login');
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-white">
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg bg-white border-bottom py-3 px-4 sticky-top">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-dark m-0">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{
                width: '38px',
                height: '38px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              }}
            >
              S
            </div>
            <span className="fs-4 tracking-tight">Staff<span className="text-primary">Sync</span></span>
          </Link>

          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary rounded-pill px-4 fw-medium">
                Go to Dashboard <ArrowRight size={16} className="ms-1" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-secondary rounded-pill px-4 fw-medium">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary rounded-pill px-4 fw-medium">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-5 bg-light border-bottom">
        <div className="container py-lg-4 text-center">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 fw-semibold mb-3">
            Enterprise Human Resource Management System
          </span>
          <h1 className="display-4 fw-extrabold text-dark tracking-tight mb-3">
            Streamline Workforce Operations with <span className="text-primary">StaffSync</span>
          </h1>
          <p className="lead text-secondary mx-auto mb-4" style={{ maxWidth: '720px' }}>
            A unified MERN stack HRMS designed for modern organizations. Complete role-based dashboards for HR Directors, Team Managers, and Employees.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
            <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn btn-primary btn-lg rounded-pill px-5 shadow-sm">
              {isAuthenticated ? 'Open Dashboard' : 'Get Started Now'}
            </Link>
            <a href="#demo-accounts" className="btn btn-outline-dark btn-lg rounded-pill px-4">
              Explore Demo Roles
            </a>
          </div>

          {/* Quick Demo Access Bar */}
          <div id="demo-accounts" className="card border-0 shadow rounded-4 p-4 mx-auto text-start bg-white" style={{ maxWidth: '880px' }}>
            <h5 className="fw-bold mb-1 text-dark">One-Click Demo Instant Login</h5>
            <p className="text-muted small mb-3">
              Test each role's dashboard, permissions, and specialized workflows instantly:
            </p>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="border rounded-4 p-3 h-100 bg-light d-flex flex-column justify-content-between">
                  <div>
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle mb-2">
                      HR Administrator
                    </span>
                    <h6 className="fw-bold mb-1">Sarah Jenkins</h6>
                    <p className="small text-muted mb-2">hr@staffsync.com</p>
                    <ul className="small text-secondary ps-3 mb-3" style={{ fontSize: '12px' }}>
                      <li>Full employee CRUD</li>
                      <li>Org attendance & analytics</li>
                      <li>Publish announcements</li>
                    </ul>
                  </div>
                  <button
                    className="btn btn-danger btn-sm rounded-pill w-100 fw-medium"
                    onClick={() => handleQuickLogin('hr@staffsync.com', 'Password123!')}
                  >
                    Log In as HR Admin
                  </button>
                </div>
              </div>

              <div className="col-md-4">
                <div className="border rounded-4 p-3 h-100 bg-light d-flex flex-column justify-content-between">
                  <div>
                    <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle mb-2">
                      Team Manager
                    </span>
                    <h6 className="fw-bold mb-1">Michael Chang</h6>
                    <p className="small text-muted mb-2">manager@staffsync.com</p>
                    <ul className="small text-secondary ps-3 mb-3" style={{ fontSize: '12px' }}>
                      <li>Review team leave requests</li>
                      <li>Monitor team attendance</li>
                      <li>Assign skill trainings</li>
                    </ul>
                  </div>
                  <button
                    className="btn btn-warning btn-sm rounded-pill w-100 fw-medium"
                    onClick={() => handleQuickLogin('manager@staffsync.com', 'Password123!')}
                  >
                    Log In as Manager
                  </button>
                </div>
              </div>

              <div className="col-md-4">
                <div className="border rounded-4 p-3 h-100 bg-light d-flex flex-column justify-content-between">
                  <div>
                    <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle mb-2">
                      Employee
                    </span>
                    <h6 className="fw-bold mb-1">Alex Rivera</h6>
                    <p className="small text-muted mb-2">employee@staffsync.com</p>
                    <ul className="small text-secondary ps-3 mb-3" style={{ fontSize: '12px' }}>
                      <li>Clock-in & Clock-out</li>
                      <li>Apply for leave & check balance</li>
                      <li>Enroll in trainings</li>
                    </ul>
                  </div>
                  <button
                    className="btn btn-info btn-sm rounded-pill w-100 fw-medium text-white"
                    onClick={() => handleQuickLogin('employee@staffsync.com', 'Password123!')}
                  >
                    Log In as Employee
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fw-semibold mb-2">
              Comprehensive Modules
            </span>
            <h2 className="fw-bold text-dark">Engineered for Every Stage of the Employee Lifecycle</h2>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
                <div className="rounded-3 bg-primary-subtle text-primary d-inline-flex p-3 mb-3" style={{ width: 'fit-content' }}>
                  <Clock size={28} />
                </div>
                <h5 className="fw-bold mb-2">Attendance & Time Tracking</h5>
                <p className="text-secondary small mb-0">
                  Daily check-in and check-out with automatic work hours computation, late arrival detection, and monthly attendance summaries.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
                <div className="rounded-3 bg-success-subtle text-success d-inline-flex p-3 mb-3" style={{ width: 'fit-content' }}>
                  <CalendarCheck size={28} />
                </div>
                <h5 className="fw-bold mb-2">Leave Management Workflow</h5>
                <p className="text-secondary small mb-0">
                  Multi-tier approvals with balance checks across annual, sick, and casual leave. Overlap verification and instant in-app alerts.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
                <div className="rounded-3 bg-warning-subtle text-warning-emphasis d-inline-flex p-3 mb-3" style={{ width: 'fit-content' }}>
                  <Users size={28} />
                </div>
                <h5 className="fw-bold mb-2">Employee Directory & Profiles</h5>
                <p className="text-secondary small mb-0">
                  Centralized records with departments, designations, manager hierarchies, salary records, contact details, and status audits.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
                <div className="rounded-3 bg-info-subtle text-info-emphasis d-inline-flex p-3 mb-3" style={{ width: 'fit-content' }}>
                  <Megaphone size={28} />
                </div>
                <h5 className="fw-bold mb-2">Targeted Announcements</h5>
                <p className="text-secondary small mb-0">
                  Broadcast company news, statutory holiday updates, and policy notifications filtered by target audience and category.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
                <div className="rounded-3 bg-purple-subtle text-purple d-inline-flex p-3 mb-3" style={{ width: 'fit-content', backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
                  <GraduationCap size={28} />
                </div>
                <h5 className="fw-bold mb-2">Training & Development</h5>
                <p className="text-secondary small mb-0">
                  Course catalog, enrollment capacity limits, manager assignments, and employee progress tracking toward completion.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 p-4">
                <div className="rounded-3 bg-danger-subtle text-danger d-inline-flex p-3 mb-3" style={{ width: 'fit-content' }}>
                  <ShieldCheck size={28} />
                </div>
                <h5 className="fw-bold mb-2">Role-Based Access Control</h5>
                <p className="text-secondary small mb-0">
                  Strict backend JWT authorization and route guards ensuring HR, managers, and employees access only permitted resources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-top py-4 bg-white text-center text-muted small">
        <div className="container">
          <p className="mb-0">StaffSync HRMS • MERN Stack Solution • Designed for production reliability</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

