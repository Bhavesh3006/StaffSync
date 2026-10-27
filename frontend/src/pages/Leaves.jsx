import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api.js';
import DashboardCard from '../components/DashboardCard.jsx';
import {
  CalendarDays,
  Plus,
  Check,
  X,
  AlertCircle,
  Clock,
} from 'lucide-react';

const Leaves = () => {
  const { user, employee } = useSelector((state) => state.auth);
  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';

  const [activeTab, setActiveTab] = useState('my-leaves');
  const [myLeaves, setMyLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Application modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('approved');
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchMyLeaves();
    if (isHR || isManager) {
      fetchPendingLeaves();
      fetchAllLeaves();
    }
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const res = await API.get('/leaves/me');
      if (res.data.success) {
        setMyLeaves(res.data.leaves);
        setLeaveBalance(res.data.leaveBalance);
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

  const fetchAllLeaves = async () => {
    try {
      const res = await API.get('/leaves');
      if (res.data.success) {
        setAllLeaves(res.data.leaves);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await API.post('/leaves', applyForm);
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Leave request submitted successfully!' });
        setShowApplyModal(false);
        setApplyForm({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
        fetchMyLeaves();
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to submit leave request' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave request?')) {
      return;
    }
    try {
      const res = await API.patch(`/leaves/${id}/cancel`);
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Leave request cancelled successfully' });
        fetchMyLeaves();
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to cancel request' });
    }
  };

  const handleOpenReview = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewComment(action === 'approved' ? 'Approved as per team policy' : 'Request denied');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await API.patch(`/leaves/${selectedLeave._id}/review`, {
        status: reviewAction,
        reviewComment,
      });
      if (res.data.success) {
        setMsg({ type: 'success', text: res.data.message });
        setShowReviewModal(false);
        fetchPendingLeaves();
        fetchAllLeaves();
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Review failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const balances = leaveBalance || employee?.leaveBalance || {
    annual: { total: 15, used: 0 },
    sick: { total: 10, used: 0 },
    casual: { total: 5, used: 0 },
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            Leave Management System
          </h2>
          <p className="text-secondary small mb-0">
            Apply for time off, track available quotas, and manage team approvals
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary rounded-pill px-4 fw-medium d-flex align-items-center justify-content-center gap-2 shadow-sm w-100 w-md-auto"
            onClick={() => setShowApplyModal(true)}
            style={{ minHeight: '44px' }}
          >
            <Plus size={18} /> Apply for Leave
          </button>
        </div>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show rounded-4`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMsg(null)} aria-label="Close"></button>
        </div>
      )}

      {/* Leave Balance Quota Cards: Responsive (1 col phone, 2 col tablet, 3 col desktop) */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-4">
          <DashboardCard
            title="Annual Vacation"
            value={`${(balances.annual?.total || 15) - (balances.annual?.used || 0)} Days`}
            subtitle={`Used: ${balances.annual?.used || 0} of ${balances.annual?.total || 15} allowed`}
            icon={CalendarDays}
            color="primary"
            badgeText="Paid Leave"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DashboardCard
            title="Sick Leave"
            value={`${(balances.sick?.total || 10) - (balances.sick?.used || 0)} Days`}
            subtitle={`Used: ${balances.sick?.used || 0} of ${balances.sick?.total || 10} allowed`}
            icon={Clock}
            color="success"
            badgeText="Medical"
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <DashboardCard
            title="Casual / Personal"
            value={`${(balances.casual?.total || 5) - (balances.casual?.used || 0)} Days`}
            subtitle={`Used: ${balances.casual?.used || 0} of ${balances.casual?.total || 5} allowed`}
            icon={CalendarDays}
            color="warning"
            badgeText="Casual"
          />
        </div>
      </div>

      {/* Navigation Tabs (Horizontally Scrollable on Mobile) */}
      {(isHR || isManager) && (
        <div className="d-flex gap-2 mb-3 border-bottom pb-2 overflow-auto text-nowrap">
          <button
            className={`btn btn-sm rounded-pill px-3 px-sm-4 fw-medium flex-shrink-0 ${
              activeTab === 'my-leaves' ? 'btn-primary' : 'btn-light text-secondary'
            }`}
            onClick={() => setActiveTab('my-leaves')}
            style={{ minHeight: '38px' }}
          >
            My Leave Requests
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 px-sm-4 fw-medium flex-shrink-0 position-relative ${
              activeTab === 'pending-reviews' ? 'btn-primary' : 'btn-light text-secondary'
            }`}
            onClick={() => setActiveTab('pending-reviews')}
            style={{ minHeight: '38px' }}
          >
            Pending Approvals
            {pendingLeaves.length > 0 && (
              <span className="badge bg-warning text-dark ms-2 rounded-pill">
                {pendingLeaves.length}
              </span>
            )}
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 px-sm-4 fw-medium flex-shrink-0 ${
              activeTab === 'all-leaves' ? 'btn-primary' : 'btn-light text-secondary'
            }`}
            onClick={() => setActiveTab('all-leaves')}
            style={{ minHeight: '38px' }}
          >
            {isHR ? 'Organization History' : 'Team History'}
          </button>
        </div>
      )}

      {/* TAB 1: MY LEAVES */}
      {activeTab === 'my-leaves' && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white border-bottom p-3">
            <h6 className="fw-bold mb-0 text-dark">My Leave Application History</h6>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light small text-secondary">
                <tr>
                  <th className="ps-3 ps-sm-4 text-nowrap">Leave Type</th>
                  <th className="text-nowrap">Dates (Start - End)</th>
                  <th className="text-nowrap">Days</th>
                  <th className="text-nowrap">Reason</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-nowrap">Reviewer / Comments</th>
                  <th className="text-end pe-3 pe-sm-4 text-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted small">
                      No leave requests submitted yet. Click "Apply for Leave" above.
                    </td>
                  </tr>
                ) : (
                  myLeaves.map((l) => (
                    <tr key={l._id}>
                      <td className="ps-3 ps-sm-4">
                        <span className="fw-semibold text-capitalize text-dark">{l.leaveType}</span>
                      </td>
                      <td className="small text-muted text-nowrap">
                        {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td className="fw-bold text-dark">{l.daysCount}d</td>
                      <td className="small text-truncate" style={{ maxWidth: '180px' }}>
                        {l.reason}
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill text-capitalize ${
                            l.status === 'approved'
                              ? 'bg-success-subtle text-success'
                              : l.status === 'rejected'
                              ? 'bg-danger-subtle text-danger'
                              : l.status === 'cancelled'
                              ? 'bg-secondary-subtle text-secondary'
                              : 'bg-warning-subtle text-warning-emphasis'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="small text-muted min-w-0">
                        {l.reviewedBy ? (
                          <div className="min-w-0">
                            <span className="fw-medium text-dark d-block text-truncate" style={{ maxWidth: '150px' }}>
                              {l.reviewedBy?.name}
                            </span>
                            {l.reviewComment && (
                              <p className="mb-0 text-muted text-truncate" style={{ fontSize: '11px', maxWidth: '160px' }}>
                                "{l.reviewComment}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="italic text-muted">Awaiting Review</span>
                        )}
                      </td>
                      <td className="text-end pe-3 pe-sm-4">
                        {l.status === 'pending' && (
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-3 text-nowrap"
                            onClick={() => handleCancelLeave(l._id)}
                            style={{ minHeight: '34px' }}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PENDING REVIEWS (Manager & HR) */}
      {activeTab === 'pending-reviews' && (isHR || isManager) && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white border-bottom p-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h6 className="fw-bold mb-0 text-dark">Pending Leave Requests Awaiting Review</h6>
            <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-3 py-1">
              {pendingLeaves.length} Requiring Decision
            </span>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light small text-secondary">
                <tr>
                  <th className="ps-3 ps-sm-4 text-nowrap">Employee</th>
                  <th className="text-nowrap">Leave Type</th>
                  <th className="text-nowrap">Duration</th>
                  <th className="text-nowrap">Days</th>
                  <th className="text-nowrap">Reason</th>
                  <th className="text-end pe-3 pe-sm-4 text-nowrap">Decision</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted small">
                      All caught up! No pending leave requests.
                    </td>
                  </tr>
                ) : (
                  pendingLeaves.map((l) => (
                    <tr key={l._id}>
                      <td className="ps-3 ps-sm-4">
                        <div className="d-flex align-items-center gap-2 min-w-0">
                          <div
                            className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: '34px', height: '34px', fontSize: '13px' }}
                          >
                            {l.employeeId?.userId?.name?.charAt(0) || 'E'}
                          </div>
                          <div className="min-w-0">
                            <p className="fw-semibold mb-0 small text-dark text-truncate">{l.employeeId?.userId?.name}</p>
                            <span className="text-muted text-truncate d-block" style={{ fontSize: '11px', maxWidth: '140px' }}>
                              {l.employeeId?.employeeId} • {l.employeeId?.department}
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
                      <td className="fw-bold text-dark">{l.daysCount}</td>
                      <td className="small text-truncate" style={{ maxWidth: '180px' }}>
                        {l.reason}
                      </td>
                      <td className="text-end pe-3 pe-sm-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-success rounded-pill px-3 d-flex align-items-center gap-1 text-nowrap"
                            onClick={() => handleOpenReview(l, 'approved')}
                            style={{ minHeight: '34px' }}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-3 d-flex align-items-center gap-1 text-nowrap"
                            onClick={() => handleOpenReview(l, 'rejected')}
                            style={{ minHeight: '34px' }}
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
      )}

      {/* TAB 3: ALL LEAVES (History) */}
      {activeTab === 'all-leaves' && (isHR || isManager) && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white border-bottom p-3">
            <h6 className="fw-bold mb-0 text-dark">
              {isHR ? 'Organization-wide Leave History' : 'Team Leave History'}
            </h6>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light small text-secondary">
                <tr>
                  <th className="ps-3 ps-sm-4 text-nowrap">Employee</th>
                  <th className="text-nowrap">Leave Type</th>
                  <th className="text-nowrap">Dates</th>
                  <th className="text-nowrap">Days</th>
                  <th className="text-nowrap">Reason</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-nowrap">Reviewed By</th>
                </tr>
              </thead>
              <tbody>
                {allLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted small">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  allLeaves.map((l) => (
                    <tr key={l._id}>
                      <td className="ps-3 ps-sm-4">
                        <span className="fw-semibold text-dark small text-truncate d-block" style={{ maxWidth: '160px' }}>
                          {l.employeeId?.userId?.name}
                        </span>
                        <div className="text-muted" style={{ fontSize: '11px' }}>
                          {l.employeeId?.employeeId}
                        </div>
                      </td>
                      <td className="small text-capitalize">{l.leaveType}</td>
                      <td className="small text-muted text-nowrap">
                        {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td className="fw-bold small">{l.daysCount}d</td>
                      <td className="small text-truncate" style={{ maxWidth: '160px' }}>
                        {l.reason}
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill text-capitalize ${
                            l.status === 'approved'
                              ? 'bg-success-subtle text-success'
                              : l.status === 'rejected'
                              ? 'bg-danger-subtle text-danger'
                              : l.status === 'cancelled'
                              ? 'bg-secondary-subtle text-secondary'
                              : 'bg-warning-subtle text-warning-emphasis'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="small text-muted min-w-0">
                        {l.reviewedBy?.name ? (
                          <span className="text-truncate d-block" style={{ maxWidth: '160px' }}>
                            {l.reviewedBy?.name} {l.reviewComment ? `("${l.reviewComment}")` : ''}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom p-3 p-sm-4">
                <h5 className="modal-title fw-bold text-dark">Submit Leave Application</h5>
                <button type="button" className="btn-close" onClick={() => setShowApplyModal(false)} aria-label="Close"></button>
              </div>
              <form onSubmit={handleApplyLeave}>
                <div className="modal-body p-3 p-sm-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Leave Category <span className="required-asterisk">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={applyForm.leaveType}
                      onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
                    >
                      <option value="annual">Annual Paid Vacation</option>
                      <option value="sick">Sick / Medical Leave</option>
                      <option value="casual">Casual / Personal Time Off</option>
                      <option value="maternity">Maternity Leave</option>
                      <option value="paternity">Paternity Leave</option>
                      <option value="unpaid">Unpaid Leave</option>
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Start Date <span className="required-asterisk">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={applyForm.startDate}
                        onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">
                        End Date <span className="required-asterisk">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={applyForm.endDate}
                        onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Reason for Leave <span className="required-asterisk">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      required
                      placeholder="Please provide details for your manager's review..."
                      value={applyForm.reason}
                      onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top p-3 d-flex flex-column flex-sm-row justify-content-end gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 w-100 w-sm-auto" onClick={() => setShowApplyModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading} className="btn btn-primary rounded-pill px-4 w-100 w-sm-auto shadow-sm">
                    {actionLoading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedLeave && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom p-3 p-sm-4">
                <h5 className="modal-title fw-bold text-dark text-capitalize text-truncate">
                  {reviewAction}: {selectedLeave.employeeId?.userId?.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)} aria-label="Close"></button>
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body p-3 p-sm-4">
                  <div className="p-3 bg-light rounded-3 mb-3 small">
                    <p className="mb-1">
                      <strong>Type:</strong> <span className="text-capitalize">{selectedLeave.leaveType}</span>
                    </p>
                    <p className="mb-1">
                      <strong>Duration:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} to{' '}
                      {new Date(selectedLeave.endDate).toLocaleDateString()} ({selectedLeave.daysCount} days)
                    </p>
                    <p className="mb-0 text-break-word">
                      <strong>Reason:</strong> {selectedLeave.reason}
                    </p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Review Decision Comment <span className="required-asterisk">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
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
                      reviewAction === 'approved' ? 'btn-success' : 'btn-danger'
                    }`}
                  >
                    {actionLoading ? 'Processing...' : `Confirm ${reviewAction === 'approved' ? 'Approval' : 'Rejection'}`}
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

export default Leaves;
