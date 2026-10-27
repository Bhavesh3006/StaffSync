import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api.js';
import DashboardCard from '../components/DashboardCard.jsx';
import {
  Users,
  Clock,
  CalendarCheck,
  GraduationCap,
  Check,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const ManagerDashboard = () => {
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      const res = await API.get('/leaves/pending');
      if (res.data.success) {
        setPendingLeaves(res.data.leaves);
      }
    } catch (err) {
      console.error(err);
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
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading manager analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-3 py-1 fw-semibold">
              Manager Control Center
            </span>
          </div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            Team Overview & Operations
          </h2>
          <p className="text-secondary small mb-0">
            Monitor direct report attendance, pending leaves, and skill development
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2 w-100 w-md-auto">
          <Link to="/leaves" className="btn btn-outline-primary rounded-pill px-3 fw-medium flex-fill flex-sm-grow-0">
            Review Leaves ({pendingLeaves.length})
          </Link>
          <Link to="/trainings" className="btn btn-primary rounded-pill px-4 fw-medium flex-fill flex-sm-grow-0 shadow-sm">
            Assign Training
          </Link>
        </div>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show rounded-4`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMsg(null)} aria-label="Close"></button>
        </div>
      )}

      {/* KPI Cards: Responsive Stack (1 col phone, 2 col tablet, 4 col desktop) */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <DashboardCard
            title="Team Size"
            value={stats?.teamSize || 0}
            subtitle="Direct reports supervised"
            icon={Users}
            color="primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <DashboardCard
            title="Present Today"
            value={stats?.attendanceToday?.present || 0}
            subtitle={`${stats?.attendanceToday?.late || 0} late arrivals`}
            icon={Clock}
            color="success"
            badgeText="On Shift"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <DashboardCard
            title="Pending Leaves"
            value={stats?.pendingLeaves || pendingLeaves.length}
            subtitle="Awaiting your approval"
            icon={CalendarCheck}
            color="warning"
            badgeText={pendingLeaves.length > 0 ? 'Action Needed' : 'Clear'}
            badgeBg="bg-warning-subtle text-warning-emphasis"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <DashboardCard
            title="Skill Training"
            value={`${stats?.training?.completionRate || 0}%`}
            subtitle={`${stats?.training?.completed || 0} of ${stats?.training?.totalEnrollments || 0} completed`}
            icon={GraduationCap}
            color="info"
          />
        </div>
      </div>

      {/* Pending Leave Requests requiring attention */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-header bg-white border-bottom p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h6 className="fw-bold mb-0 text-dark">Pending Team Leave Approvals</h6>
            <span className="text-muted small">Requests submitted by your direct report team</span>
          </div>
          <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-3 py-1">
            {pendingLeaves.length} Pending
          </span>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light small text-secondary">
              <tr>
                <th className="ps-3">Employee</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th className="text-end pe-3">Decision</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted small">
                    All caught up! No pending leave requests from your team.
                  </td>
                </tr>
              ) : (
                pendingLeaves.map((l) => (
                  <tr key={l._id}>
                    <td className="ps-3">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '32px', height: '32px', fontSize: '13px' }}
                        >
                          {l.employeeId?.userId?.name?.charAt(0) || 'E'}
                        </div>
                        <div className="min-w-0">
                          <p className="fw-semibold mb-0 small text-dark text-truncate">{l.employeeId?.userId?.name}</p>
                          <span className="text-muted" style={{ fontSize: '11px' }}>
                            {l.employeeId?.employeeId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary text-capitalize">
                        {l.leaveType}
                      </span>
                    </td>
                    <td className="small text-muted text-nowrap">
                      {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td><strong>{l.daysCount}</strong></td>
                    <td className="small text-truncate" style={{ maxWidth: '180px' }}>
                      {l.reason}
                    </td>
                    <td className="text-end pe-3">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-success rounded-pill px-3 d-flex align-items-center gap-1"
                          onClick={() => handleOpenReview(l, 'approved')}
                          disabled={actionLoading}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-pill px-3 d-flex align-items-center gap-1"
                          onClick={() => handleOpenReview(l, 'rejected')}
                          disabled={actionLoading}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Reports Team Roster */}
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-white border-bottom p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h6 className="fw-bold mb-0 text-dark">Direct Report Roster</h6>
          <Link to="/employees" className="btn btn-sm btn-outline-primary rounded-pill px-3">
            View All Employees
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light small text-secondary">
              <tr>
                <th className="ps-3">Member</th>
                <th>Employee ID</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.teamMembers?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted small">
                    No employees currently assigned under your supervision.
                  </td>
                </tr>
              ) : (
                stats?.teamMembers?.map((m) => (
                  <tr key={m._id}>
                    <td className="ps-3">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle bg-light border text-dark fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '32px', height: '32px', fontSize: '13px' }}
                        >
                          {m.userId?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="fw-semibold mb-0 small text-dark text-truncate">{m.userId?.name}</p>
                          <span className="text-muted text-truncate d-block" style={{ fontSize: '11px', maxWidth: '160px' }}>
                            {m.userId?.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td><code>{m.employeeId}</code></td>
                    <td className="small">{m.designation}</td>
                    <td className="small text-muted">{m.department}</td>
                    <td className="small text-muted">{m.phone || 'N/A'}</td>
                    <td>
                      <span className="badge bg-success-subtle text-success rounded-pill text-capitalize">
                        {m.employmentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Leave Modal */}
      {showReviewModal && activeLeave && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom p-3 p-sm-4">
                <h5 className="modal-title fw-bold text-dark text-capitalize">
                  {reviewDecision} Leave: {activeLeave.employeeId?.userId?.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)} aria-label="Close"></button>
              </div>
              <form onSubmit={handleConfirmReview}>
                <div className="modal-body p-3 p-sm-4">
                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <p className="mb-1">
                      <strong>Leave Category:</strong> <span className="text-capitalize">{activeLeave.leaveType}</span>
                    </p>
                    <p className="mb-1">
                      <strong>Requested Dates:</strong> {new Date(activeLeave.startDate).toLocaleDateString()} to{' '}
                      {new Date(activeLeave.endDate).toLocaleDateString()} ({activeLeave.daysCount} days)
                    </p>
                    <p className="mb-0">
                      <strong>Employee Note:</strong> {activeLeave.reason}
                    </p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Reviewer Decision Comments <span className="required-asterisk">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top p-3 d-flex flex-column flex-sm-row justify-content-end gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 w-100 w-sm-auto" onClick={() => setShowReviewModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className={`btn rounded-pill px-4 w-100 w-sm-auto ${
                      reviewDecision === 'approved' ? 'btn-success' : 'btn-danger'
                    }`}
                  >
                    {actionLoading ? 'Processing...' : `Confirm ${reviewDecision === 'approved' ? 'Approval' : 'Rejection'}`}
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
