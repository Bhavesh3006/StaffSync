import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import DashboardCard from '../components/DashboardCard.jsx';
import {
  Clock,
  CalendarCheck,
  GraduationCap,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, employee } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reports/employee');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      const res = await API.post('/attendance/check-in');
      setMsg({ type: 'success', text: res.data.message });
      fetchDashboardData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Check-in failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      const res = await API.patch('/attendance/check-out');
      setMsg({ type: 'success', text: res.data.message });
      fetchDashboardData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Check-out failed' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const todayAtt = stats?.todayAttendance;
  const isCheckedIn = !!todayAtt?.checkIn;
  const isCheckedOut = !!todayAtt?.checkOut;

  const leaveBalance = stats?.leaveBalance || employee?.leaveBalance || {
    annual: { total: 15, used: 0 },
    sick: { total: 10, used: 0 },
    casual: { total: 5, used: 0 },
  };

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div
        className="rounded-4 p-3 p-sm-4 text-white shadow-sm mb-4 position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
        }}
      >
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="min-w-0">
            <div className="d-flex align-items-center gap-2 mb-1">
              <Sparkles size={18} className="text-warning flex-shrink-0" />
              <span className="text-white-50 small fw-medium">Welcome Back</span>
            </div>
            <h2 className="fw-bold mb-1 text-truncate" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
              {user?.name}
            </h2>
            <p className="text-white-50 mb-0 small text-break-word">
              {stats?.employee?.designation} • {stats?.employee?.department} Department • ID: {stats?.employee?.employeeId}
            </p>
          </div>

          {/* Quick Attendance Action Widget */}
          <div className="bg-white bg-opacity-10 rounded-4 p-3 border border-white border-opacity-10 d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-between gap-3 w-100 w-md-auto flex-shrink-0">
            <div>
              <span className="text-white-50 d-block small" style={{ fontSize: '11px' }}>
                Today's Work Status
              </span>
              <strong className="text-white small">
                {isCheckedOut
                  ? `Completed (${todayAtt?.totalWorkMinutes} mins)`
                  : isCheckedIn
                  ? `Active since ${new Date(todayAtt.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Not Checked In'}
              </strong>
            </div>

            {!isCheckedIn ? (
              <button
                className="btn btn-success fw-semibold px-4 rounded-pill shadow-sm"
                onClick={handleCheckIn}
                disabled={actionLoading}
                style={{ minHeight: '40px' }}
              >
                {actionLoading ? 'Saving...' : 'Check In'}
              </button>
            ) : !isCheckedOut ? (
              <button
                className="btn btn-warning text-dark fw-semibold px-4 rounded-pill shadow-sm"
                onClick={handleCheckOut}
                disabled={actionLoading}
                style={{ minHeight: '40px' }}
              >
                {actionLoading ? 'Saving...' : 'Check Out'}
              </button>
            ) : (
              <span className="badge bg-success-subtle text-success border border-success p-2 rounded-pill text-center">
                <CheckCircle2 size={16} className="me-1" /> Shift Finished
              </span>
            )}
          </div>
        </div>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show rounded-4`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMsg(null)} aria-label="Close"></button>
        </div>
      )}

      {/* KPI Cards: Responsive Stack (1 col phone, 2 col tablet, 3 col desktop) */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-4">
          <DashboardCard
            title="Annual Leave"
            value={`${(leaveBalance.annual?.total || 15) - (leaveBalance.annual?.used || 0)} Days`}
            subtitle={`Used: ${leaveBalance.annual?.used || 0} of ${leaveBalance.annual?.total || 15} allowance`}
            icon={CalendarCheck}
            color="primary"
            badgeText="Remaining"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DashboardCard
            title="Sick Leave"
            value={`${(leaveBalance.sick?.total || 10) - (leaveBalance.sick?.used || 0)} Days`}
            subtitle={`Used: ${leaveBalance.sick?.used || 0} of ${leaveBalance.sick?.total || 10} allowance`}
            icon={Clock}
            color="success"
            badgeText="Available"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DashboardCard
            title="Casual Leave"
            value={`${(leaveBalance.casual?.total || 5) - (leaveBalance.casual?.used || 0)} Days`}
            subtitle={`Used: ${leaveBalance.casual?.used || 0} of ${leaveBalance.casual?.total || 5} allowance`}
            icon={CalendarCheck}
            color="warning"
            badgeText="Personal"
          />
        </div>
      </div>

      {/* Main Grid: Leaves, Trainings, Announcements */}
      <div className="row g-4">
        {/* Left Col: Recent Leaves & Enrolled Trainings */}
        <div className="col-12 col-lg-8">
          {/* Leaves Table */}
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
              <h6 className="fw-bold mb-0 text-dark">Recent Leave Applications</h6>
              <Link to="/leaves" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                Apply for Leave
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light small text-secondary">
                  <tr>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentLeaves?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted small">
                        No recent leave requests
                      </td>
                    </tr>
                  ) : (
                    stats?.recentLeaves?.map((leave) => (
                      <tr key={leave._id}>
                        <td>
                          <span className="fw-semibold text-capitalize text-dark">{leave.leaveType}</span>
                        </td>
                        <td className="small text-muted text-nowrap">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </td>
                        <td className="fw-bold">{leave.daysCount}d</td>
                        <td>
                          <span
                            className={`badge rounded-pill text-capitalize ${
                              leave.status === 'approved'
                                ? 'bg-success-subtle text-success'
                                : leave.status === 'rejected'
                                ? 'bg-danger-subtle text-danger'
                                : leave.status === 'pending'
                                ? 'bg-warning-subtle text-warning-emphasis'
                                : 'bg-secondary-subtle text-secondary'
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="small text-truncate" style={{ maxWidth: '180px' }}>
                          {leave.reason}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enrolled Trainings */}
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-bottom p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
              <h6 className="fw-bold mb-0 text-dark">Enrolled Training & Upskilling</h6>
              <Link to="/trainings" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                Explore Programs
              </Link>
            </div>
            <div className="p-3">
              {stats?.activeTrainings?.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  You are not currently enrolled in any active training courses.
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.activeTrainings?.map((enr) => (
                    <div key={enr._id} className="p-3 border rounded-3 bg-light mb-3">
                      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                        <h6 className="fw-bold mb-0 text-dark">{enr.trainingId?.title}</h6>
                        <span className="badge bg-primary-subtle text-primary rounded-pill">
                          {enr.progress}% Completed
                        </span>
                      </div>
                      <p className="text-muted small mb-2">{enr.trainingId?.description}</p>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          aria-valuenow={enr.progress}
                          aria-valuemin="0"
                          aria-valuemax="100"
                          style={{ width: `${enr.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Announcements & Quick Links */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 text-dark">Company Announcements</h6>
              <Link to="/announcements" className="text-decoration-none small text-primary fw-medium">
                View all
              </Link>
            </div>
            <div className="p-3">
              {stats?.announcements?.length === 0 ? (
                <p className="text-muted small mb-0">No new announcements at this time.</p>
              ) : (
                stats?.announcements?.map((a) => (
                  <div key={a._id} className="border-bottom pb-3 mb-3 last:border-0 last:mb-0">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '10px' }}>
                        {a.category}
                      </span>
                      <span className="text-muted" style={{ fontSize: '11px' }}>
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h6 className="fw-semibold text-dark mb-1 small">{a.title}</h6>
                    <p className="text-muted small mb-0 line-clamp-2" style={{ fontSize: '12px' }}>
                      {a.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-primary text-white">
            <h6 className="fw-bold mb-2">Need HR Assistance?</h6>
            <p className="small text-white-50 mb-3">
              Have questions regarding policies, health benefits, or payroll? Reach out to HR team directly.
            </p>
            <Link to="/announcements" className="btn btn-light btn-sm rounded-pill fw-semibold text-primary">
              Read Policy Updates
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
