import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, clearAuthError } from '../store/authSlice.js';
import API from '../services/api.js';
import { User, Mail, Lock, Building2, Briefcase, Phone, AlertCircle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    department: 'Engineering',
    designation: '',
    phone: '',
  });

  const [validationError, setValidationError] = useState('');

  const departments = [
    'Engineering',
    'Human Resources',
    'Marketing',
    'Sales',
    'Finance',
    'Operations',
    'Design',
    'Customer Support',
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationError) setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    try {
      dispatch(loginStart());
      const res = await API.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        designation: formData.designation || (formData.role === 'manager' ? 'Team Lead' : 'Associate Engineer'),
        phone: formData.phone,
      });

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
      dispatch(loginFailure(err.response?.data?.message || 'Registration failed'));
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4 py-sm-5 px-3">
      <div className="w-100" style={{ maxWidth: '580px' }}>
        <div className="text-center mb-4">
          <Link to="/" className="d-inline-flex align-items-center gap-2 fw-bold text-dark text-decoration-none mb-2">
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
            <span className="fs-3 tracking-tight">Staff<span className="text-primary">Sync</span></span>
          </Link>
          <p className="text-secondary small mb-0">Join your team's employee workspace</p>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-3 p-sm-4 p-md-5 bg-white">
          <h4 className="fw-bold text-dark mb-4">Create your account</h4>

          {(validationError || error) && (
            <div className="alert alert-danger small rounded-3 py-2 px-3 d-flex align-items-center gap-2 mb-3" role="alert">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="reg-name" className="form-label small fw-semibold text-secondary">
                  Full Name <span className="required-asterisk">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted" aria-hidden="true">
                    <User size={18} />
                  </span>
                  <input
                    id="reg-name"
                    type="text"
                    name="name"
                    className="form-control bg-light border-start-0"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-12">
                <label htmlFor="reg-email" className="form-label small fw-semibold text-secondary">
                  Work Email <span className="required-asterisk">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted" aria-hidden="true">
                    <Mail size={18} />
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    className="form-control bg-light border-start-0"
                    placeholder="jane@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="reg-role" className="form-label small fw-semibold text-secondary">
                  Account Role <span className="required-asterisk">*</span>
                </label>
                <select
                  id="reg-role"
                  name="role"
                  className="form-select bg-light"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Team Manager</option>
                </select>
                <div className="form-text" style={{ fontSize: '11px' }}>
                  *HR admin accounts are provisioned securely by administrators.
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="reg-dept" className="form-label small fw-semibold text-secondary">
                  Department <span className="required-asterisk">*</span>
                </label>
                <select
                  id="reg-dept"
                  name="department"
                  className="form-select bg-light"
                  value={formData.department}
                  onChange={handleChange}
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="reg-title" className="form-label small fw-semibold text-secondary">
                  Designation / Role Title
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted" aria-hidden="true">
                    <Briefcase size={18} />
                  </span>
                  <input
                    id="reg-title"
                    type="text"
                    name="designation"
                    className="form-control bg-light border-start-0"
                    placeholder="e.g. Frontend Developer"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="reg-phone" className="form-label small fw-semibold text-secondary">
                  Contact Phone
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted" aria-hidden="true">
                    <Phone size={18} />
                  </span>
                  <input
                    id="reg-phone"
                    type="tel"
                    name="phone"
                    className="form-control bg-light border-start-0"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="reg-pass" className="form-label small fw-semibold text-secondary">
                  Password <span className="required-asterisk">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted" aria-hidden="true">
                    <Lock size={18} />
                  </span>
                  <input
                    id="reg-pass"
                    type="password"
                    name="password"
                    className="form-control bg-light border-start-0"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="reg-confirm-pass" className="form-label small fw-semibold text-secondary">
                  Confirm Password <span className="required-asterisk">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted" aria-hidden="true">
                    <Lock size={18} />
                  </span>
                  <input
                    id="reg-confirm-pass"
                    type="password"
                    name="confirmPassword"
                    className="form-control bg-light border-start-0"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-sm mt-4 mb-2"
              style={{ minHeight: '44px' }}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="text-center mt-4">
          <p className="text-secondary small">
            Already have an account?{' '}
            <Link to="/login" className="text-primary fw-semibold text-decoration-none">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
