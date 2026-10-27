import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserData } from '../store/authSlice.js';
import API from '../services/api.js';
import {
  User,
  Mail,
  Building,
  Briefcase,
  Calendar,
  Phone,
  MapPin,
  Lock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, employee } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: employee?.phone || '',
    address: {
      street: employee?.address?.street || '',
      city: employee?.address?.city || '',
      state: employee?.address?.state || '',
      zip: employee?.address?.zip || '',
      country: employee?.address?.country || '',
    },
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMsg, setProfileMsg] = useState(null);
  const [passMsg, setPassMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await API.put('/auth/profile', profileData);
      if (res.data.success) {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        dispatch(updateUserData({ user: res.data.user, employee: res.data.employee }));
      }
    } catch (err) {
      setProfileMsg({ type: 'danger', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      setPassMsg({ type: 'danger', text: 'New passwords do not match' });
      return;
    }
    if (passData.newPassword.length < 6) {
      setPassMsg({ type: 'danger', text: 'New password must be at least 6 characters' });
      return;
    }

    try {
      setLoading(true);
      const res = await API.put('/auth/password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      if (res.data.success) {
        setPassMsg({ type: 'success', text: 'Password changed successfully!' });
        setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPassMsg({ type: 'danger', text: err.response?.data?.message || 'Password update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
          My Employee Profile
        </h2>
        <p className="text-secondary small mb-0">
          Manage your personal contact details, residential address, and account credentials
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: Employment Identity Card */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white mb-4">
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3 shadow flex-shrink-0"
              style={{ width: '80px', height: '80px', fontSize: '32px' }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <h5 className="fw-bold text-dark mb-1 text-truncate">{user?.name}</h5>
            <p className="text-muted small mb-2 text-truncate">{user?.email}</p>

            <span className="badge bg-primary-subtle text-primary text-uppercase px-3 py-1 rounded-pill small fw-semibold mx-auto mb-3">
              {user?.role === 'hr' ? 'HR Administrator' : user?.role}
            </span>

            <div className="border-top pt-3 text-start space-y-2 small">
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Employee ID:</span>
                <code className="text-primary fw-semibold">{employee?.employeeId || 'N/A'}</code>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Department:</span>
                <span className="fw-medium text-dark">{employee?.department || 'N/A'}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Designation:</span>
                <span className="fw-medium text-dark">{employee?.designation || 'N/A'}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Reporting Manager:</span>
                <span className="fw-medium text-dark text-truncate" style={{ maxWidth: '140px' }}>
                  {employee?.managerId?.name || 'Executive Staff'}
                </span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Joining Date:</span>
                <span className="fw-medium text-dark">
                  {employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile & Password */}
        <div className="col-12 col-lg-8">
          {/* Personal Info Form */}
          <div className="card border-0 shadow-sm rounded-4 p-3 p-sm-4 bg-white mb-4">
            <h5 className="fw-bold text-dark mb-3">Contact & Address Details</h5>

            {profileMsg && (
              <div className={`alert alert-${profileMsg.type} small py-2 px-3 rounded-3`} role="alert">
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">
                    Full Name <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold text-secondary">Contact Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileData.address.street}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: { ...profileData.address, street: e.target.value },
                      })
                    }
                    placeholder="123 Main Street, Suite 400"
                  />
                </div>
                <div className="col-12 col-sm-4">
                  <label className="form-label small fw-semibold text-secondary">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileData.address.city}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: { ...profileData.address, city: e.target.value },
                      })
                    }
                    placeholder="San Francisco"
                  />
                </div>
                <div className="col-12 col-sm-4">
                  <label className="form-label small fw-semibold text-secondary">State / Province</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileData.address.state}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: { ...profileData.address, state: e.target.value },
                      })
                    }
                    placeholder="CA"
                  />
                </div>
                <div className="col-12 col-sm-4">
                  <label className="form-label small fw-semibold text-secondary">Postal Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileData.address.zip}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        address: { ...profileData.address, zip: e.target.value },
                      })
                    }
                    placeholder="94105"
                  />
                </div>
              </div>

              <div className="mt-4 text-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary rounded-pill px-4 w-100 w-sm-auto shadow-sm"
                  style={{ minHeight: '44px' }}
                >
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="card border-0 shadow-sm rounded-4 p-3 p-sm-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">Security & Password</h5>

            {passMsg && (
              <div className={`alert alert-${passMsg.type} small py-2 px-3 rounded-3`} role="alert">
                {passMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-secondary">
                    Current Password <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={passData.currentPassword}
                    onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-secondary">
                    New Password <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={passData.newPassword}
                    onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-secondary">
                    Confirm New Password <span className="required-asterisk">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={passData.confirmPassword}
                    onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4 text-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-outline-dark rounded-pill px-4 w-100 w-sm-auto"
                  style={{ minHeight: '44px' }}
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
