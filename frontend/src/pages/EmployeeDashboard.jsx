import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import {
  Clock,
  CalendarCheck,
  GraduationCap,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Calendar,
  Coffee,
  Briefcase,
  PlayCircle,
  Check,
  ChevronRight,
  Plane,
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, employee } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time digital clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      console.error('Failed to load employee stats:', err);
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
      <div className="d-flex flex-column justify-content-center align-items-center py-5 my-5">
        <div className="spinner-border text-primary mb-3" style={{ width: '2.5rem', height: '2.5rem' }} role="status">
          <span className="visually-hidden">Loading self-service workspace...</span>
        </div>
        <p className="text-muted small fw-medium">Loading your employee hub...</p>
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

  const activeTrainings = stats?.activeTrainings || [];
  const recentLeaves = stats?.recentLeaves || [];
  const announcements = stats?.announcements || [];

  return (
    <div className="space-y-4">
      {/* 1. Hero Banner with Live Real-time Clock & Check-in Widget */}
      <div className="dashboard-hero rounded-4 p-3 p-sm-4 text-white mb-4">
        <div className="dashboard-hero-accent pe-none" aria-hidden="true" />
        <div className="position-relative z-1 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div className="min-w-0">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge glass-widget text-white rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1.5" style={{ fontSize: '11px' }}>
                <Sparkles size={14} className="text-warning" />
                Employee Self-Service Workspace
              </span>
              <span className="text-white-50 small d-none d-sm-inline-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
                <Calendar size={13} />
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h2 className="fw-bold mb-1 text-white" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', letterSpacing: '-0.02em' }}>
              Hello, {user?.name} 👋
            </h2>
            <p className="text-white-50 mb-0 small text-break-word">
              {stats?.employee?.designation} • {stats?.employee?.department} Department • ID:{' '}
              <span className="text-white fw-semibold">{stats?.employee?.employeeId}</span>
            </p>
          </div>

          {/* Real-time Clock & Attendance Action Card */}
          <div className="glass-widget rounded-4 p-2.5 p-sm-3 d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-between gap-3 w-100 w-lg-auto-custom flex-shrink-0">
            <div className="pe-sm-2">
              <div className="d-flex align-items-center gap-1.5 mb-0.5">
                {isCheckedIn && !isCheckedOut && <span className="pulse-dot me-1" />}
                <span className="text-white-50 small" style={{ fontSize: '11px' }}>
                  {isCheckedOut
                    ? 'Shift Completed'
                    : isCheckedIn
                    ? 'Currently On Shift'
                    : 'Shift Not Started'}
                </span>
              </div>
              <div className="fw-bold text-white fs-5" style={{ letterSpacing: '0.04em' }}>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <span className="text-white-50 small d-block" style={{ fontSize: '11px' }}>
                {isCheckedIn
                  ? `In: ${new Date(todayAtt.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Ready to check-in'}
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              {!isCheckedIn ? (
                <button
                  className="btn btn-success fw-semibold px-4 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-1.5 flex-fill"
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  style={{ minHeight: '44px' }}
                >
                  <Briefcase size={16} />
                  {actionLoading ? 'Connecting...' : 'Check In'}
                </button>
              ) : !isCheckedOut ? (
                <button
                  className="btn btn-warning text-dark fw-semibold px-4 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-1.5 flex-fill"
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  style={{ minHeight: '44px' }}
                >
                  <Coffee size={16} />
                  {actionLoading ? 'Connecting...' : 'Check Out'}
                </button>
              ) : (
                <span className="badge bg-light text-success rounded-pill px-3 py-2 small fw-semibold d-flex align-items-center gap-1">
                  <CheckCircle2 size={16} /> Shift Done
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show rounded-4`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMsg(null)} aria-label="Close" />
        </div>
      )}

      {/* 2. Leave Quota Balances (3 Cards) */}
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <Plane size={18} className="text-primary" />
            My Annual Leave Allowances
          </h6>
          <Link to="/leaves" className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium">
            Request Leave
          </Link>
        </div>

        <div className="row g-3 mb-4">
          {/* Annual Leave */}
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 p-sm-4 bg-white leave-balance-card h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small fw-semibold text-secondary text-uppercase ls-wide" style={{ fontSize: '11px' }}>
                  Annual Vacation
                </span>
                <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 small fw-semibold" style={{ fontSize: '11px' }}>
                  {leaveBalance.annual.total - leaveBalance.annual.used} Days Left
                </span>
              </div>
              <h3 className="fw-bold text-dark mb-1">
                {leaveBalance.annual.used}{' '}
                <span className="text-muted fs-6 fw-normal">/ {leaveBalance.annual.total} used</span>
              </h3>
              <div className="progress rounded-pill mt-2" style={{ height: '6px' }}>
                <div
                  className="progress-bar rounded-pill bg-primary"
                  role="progressbar"
                  style={{ width: `${(leaveBalance.annual.used / (leaveBalance.annual.total || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sick Leave */}
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 p-sm-4 bg-white leave-balance-card h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small fw-semibold text-secondary text-uppercase ls-wide" style={{ fontSize: '11px' }}>
                  Medical & Sick Leave
                </span>
                <span className="badge bg-success-subtle text-success rounded-pill px-2.5 py-1 small fw-semibold" style={{ fontSize: '11px' }}>
                  {leaveBalance.sick.total - leaveBalance.sick.used} Days Left
                </span>
              </div>
              <h3 className="fw-bold text-dark mb-1">
                {leaveBalance.sick.used}{' '}
                <span className="text-muted fs-6 fw-normal">/ {leaveBalance.sick.total} used</span>
              </h3>
              <div className="progress rounded-pill mt-2" style={{ height: '6px' }}>
                <div
                  className="progress-bar rounded-pill bg-success"
                  role="progressbar"
                  style={{ width: `${(leaveBalance.sick.used / (leaveBalance.sick.total || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Casual Leave */}
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 p-sm-4 bg-white leave-balance-card h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small fw-semibold text-secondary text-uppercase ls-wide" style={{ fontSize: '11px' }}>
                  Casual & Emergency
                </span>
                <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2.5 py-1 small fw-semibold" style={{ fontSize: '11px' }}>
                  {leaveBalance.casual.total - leaveBalance.casual.used} Days Left
                </span>
              </div>
              <h3 className="fw-bold text-dark mb-1">
                {leaveBalance.casual.used}{' '}
                <span className="text-muted fs-6 fw-normal">/ {leaveBalance.casual.total} used</span>
              </h3>
              <div className="progress rounded-pill mt-2" style={{ height: '6px' }}>
                <div
                  className="progress-bar rounded-pill bg-warning"
                  role="progressbar"
                  style={{ width: `${(leaveBalance.casual.used / (leaveBalance.casual.total || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Two Columns: Active Trainings & Recent Leave Applications */}
      <div className="row g-4 mb-4">
        {/* Active Enrolled Trainings */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom p-3 p-sm-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <GraduationCap size={18} className="text-info flex-shrink-0" />
                  My Training & Skill Paths ({activeTrainings.length})
                </h6>
                <span className="text-muted small" style={{ fontSize: '11px' }}>
                  Courses currently assigned or in progress
                </span>
              </div>
              <Link to="/trainings" className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium">
                Browse Courses
              </Link>
            </div>
            <div className="card-body p-3 p-sm-4">
              {activeTrainings.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No active courses assigned right now. Browse available training catalogs to upskill!
                </div>
              ) : (
                <div className="space-y-3">
                  {activeTrainings.map((t) => (
                    <div
                      key={t._id}
                      className="p-3 rounded-4 border border-light-subtle bg-light bg-opacity-50 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-2 hover-card"
                    >
                      <div className="min-w-0">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-info-subtle text-info-emphasis rounded-pill px-2.5 py-0.5" style={{ fontSize: '10px' }}>
                            {t.trainingId?.category || 'Professional Development'}
                          </span>
                          <span className="badge bg-white text-muted border rounded-pill px-2 py-0.5" style={{ fontSize: '10px' }}>
                            {t.status}
                          </span>
                        </div>
                        <h6 className="fw-bold text-dark mb-0 small text-truncate">
                          {t.trainingId?.title || 'Training Program'}
                        </h6>
                        <span className="text-muted small" style={{ fontSize: '11px' }}>
                          Instructor: {t.trainingId?.instructor || 'StaffSync Academy'}
                        </span>
                      </div>
                      <Link
                        to="/trainings"
                        className="btn btn-sm btn-primary rounded-pill px-3 d-flex align-items-center gap-1 flex-shrink-0"
                      >
                        <PlayCircle size={14} /> Resume
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Leave Requests History */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom p-3 p-sm-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <CalendarCheck size={18} className="text-warning flex-shrink-0" />
                  My Recent Leave Applications
                </h6>
                <span className="text-muted small" style={{ fontSize: '11px' }}>
                  Track approval status from HR & your manager
                </span>
              </div>
              <Link to="/leaves" className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium">
                New Application
              </Link>
            </div>
            <div className="card-body p-3 p-sm-4">
              {recentLeaves.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No recent leave requests filed. You have full balance available!
                </div>
              ) : (
                <div className="space-y-2">
                  {recentLeaves.map((l) => {
                    const statusColors = {
                      approved: 'bg-success-subtle text-success',
                      pending: 'bg-warning-subtle text-warning-emphasis',
                      rejected: 'bg-danger-subtle text-danger',
                    };
                    return (
                      <div
                        key={l._id}
                        className="p-3 rounded-4 border border-light-subtle bg-light bg-opacity-50 d-flex justify-content-between align-items-center gap-2 mb-2 hover-card"
                      >
                        <div className="min-w-0">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="fw-bold text-dark small text-capitalize">{l.leaveType} Leave</span>
                            <span className="badge bg-white text-dark border rounded-pill px-2 py-0.5" style={{ fontSize: '10px' }}>
                              {l.daysCount} Day(s)
                            </span>
                          </div>
                          <span className="text-muted small d-block" style={{ fontSize: '11px' }}>
                            {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`badge rounded-pill px-3 py-1.5 fw-semibold text-uppercase ${statusColors[l.status] || 'bg-light text-muted'}`} style={{ fontSize: '11px' }}>
                          {l.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Company Announcements */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-bottom p-3 p-sm-4 d-flex justify-content-between align-items-center">
          <div>
            <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <Megaphone size={18} className="text-danger flex-shrink-0" />
              Company Bulletin & Announcements
            </h6>
            <span className="text-muted small" style={{ fontSize: '11px' }}>
              Official news and notices from leadership
            </span>
          </div>
          <Link to="/announcements" className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium">
            All Bulletins
          </Link>
        </div>
        <div className="card-body p-3 p-sm-4">
          {announcements.length === 0 ? (
            <div className="text-center py-4 text-muted small">No bulletins posted at this time.</div>
          ) : (
            <div className="row g-3">
              {announcements.map((a) => (
                <div key={a._id} className="col-12 col-md-6">
                  <div className="border border-light-subtle rounded-4 p-3 bg-light bg-opacity-50 h-100 hover-card d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-0.5" style={{ fontSize: '10px' }}>
                          {a.category}
                        </span>
                        <span className="text-muted small" style={{ fontSize: '11px' }}>
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h6 className="fw-bold text-dark mb-1 small text-truncate">{a.title}</h6>
                      <p className="text-secondary small mb-2 line-clamp-2 text-break-word" style={{ fontSize: '12px' }}>
                        {a.content}
                      </p>
                    </div>
                    <div className="pt-2 border-top border-light d-flex justify-content-end">
                      <Link to="/announcements" className="small text-primary text-decoration-none fw-medium d-flex align-items-center gap-1">
                        Read Notice <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
