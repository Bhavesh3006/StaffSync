import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../services/api.js';
import DashboardCard from '../components/DashboardCard.jsx';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Users,
  Clock,
  CalendarCheck,
  GraduationCap,
  Megaphone,
  UserPlus,
  Building,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  FileCheck2,
} from 'lucide-react';

// Register ChartJS modules
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const HRDashboard = () => {
  const { user } = useSelector((state) => state.auth);
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
      console.error('Failed to load HR stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center py-5 my-5">
        <div className="spinner-border text-primary mb-3" style={{ width: '2.5rem', height: '2.5rem' }} role="status">
          <span className="visually-hidden">Loading workforce intelligence...</span>
        </div>
        <p className="text-muted small fw-medium">Assembling real-time HR intelligence...</p>
      </div>
    );
  }

  const att = stats?.attendanceToday || {};
  const depts = stats?.departmentDistribution || [];

  // Chart 1: Department Distribution (Doughnut)
  const deptPalette = ['#4f46e5', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'];
  const deptChartData = {
    labels: depts.map((d) => d.department || 'Other'),
    datasets: [
      {
        data: depts.map((d) => d.count),
        backgroundColor: deptPalette.slice(0, Math.max(depts.length, 1)),
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 12,
          font: { size: 11, family: "'Inter', sans-serif" },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = depts.reduce((acc, curr) => acc + curr.count, 0) || 1;
            const pct = Math.round((value / total) * 100);
            return ` ${label}: ${value} (${pct}%)`;
          },
        },
      },
    },
    cutout: '70%',
  };

  // Chart 2: Today Attendance Bar
  const attChartData = {
    labels: ['Present', 'Late', 'Half-Day', 'Absent'],
    datasets: [
      {
        label: 'Staff Count',
        data: [att.present || 0, att.late || 0, att.halfDay || 0, att.absent || 0],
        backgroundColor: ['#10b981', '#f59e0b', '#06b6d4', '#ef4444'],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 11 } },
        grid: { color: '#f1f5f9' },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: '500' } },
      },
    },
  };

  return (
    <div className="space-y-4">
      {/* 1. Hero Banner */}
      <div className="dashboard-hero rounded-4 p-3 p-sm-4 text-white mb-4">
        <div className="dashboard-hero-accent pe-none" aria-hidden="true" />
        <div className="position-relative z-1 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div className="min-w-0">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge glass-widget text-white rounded-pill px-3 py-1 fw-semibold d-inline-flex align-items-center gap-1.5" style={{ fontSize: '11px' }}>
                <ShieldCheck size={14} className="text-info" />
                HR Administration & Workforce Operations
              </span>
              <span className="text-white-50 small d-none d-sm-inline-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
                <Calendar size={13} />
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h2 className="fw-bold mb-1 text-white" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', letterSpacing: '-0.02em' }}>
              {getTimeGreeting()}, {user?.name?.split(' ')[0] || 'Administrator'}
            </h2>
            <p className="text-white-50 mb-0 small text-break-word" style={{ maxWidth: '680px' }}>
              Here is your workforce overview: {stats?.activeEmployees || 0} active employees across {depts.length} departments with {att.attendanceRate || 0}% attendance compliance today.
            </p>
          </div>

          {/* Quick Primary Actions */}
          <div className="d-flex flex-wrap gap-2 flex-shrink-0">
            <Link
              to="/employees"
              className="btn btn-light text-primary fw-semibold rounded-pill px-3.5 py-2 d-flex align-items-center gap-2 shadow-sm flex-fill flex-sm-grow-0"
            >
              <UserPlus size={16} /> Add Employee
            </Link>
            <Link
              to="/announcements"
              className="btn glass-widget text-white fw-semibold rounded-pill px-3.5 py-2 d-flex align-items-center gap-2 flex-fill flex-sm-grow-0"
            >
              <Megaphone size={16} /> Broadcast Notice
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top 4 KPI Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="Total Active Staff"
            value={stats?.activeEmployees || 0}
            subtitle={`${stats?.totalEmployees || 0} total registered`}
            icon={Users}
            color="primary"
            trend={8}
            trendLabel="vs last month"
            progress={stats?.totalEmployees > 0 ? (stats.activeEmployees / stats.totalEmployees) * 100 : 100}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="Attendance Today"
            value={`${att.attendanceRate || 0}%`}
            subtitle={`${att.present || 0} present • ${att.late || 0} late`}
            icon={Clock}
            color="success"
            badgeText={att.attendanceRate >= 80 ? 'Optimal' : 'Needs Attention'}
            badgeBg={att.attendanceRate >= 80 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}
            progress={att.attendanceRate || 0}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="Pending Leaves"
            value={stats?.pendingLeaves || 0}
            subtitle="Require immediate HR decision"
            icon={CalendarCheck}
            color="warning"
            badgeText={stats?.pendingLeaves > 0 ? 'Review Needed' : 'All Clear'}
            badgeBg={stats?.pendingLeaves > 0 ? 'bg-warning-subtle text-warning-emphasis' : 'bg-light text-muted'}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="Skill Programs"
            value={stats?.training?.totalTrainings || 0}
            subtitle={`${stats?.training?.activeEnrollments || 0} active enrollments`}
            icon={GraduationCap}
            color="info"
            trend={12}
            trendLabel="enrolled"
          />
        </div>
      </div>

      {/* 3. Interactive Data Visualizations Row */}
      <div className="row g-4 mb-4">
        {/* Department Distribution (Doughnut Chart) */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom p-3 p-sm-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <Building size={18} className="text-primary flex-shrink-0" />
                  Headcount by Department
                </h6>
                <span className="text-muted small" style={{ fontSize: '11px' }}>
                  Distribution of {stats?.activeEmployees || 0} active team members
                </span>
              </div>
              <Link to="/employees" className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium">
                View Directory
              </Link>
            </div>
            <div className="card-body p-3 p-sm-4 d-flex flex-column justify-content-between">
              {depts.length === 0 ? (
                <div className="text-center py-5 text-muted small">No department data recorded</div>
              ) : (
                <>
                  <div className="chart-wrapper mb-3" style={{ height: '220px' }}>
                    <Doughnut data={deptChartData} options={doughnutOptions} />
                  </div>
                  <div className="row g-2 pt-2 border-top border-light">
                    {depts.slice(0, 4).map((d, idx) => {
                      const total = stats?.activeEmployees || 1;
                      const pct = Math.round((d.count / total) * 100);
                      return (
                        <div key={d.department} className="col-6">
                          <div className="p-2 rounded-3 bg-light d-flex justify-content-between align-items-center">
                            <span className="small text-dark fw-medium text-truncate me-1" style={{ fontSize: '12px' }}>
                              <span
                                className="d-inline-block rounded-circle me-1.5"
                                style={{ width: '8px', height: '8px', backgroundColor: deptPalette[idx % deptPalette.length] }}
                              />
                              {d.department}
                            </span>
                            <span className="badge bg-white text-muted border small" style={{ fontSize: '11px' }}>
                              {d.count} ({pct}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Breakdown (Bar Chart + Compliance) */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom p-3 p-sm-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <Clock size={18} className="text-success flex-shrink-0" />
                  Today's Attendance Compliance
                </h6>
                <span className="text-muted small" style={{ fontSize: '11px' }}>
                  Daily clock-in statistics & punctuality breakdown
                </span>
              </div>
              <Link to="/attendance" className="btn btn-sm btn-outline-success rounded-pill px-3 fw-medium">
                Live Roster
              </Link>
            </div>
            <div className="card-body p-3 p-sm-4 d-flex flex-column justify-content-between">
              {/* Stat summary blocks */}
              <div className="row g-2 text-center mb-3">
                <div className="col-3">
                  <div className="p-2 rounded-3 bg-success-subtle text-success">
                    <h5 className="fw-bold mb-0">{att.present || 0}</h5>
                    <span className="small fw-semibold" style={{ fontSize: '11px' }}>Present</span>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 rounded-3 bg-warning-subtle text-warning-emphasis">
                    <h5 className="fw-bold mb-0">{att.late || 0}</h5>
                    <span className="small fw-semibold" style={{ fontSize: '11px' }}>Late</span>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 rounded-3 bg-info-subtle text-info-emphasis">
                    <h5 className="fw-bold mb-0">{att.halfDay || 0}</h5>
                    <span className="small fw-semibold" style={{ fontSize: '11px' }}>Half-Day</span>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 rounded-3 bg-danger-subtle text-danger">
                    <h5 className="fw-bold mb-0">{att.absent || 0}</h5>
                    <span className="small fw-semibold" style={{ fontSize: '11px' }}>Absent</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="chart-wrapper" style={{ height: '180px' }}>
                <Bar data={attChartData} options={barOptions} />
              </div>

              {/* Compliance progress bar */}
              <div className="p-3 bg-light rounded-4 border mt-3">
                <div className="d-flex justify-content-between align-items-center mb-1.5">
                  <span className="fw-semibold text-dark small" style={{ fontSize: '12px' }}>
                    Overall Punctuality & Attendance
                  </span>
                  <span className="fw-bold text-success small">{att.attendanceRate || 0}%</span>
                </div>
                <div className="progress rounded-pill" style={{ height: '7px' }}>
                  <div
                    className="progress-bar rounded-pill bg-success"
                    role="progressbar"
                    style={{ width: `${att.attendanceRate || 0}%` }}
                    aria-valuenow={att.attendanceRate || 0}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Actions Hub */}
      <div className="mb-4">
        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <Layers size={18} className="text-primary" />
          Administrative Quick Access
        </h6>
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <Link to="/employees" className="card border-0 shadow-sm rounded-4 p-3 quick-action-card h-100 bg-white">
              <div className="d-flex align-items-center gap-2.5 mb-2">
                <div className="p-2 rounded-3 bg-primary-subtle text-primary">
                  <Users size={20} />
                </div>
                <span className="fw-bold text-dark small">Employees</span>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '11px' }}>
                Add, edit, or filter organizational profiles
              </p>
            </Link>
          </div>

          <div className="col-6 col-md-3">
            <Link to="/attendance" className="card border-0 shadow-sm rounded-4 p-3 quick-action-card h-100 bg-white">
              <div className="d-flex align-items-center gap-2.5 mb-2">
                <div className="p-2 rounded-3 bg-success-subtle text-success">
                  <Clock size={20} />
                </div>
                <span className="fw-bold text-dark small">Attendance</span>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '11px' }}>
                Monitor daily clock-in records and hours
              </p>
            </Link>
          </div>

          <div className="col-6 col-md-3">
            <Link to="/leaves" className="card border-0 shadow-sm rounded-4 p-3 quick-action-card h-100 bg-white">
              <div className="d-flex align-items-center gap-2.5 mb-2">
                <div className="p-2 rounded-3 bg-warning-subtle text-warning-emphasis">
                  <FileCheck2 size={20} />
                </div>
                <span className="fw-bold text-dark small">Leave Requests</span>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '11px' }}>
                Review and approve PTO and sick leaves
              </p>
            </Link>
          </div>

          <div className="col-6 col-md-3">
            <Link to="/trainings" className="card border-0 shadow-sm rounded-4 p-3 quick-action-card h-100 bg-white">
              <div className="d-flex align-items-center gap-2.5 mb-2">
                <div className="p-2 rounded-3 bg-info-subtle text-info-emphasis">
                  <GraduationCap size={20} />
                </div>
                <span className="fw-bold text-dark small">Training Programs</span>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: '11px' }}>
                Publish modules and track enrollments
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Company Announcements Feed */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-bottom p-3 p-sm-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <Megaphone size={18} className="text-danger flex-shrink-0" />
              Active Company Announcements
            </h6>
            <span className="text-muted small" style={{ fontSize: '11px' }}>
              Broadcast updates visible to employees and managers
            </span>
          </div>
          <Link to="/announcements" className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium">
            Manage Announcements
          </Link>
        </div>
        <div className="p-3 p-sm-4">
          {stats?.recentAnnouncements?.length === 0 ? (
            <div className="text-center py-4 text-muted small">No active announcements broadcasted yet.</div>
          ) : (
            <div className="row g-3">
              {stats?.recentAnnouncements?.map((a) => (
                <div key={a._id} className="col-12 col-md-6 col-xl-4">
                  <div className="border border-light-subtle rounded-4 p-3 bg-light bg-opacity-50 h-100 d-flex flex-column justify-content-between hover-card">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1" style={{ fontSize: '10px' }}>
                          {a.category}
                        </span>
                        <span className="text-muted" style={{ fontSize: '11px' }}>
                          {new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h6 className="fw-bold text-dark mb-1 small text-truncate">{a.title}</h6>
                      <p className="text-secondary small mb-3 line-clamp-3 text-break-word" style={{ fontSize: '12px', lineHeight: '1.5' }}>
                        {a.content}
                      </p>
                    </div>
                    <div className="pt-2 border-top border-light d-flex justify-content-between align-items-center">
                      <span className="text-muted small" style={{ fontSize: '11px' }}>
                        Audience: <strong className="text-capitalize text-dark">{a.targetAudience}</strong>
                      </span>
                      <Link to="/announcements" className="small text-primary text-decoration-none fw-medium d-flex align-items-center gap-0.5">
                        Read <ArrowRight size={12} />
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

export default HRDashboard;
