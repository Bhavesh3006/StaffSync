import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, clearAuthError } from '../store/authSlice.js';
import API from '../services/api.js';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Info } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) return;

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
      dispatch(loginFailure(err.response?.data?.message || 'Invalid email or password'));
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4 py-sm-5 px-3">
      <div className="w-100" style={{ maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <Link
            to="/"
            className="d-inline-flex align-items-center gap-2 fw-bold text-dark text-decoration-none mb-2"
          >
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              }}
            >
              S
            </div>
            <span className="fs-3 tracking-tight">
              Staff<span className="text-primary">Sync</span>
            </span>
          </Link>
          <p className="text-secondary small mb-0">Sign in to access your HR workspace</p>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-3 p-sm-4 p-md-5 bg-white">
          <h4 className="fw-bold text-dark mb-4">Welcome back</h4>

          {location.search.includes('expired=true') && (
            <div
              className="alert alert-warning small rounded-3 py-2 px-3 d-flex align-items-center gap-2 mb-3"
              role="alert"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>Your session expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div
              className="alert alert-danger small rounded-3 py-2 px-3 d-flex align-items-center gap-2 mb-3"
              role="alert"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="login-email" className="form-label small fw-semibold text-secondary">
                Work Email <span className="required-asterisk">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted" aria-hidden="true">
                  <Mail size={18} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  className="form-control bg-light border-start-0"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label htmlFor="login-password" className="form-label small fw-semibold text-secondary mb-0">
                  Password <span className="required-asterisk">*</span>
                </label>
                <button
                  type="button"
                  className="btn btn-link p-0 small text-decoration-none text-muted"
                  onClick={() => setShowHelp(!showHelp)}
                  style={{ fontSize: '11px' }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted" aria-hidden="true">
                  <Lock size={18} />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control bg-light border-start-0 border-end-0"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-group-text bg-light border-start-0 text-muted"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {showHelp && (
              <div className="alert alert-info small py-2 px-3 rounded-3 mb-3 d-flex align-items-start gap-2">
                <Info size={16} className="flex-shrink-0 mt-1" />
                <div>
                  <strong>Need credentials assistance?</strong> Use one of the demo buttons below or reach out to your HR administrator to reset your credentials.
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-sm mb-3"
              style={{ minHeight: '44px' }}
            >
              {isLoading ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Autofill Section */}
          <div className="border-top pt-3 mt-2">
            <span className="small text-muted d-block mb-2 text-center" style={{ fontSize: '12px' }}>
              One-Click Demo Sign In:
            </span>
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm rounded-pill flex-fill"
                onClick={() => handleDemoFill('hr@staffsync.com', 'Password123!')}
                style={{ minHeight: '36px' }}
              >
                HR Admin
              </button>
              <button
                type="button"
                className="btn btn-outline-warning btn-sm rounded-pill flex-fill text-dark"
                onClick={() => handleDemoFill('manager@staffsync.com', 'Password123!')}
                style={{ minHeight: '36px' }}
              >
                Manager
              </button>
              <button
                type="button"
                className="btn btn-outline-info btn-sm rounded-pill flex-fill text-dark"
                onClick={() => handleDemoFill('employee@staffsync.com', 'Password123!')}
                style={{ minHeight: '36px' }}
              >
                Employee
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="text-secondary small">
            Need an employee account?{' '}
            <Link to="/register" className="text-primary fw-semibold text-decoration-none">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
