import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import DashboardCard from '../components/DashboardCard.jsx';
import {
  Users,
  Clock,
  CalendarCheck,
  GraduationCap,
  Megaphone,
  UserPlus,
  Building,
} from 'lucide-react';

const HRDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHRStats();
  }, []);

  const fetchHRStats = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reports/hr');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading workforce intelligence...</span>
        </div>
      </div>
    );
  }

  const att = stats?.attendanceToday || {};
  const depts = stats?.departmentDistribution || [];

  return (
    <div className="space-y-4">
      {/* Header with Quick Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-1 fw-semibold">
              HR Administration Console
            </span>
          </div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            Workforce Intelligence & Metrics
          </h2>
          <p className="text-secondary small mb-0">
            Real-time human capital analytics, staffing levels, and organizational operations
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2 w-100 w-md-auto">
          <Link
            to="/employees"
            className="btn btn-primary rounded-pill px-3 fw-medium d-flex align-items-center justify-content-center gap-1 shadow-sm flex-fill flex-sm-grow-0"
          >
            <UserPlus size={16} /> Add Employee
          </Link>
          <Link
            to="/announcements"
            className="btn btn-outline-secondary rounded-pill px-3 fw-medium d-flex align-items-center justify-content-center gap-1 flex-fill flex-sm-grow-0"
          >
            <Megaphone size={16} /> Broadcast Notice
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards: Responsive (1 col phone, 2 col tablet, 4 col desktop) */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <DashboardCard
            title="Total Active Staff"
            value={stats?.activeEmployees || 0}
            subtitle={`${stats?.totalEmployees || 0} total headcount registered`}
            icon={Users}
            color="primary"
            badgeText="Active"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <DashboardCard
            title="Attendance Today"
            value={`${att.attendanceRate || 0}%`}
            subtitle={`${att.present || 0} present • ${att.late || 0} late arrivals`}
            icon={Clock}
            color="success"
            badgeText={`${att.present || 0} Clocked-in`}
            badgeBg="bg-success-subtle text-success"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <DashboardCard
            title="Pending Leaves"
            value={stats?.pendingLeaves || 0}
            subtitle="Require administrative review"
            icon={CalendarCheck}
            color="warning"
            badgeText={stats?.pendingLeaves > 0 ? 'Review Needed' : 'Clear'}
            badgeBg={stats?.pendingLeaves > 0 ? 'bg-warning-subtle text-warning-emphasis' : 'bg-light text-muted'}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <DashboardCard
            title="Training Programs"
            value={stats?.training?.totalTrainings || 0}
            subtitle={`${stats?.training?.activeEnrollments || 0} active enrollments`}
            icon={GraduationCap}
            color="info"
          />
        </div>
      </div>

      {/* Row 2: Department Distribution & Attendance Breakdown */}
      <div className="row g-4 mb-4">
        {/* Department Distribution */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <Building size={18} className="text-primary flex-shrink-0" /> Headcount by Department
              </h6>
              <Link to="/employees" className="small text-primary text-decoration-none fw-medium">
                Directory
              </Link>
            </div>
            <div className="p-3 p-sm-4">
              {depts.length === 0 ? (
                <div className="text-center py-4 text-muted small">No department data available</div>
              ) : (
                <div className="space-y-3">
                  {depts.map((d) => {
                    const total = stats?.activeEmployees || 1;
                    const pct = Math.round((d.count / total) * 100);
                    return (
                      <div key={d.department} className="mb-3">
                        <div className="d-flex justify-content-between small fw-medium mb-1">
                          <span className="text-dark">{d.department}</span>
                          <span className="text-muted">
                            {d.count} ({pct}%)
                          </span>
                        </div>
                        <div className="progress rounded-pill" style={{ height: '8px' }}>
                          <div
                            className="progress-bar rounded-pill"
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin="0"
                            aria-valuemax="100"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: '#4f46e5',
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Attendance Overview */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <Clock size={18} className="text-success flex-shrink-0" /> Today's Attendance Roster
              </h6>
              <Link to="/attendance" className="small text-primary text-decoration-none fw-medium">
                Full Log
              </Link>
            </div>
            <div className="p-3 p-sm-4">
              <div className="row g-2 g-sm-3 text-center mb-4">
                <div className="col-6 col-sm-3">
                  <div className="p-2 p-sm-3 rounded-4 bg-success-subtle text-success">
                    <h3 className="fw-bold mb-0" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>{att.present || 0}</h3>
                    <span className="small fw-semibold" style={{ fontSize: '11px' }}>Present</span>
                  </div>
                </div>
                <div className="col-6 col-sm-3">
                  <div className="p-2 p-sm-3 rounded-4 bg-warning-subtle text-warning-emphasis">
                    <h3 className="fw-bold mb-0" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>{att.late || 0}</h3>
                    <span className="small fw-semibold" style={{ fontSize: '11px' }}>Late</span>
                  </div>
                </div>
                <div className="col-6 col-sm-3">
                  <div className="p-2 p-sm-3 rounded-4 bg-danger-subtle text-danger">
                    <h3 className="fw-bold mb-0" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>{att.absent || 0}</h3>
                    <span className="small fw-semibold" style={{ fontSize: '11px' }}>Absent</span>
                  </div>
                </div>
                <div className="col-6 col-sm-3">
                  <div className="p-2 p-sm-3 rounded-4 bg-info-subtle text-info-emphasis">
                    <h3 className="fw-bold mb-0" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>{att.halfDay || 0}</h3>
                    <span className="small fw-semibold" style={{ fontSize: '11px' }}>Half-Day</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-light rounded-4 border">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold text-dark small">Daily Compliance Rate</span>
                  <span className="fw-bold text-success small">{att.attendanceRate || 0}%</span>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    aria-valuenow={att.attendanceRate || 0}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    style={{ width: `${att.attendanceRate || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Broadcast Card */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-bottom p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h6 className="fw-bold mb-0 text-dark">Active Company Announcements</h6>
          <Link to="/announcements" className="btn btn-sm btn-outline-primary rounded-pill px-3">
            Publish New Announcement
          </Link>
        </div>
        <div className="p-3">
          {stats?.recentAnnouncements?.length === 0 ? (
            <p className="text-muted small mb-0">No active announcements.</p>
          ) : (
            <div className="row g-3">
              {stats?.recentAnnouncements?.map((a) => (
                <div key={a._id} className="col-12 col-md-6 col-lg-4">
                  <div className="border rounded-4 p-3 bg-light h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-primary-subtle text-primary" style={{ fontSize: '11px' }}>
                          {a.category}
                        </span>
                        <span className="text-muted" style={{ fontSize: '11px' }}>
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h6 className="fw-bold text-dark mb-1 small">{a.title}</h6>
                      <p className="text-secondary small mb-2 line-clamp-3 text-break-word" style={{ fontSize: '12px' }}>
                        {a.content}
                      </p>
                    </div>
                    <span className="text-muted small" style={{ fontSize: '11px' }}>
                      Audience: <strong className="text-capitalize">{a.targetAudience}</strong>
                    </span>
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

export default HRDashboard;
