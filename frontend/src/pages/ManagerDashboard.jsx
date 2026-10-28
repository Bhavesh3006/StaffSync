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
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  Users,
  Clock,
  CalendarCheck,
  GraduationCap,
  Check,
  X,
  AlertCircle,
  Sparkles,
  UserCheck,
  Calendar,
  Layers,
  ArrowRight,
  Send,
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const ManagerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeLeave, setActiveLeave] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('approved');
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchManagerStats();
    fetchPendingLeaves();
  }, []);

  const fetchManagerStats = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reports/manager');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load manager stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      const res = await API.get('/leaves/pending');
      if (res.data.success) {
        setPendingLeaves(res.data.leaves || []);
      }
    } catch (err) {
      console.error('Failed to load pending leaves:', err);
    }
  };

  const handleOpenReview = (leave, decision) => {
    setActiveLeave(leave);
    setReviewDecision(decision);
    setReviewComment(decision === 'approved' ? 'Approved as per team schedule' : 'Request rejected');
    setShowReviewModal(true);
  };

  const handleConfirmReview = async (e) => {
    e.preventDefault();
    if (!activeLeave) return;

    try {
      setActionLoading(true);
      const res = await API.patch(`/leaves/${activeLeave._id}/review`, {
        status: reviewDecision,
        reviewComment,
      });

      setMsg({ type: 'success', text: res.data.message });
      setShowReviewModal(false);
      fetchManagerStats();
      fetchPendingLeaves();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Review action failed' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center py-5 my-5">
        <div className="spinner-border text-primary mb-3" style={{ width: '2.5rem', height: '2.5rem' }} role="status">
          <span className="visually-hidden">Loading manager analytics...</span>
        </div>
        <p className="text-muted small fw-medium">Loading team intelligence...</p>
      </div>
    );
  }

  const att = stats?.attendanceToday || {};
  const teamMembers = stats?.teamMembers || [];

  // Team Attendance Chart
  const attendanceChartData = {
    labels: ['Present', 'Late', 'Absent'],
    datasets: [
      {
        data: [att.present || 0, att.late || 0, att.absent || 0],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, padding: 12, font: { size: 11 } },
      },
    },
    cutout: '72%',
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
                <Users size={14} className="text-warning" />
                Team Management & Leadership Console
              </span>
              <span className="text-white-50 small d-none d-sm-inline-flex align-items-center gap-1" style={{ fontSize: '12px' }}>
                <Calendar size={13} />
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h2 className="fw-bold mb-1 text-white" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)', letterSpacing: '-0.02em' }}>
              Welcome back, {user?.name?.split(' ')[0]}
            </h2>
            <p className="text-white-50 mb-0 small text-break-word" style={{ maxWidth: '680px' }}>
              Managing <strong>{stats?.teamSize || 0} direct reports</strong>. You have{' '}
              <strong>{pendingLeaves.length} pending leave request(s)</strong> awaiting your decision.
            </p>
          </div>

          <div className="d-flex flex-wrap gap-2 flex-shrink-0">
            <Link
              to="/leaves"
              className="btn btn-light text-primary fw-semibold rounded-pill px-3.5 py-2 d-flex align-items-center gap-2 shadow-sm flex-fill flex-sm-grow-0"
            >
              <CalendarCheck size={16} /> Pending Approvals ({pendingLeaves.length})
            </Link>
            <Link
              to="/trainings"
              className="btn glass-widget text-white fw-semibold rounded-pill px-3.5 py-2 d-flex align-items-center gap-2 flex-fill flex-sm-grow-0"
            >
              <GraduationCap size={16} /> Assign Training
            </Link>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show rounded-4`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMsg(null)} aria-label="Close" />
        </div>
      )}

      {/* 2. KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="Team Size"
            value={stats?.teamSize || 0}
            subtitle="Direct reports assigned"
            icon={Users}
            color="primary"
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="Present Today"
            value={att.present || 0}
            subtitle={`${att.late || 0} late arrivals`}
            icon={Clock}
            color="success"
            badgeText={stats?.teamSize > 0 ? `${Math.round(((att.present || 0) / stats.teamSize) * 100)}% active` : '0%'}
            badgeBg="bg-success-subtle text-success"
            progress={stats?.teamSize > 0 ? ((att.present || 0) / stats.teamSize) * 100 : 0}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="Pending Leaves"
            value={pendingLeaves.length}
            subtitle="Require team lead review"
            icon={CalendarCheck}
            color="warning"
            badgeText={pendingLeaves.length > 0 ? 'Urgent' : 'Clear'}
            badgeBg={pendingLeaves.length > 0 ? 'bg-warning-subtle text-warning-emphasis' : 'bg-light text-muted'}
          />
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <DashboardCard
            title="Training Completion"
            value={`${stats?.training?.completionRate || 0}%`}
            subtitle={`${stats?.training?.completed || 0} of ${stats?.training?.totalEnrollments || 0} modules`}
            icon={GraduationCap}
            color="info"
            progress={stats?.training?.completionRate || 0}
          />
        </div>
      </div>

      {/* 3. Team Attendance & Direct Reports Section */}
      <div className="row g-4 mb-4">
        {/* Team Attendance Chart */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom p-3 p-sm-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <Clock size={18} className="text-success flex-shrink-0" />
                  Team Attendance Today
                </h6>
                <span className="text-muted small" style={{ fontSize: '11px' }}>
                  Punctuality breakdown of your direct reports
                </span>
              </div>
            </div>
            <div className="card-body p-3 p-sm-4 d-flex flex-column justify-content-between">
              <div className="chart-wrapper" style={{ height: '200px' }}>
                <Doughnut data={attendanceChartData} options={doughnutOptions} />
              </div>
              <div className="p-3 bg-light rounded-4 border mt-3 text-center">
                <span className="text-muted small d-block mb-1" style={{ fontSize: '11px' }}>
                  Today's Team Turnout
                </span>
                <h4 className="fw-bold text-success mb-0">
                  {stats?.teamSize > 0 ? Math.round(((att.present || 0) / stats.teamSize) * 100) : 0}% Present
                </h4>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Reports List */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom p-3 p-sm-4 d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <Users size={18} className="text-primary flex-shrink-0" />
                  Direct Reports Directory
                </h6>
                <span className="text-muted small" style={{ fontSize: '11px' }}>
                  {teamMembers.length} team members supervised
                </span>
              </div>
              <Link to="/employees" className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium">
                All Employees
              </Link>
            </div>
            <div className="card-body p-3 p-sm-4">
              {teamMembers.length === 0 ? (
                <div className="text-center py-5 text-muted small">No direct reports currently assigned to you.</div>
              ) : (
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member._id}
                      className="p-3 rounded-4 border border-light-subtle bg-light bg-opacity-50 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 hover-card mb-2"
                    >
                      <div className="d-flex align-items-center gap-3 min-w-0">
                        <div
                          className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs"
                          style={{ width: '40px', height: '40px', fontSize: '14px' }}
                        >
                          {member.userId?.name?.charAt(0) || 'E'}
                        </div>
                        <div className="min-w-0">
                          <h6 className="fw-bold text-dark mb-0 small text-truncate">{member.userId?.name}</h6>
                          <span className="text-muted small d-block" style={{ fontSize: '11px' }}>
                            {member.designation} • {member.department}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-success-subtle text-success rounded-pill px-2.5 py-1 small fw-semibold" style={{ fontSize: '11px' }}>
                          Active
                        </span>
                        <span className="badge bg-light text-secondary border rounded-pill px-2.5 py-1 small" style={{ fontSize: '11px' }}>
                          {member.employeeId}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Actionable Pending Leave Requests */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-bottom p-3 p-sm-4 d-flex justify-content-between align-items-center">
          <div>
            <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <CalendarCheck size={18} className="text-warning flex-shrink-0" />
              Pending Leave Applications ({pendingLeaves.length})
            </h6>
            <span className="text-muted small" style={{ fontSize: '11px' }}>
              One-click approval workflow for team PTO & sick leaves
            </span>
          </div>
          <Link to="/leaves" className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium">
            Full Leave History
          </Link>
        </div>
        <div className="p-3 p-sm-4">
          {pendingLeaves.length === 0 ? (
            <div className="text-center py-4">
              <span className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-2">
                <Check size={24} />
              </span>
              <p className="fw-semibold text-dark mb-0 small">No pending leave requests!</p>
              <span className="text-muted small" style={{ fontSize: '12px' }}>
                All team time-off applications have been resolved.
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="p-3 p-sm-4 rounded-4 border border-warning-subtle bg-warning bg-opacity-10 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3"
                >
                  <div className="min-w-0">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 text-capitalize" style={{ fontSize: '10px' }}>
                        {leave.leaveType} Leave
                      </span>
                      <span className="badge bg-white text-dark border rounded-pill px-2 py-0.5 small" style={{ fontSize: '10px' }}>
                        {leave.daysCount} Day(s)
                      </span>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">
                      {leave.userId?.name || leave.employeeId?.employeeId}
                    </h6>
                    <p className="text-muted small mb-1" style={{ fontSize: '12px' }}>
                      <Calendar size={13} className="me-1 inline" />
                      {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-secondary small mb-0 fst-italic" style={{ fontSize: '12px' }}>
                      "{leave.reason}"
                    </p>
                  </div>

                  <div className="d-flex gap-2 flex-shrink-0">
                    <button
                      className="btn btn-success rounded-pill px-3.5 py-1.5 fw-semibold d-flex align-items-center gap-1 shadow-sm"
                      onClick={() => handleOpenReview(leave, 'approved')}
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      className="btn btn-outline-danger rounded-pill px-3.5 py-1.5 fw-semibold d-flex align-items-center gap-1"
                      onClick={() => handleOpenReview(leave, 'rejected')}
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom p-3 p-sm-4">
                <h5 className="modal-title fw-bold text-dark">
                  {reviewDecision === 'approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)} />
              </div>
              <form onSubmit={handleConfirmReview}>
                <div className="modal-body p-3 p-sm-4">
                  <p className="small text-muted mb-3">
                    You are marking this request from{' '}
                    <strong>{activeLeave?.userId?.name || 'Employee'}</strong> as{' '}
                    <span className={`fw-bold text-uppercase ${reviewDecision === 'approved' ? 'text-success' : 'text-danger'}`}>
                      {reviewDecision}
                    </span>.
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Manager Decision Note / Reason</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Add an optional comment for the employee..."
                    />
                  </div>
                </div>
                <div className="modal-footer border-top p-3 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowReviewModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn rounded-pill px-4 fw-semibold ${reviewDecision === 'approved' ? 'btn-success' : 'btn-danger'}`}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Saving...' : `Confirm ${reviewDecision === 'approved' ? 'Approval' : 'Rejection'}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
