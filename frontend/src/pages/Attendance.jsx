import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api.js';
import DashboardCard from '../components/DashboardCard.jsx';
import {
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileText,
  UserCheck,
  Edit3,
} from 'lucide-react';

const Attendance = () => {
  const { user } = useSelector((state) => state.auth);
  const isEmployee = user?.role === 'employee';
  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';

  const [activeTab, setActiveTab] = useState('my-attendance'); // 'my-attendance' or 'org-attendance'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Employee data
  const [myAttendance, setMyAttendance] = useState({ today: null, summary: {}, records: [] });

  // Org data
  const [orgDate, setOrgDate] = useState(new Date().toISOString().split('T')[0]);
  const [orgAttendance, setOrgAttendance] = useState({ summary: {}, attendances: [], missingCheckouts: [] });

  // HR edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    checkIn: '',
    checkOut: '',
    status: 'present',
    remarks: '',
  });

  useEffect(() => {
    fetchMyAttendance();
    if (isHR || isManager) {
      fetchOrgAttendance();
    }
  }, [orgDate]);

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const res = await API.get('/attendance/me');
      if (res.data.success) {
        setMyAttendance(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgAttendance = async () => {
    try {
      const res = await API.get('/attendance', {
        params: {
          date: orgDate,
          teamOnly: isManager && !isHR ? 'true' : 'false',
        },
      });
      if (res.data.success) {
        setOrgAttendance(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      const res = await API.post('/attendance/check-in');
      setMsg({ type: 'success', text: res.data.message });
      fetchMyAttendance();
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
      fetchMyAttendance();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Check-out failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setEditForm({
      checkIn: rec.checkIn ? new Date(rec.checkIn).toISOString().slice(0, 16) : '',
      checkOut: rec.checkOut ? new Date(rec.checkOut).toISOString().slice(0, 16) : '',
      status: rec.status,
      remarks: rec.remarks || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.patch(`/attendance/${editingRecord._id}`, editForm);
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Attendance record adjusted successfully!' });
        setShowEditModal(false);
        fetchOrgAttendance();
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Adjustment failed' });
    }
  };

  const todayRec = myAttendance.today;
  const isCheckedIn = !!todayRec?.checkIn;
  const isCheckedOut = !!todayRec?.checkOut;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            Attendance & Time Tracking
          </h2>
          <p className="text-secondary small mb-0">
            Monitor daily shifts, check-ins, accumulated hours, and compliance logs
          </p>
        </div>

        {/* Tab switch for Managers & HR */}
        {(isHR || isManager) && (
          <div className="btn-group p-1 bg-light rounded-pill border w-100 w-md-auto d-flex">
            <button
              className={`btn btn-sm rounded-pill px-3 px-sm-4 flex-fill ${
                activeTab === 'my-attendance' ? 'btn-primary shadow-sm' : 'btn-light text-secondary border-0'
              }`}
              onClick={() => setActiveTab('my-attendance')}
              style={{ minHeight: '38px' }}
            >
              My Attendance
            </button>
            <button
              className={`btn btn-sm rounded-pill px-3 px-sm-4 flex-fill ${
                activeTab === 'org-attendance' ? 'btn-primary shadow-sm' : 'btn-light text-secondary border-0'
              }`}
              onClick={() => setActiveTab('org-attendance')}
              style={{ minHeight: '38px' }}
            >
              {isHR ? 'Organization Log' : 'Team Attendance'}
            </button>
          </div>
        )}
      </div>

      {msg && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show rounded-4`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMsg(null)} aria-label="Close"></button>
        </div>
      )}

      {/* VIEW 1: MY ATTENDANCE */}
      {activeTab === 'my-attendance' && (
        <div>
          {/* Today's Punch Card Banner: Responsive Stack */}
          <div className="card border-0 shadow-sm rounded-4 p-3 p-sm-4 mb-4 bg-white">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
              <div className="d-flex align-items-center gap-3 min-w-0">
                <div
                  className={`rounded-4 d-flex align-items-center justify-content-center p-3 flex-shrink-0 ${
                    isCheckedOut
                      ? 'bg-secondary-subtle text-secondary'
                      : isCheckedIn
                      ? 'bg-success-subtle text-success'
                      : 'bg-primary-subtle text-primary'
                  }`}
                  style={{ width: '56px', height: '56px' }}
                >
                  <Clock size={28} />
                </div>
                <div className="min-w-0">
                  <span className="text-muted small fw-semibold text-uppercase ls-wide d-block text-truncate" style={{ fontSize: '11px' }}>
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <h4 className="fw-bold mb-1 text-dark text-truncate" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)' }}>
                    {isCheckedOut
                      ? `Shift Completed (${todayRec.totalWorkMinutes} Minutes)`
                      : isCheckedIn
                      ? `Active Shift Started at ${new Date(todayRec.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : 'Not Checked In Yet'}
                  </h4>
                  {todayRec?.status === 'late' && (
                    <span className="badge bg-warning-subtle text-warning-emphasis">Late Arrival (After 9:30 AM)</span>
                  )}
                </div>
              </div>

              <div className="d-flex align-items-center w-100 w-md-auto">
                {!isCheckedIn ? (
                  <button
                    className="btn btn-success btn-lg rounded-pill px-4 px-sm-5 fw-semibold shadow-sm w-100"
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                    style={{ minHeight: '44px' }}
                  >
                    {actionLoading ? 'Recording...' : 'Clock In Now'}
                  </button>
                ) : !isCheckedOut ? (
                  <button
                    className="btn btn-warning btn-lg text-dark rounded-pill px-4 px-sm-5 fw-semibold shadow-sm w-100"
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                    style={{ minHeight: '44px' }}
                  >
                    {actionLoading ? 'Recording...' : 'Clock Out Now'}
                  </button>
                ) : (
                  <div className="text-center text-md-end w-100">
                    <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fs-6 fw-semibold d-inline-block">
                      <CheckCircle2 size={16} className="me-1" /> Workday Logged
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Summary Metric Cards: Responsive Stack (1 col phone, 2 col tablet, 4 col desktop) */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-3">
              <DashboardCard
                title="Days Recorded"
                value={myAttendance.summary?.totalDays || 0}
                subtitle="This recording cycle"
                icon={Calendar}
                color="primary"
              />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <DashboardCard
                title="Total Hours"
                value={`${myAttendance.summary?.totalHours || 0} hrs`}
                subtitle={`Avg: ${myAttendance.summary?.avgWorkHours || 0} hrs/day`}
                icon={Clock}
                color="info"
              />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <DashboardCard
                title="On-Time Days"
                value={myAttendance.summary?.totalPresent || 0}
                subtitle="Punctual check-ins"
                icon={CheckCircle2}
                color="success"
              />
            </div>
            <div className="col-12 col-sm-6 col-lg-3">
              <DashboardCard
                title="Late Arrivals"
                value={myAttendance.summary?.totalLate || 0}
                subtitle="Logged after 9:30 AM"
                icon={AlertTriangle}
                color="warning"
              />
            </div>
          </div>

          {/* Attendance History Table */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="card-header bg-white border-bottom p-3">
              <h6 className="fw-bold mb-0 text-dark">Personal Attendance History</h6>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light small text-secondary">
                  <tr>
                    <th className="ps-3 ps-sm-4 text-nowrap">Date</th>
                    <th className="text-nowrap">Check In</th>
                    <th className="text-nowrap">Check Out</th>
                    <th className="text-nowrap">Work Duration</th>
                    <th className="text-nowrap">Status</th>
                    <th className="text-nowrap">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {myAttendance.records?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted small">
                        No attendance records logged yet.
                      </td>
                    </tr>
                  ) : (
                    myAttendance.records?.map((r) => (
                      <tr key={r._id}>
                        <td className="ps-3 ps-sm-4 fw-medium text-dark text-nowrap">
                          {new Date(r.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="small text-secondary text-nowrap">
                          {r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="small text-secondary text-nowrap">
                          {r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="small fw-semibold text-nowrap">
                          {r.totalWorkMinutes > 0 ? `${(r.totalWorkMinutes / 60).toFixed(1)} hrs (${r.totalWorkMinutes}m)` : 'In Progress'}
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill text-capitalize ${
                              r.status === 'present'
                                ? 'bg-success-subtle text-success'
                                : r.status === 'late'
                                ? 'bg-warning-subtle text-warning-emphasis'
                                : 'bg-info-subtle text-info-emphasis'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                          {r.remarks || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ORGANIZATION / TEAM ATTENDANCE (HR & Manager) */}
      {activeTab === 'org-attendance' && (isHR || isManager) && (
        <div>
          {/* Date Picker Bar: Responsive Stack */}
          <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="filter-att-date" className="fw-semibold small text-secondary text-nowrap">Filter Date:</label>
                <input
                  id="filter-att-date"
                  type="date"
                  className="form-control form-control-sm bg-light"
                  value={orgDate}
                  onChange={(e) => setOrgDate(e.target.value)}
                />
              </div>

              {/* Stats badges wrap */}
              <div className="d-flex flex-wrap align-items-center gap-2 small">
                <span className="text-muted">
                  Total Active: <strong>{orgAttendance.summary?.totalEmployees || 0}</strong>
                </span>
                <span className="badge bg-success-subtle text-success">
                  Present: {orgAttendance.summary?.present || 0}
                </span>
                <span className="badge bg-warning-subtle text-warning-emphasis">
                  Late: {orgAttendance.summary?.late || 0}
                </span>
                <span className="badge bg-danger-subtle text-danger">
                  Absent: {orgAttendance.summary?.absent || 0}
                </span>
                {orgAttendance.summary?.missingCheckouts > 0 && (
                  <span className="badge bg-danger text-white">
                    {orgAttendance.summary?.missingCheckouts} Missing Out
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Org Table */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light small text-secondary">
                  <tr>
                    <th className="ps-3 ps-sm-4 text-nowrap">Employee</th>
                    <th className="text-nowrap">Department</th>
                    <th className="text-nowrap">Check In</th>
                    <th className="text-nowrap">Check Out</th>
                    <th className="text-nowrap">Work Time</th>
                    <th className="text-nowrap">Status</th>
                    <th className="text-nowrap">Remarks</th>
                    {isHR && <th className="text-end pe-3 pe-sm-4 text-nowrap">Correction</th>}
                  </tr>
                </thead>
                <tbody>
                  {orgAttendance.attendances?.length === 0 ? (
                    <tr>
                      <td colSpan={isHR ? 8 : 7} className="text-center py-5 text-muted small">
                        No check-in records logged for {orgDate}.
                      </td>
                    </tr>
                  ) : (
                    orgAttendance.attendances?.map((att) => (
                      <tr key={att._id}>
                        <td className="ps-3 ps-sm-4">
                          <div className="d-flex align-items-center gap-2 min-w-0">
                            <div
                              className="rounded-circle bg-light border text-dark fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: '32px', height: '32px', fontSize: '13px' }}
                            >
                              {att.employeeId?.userId?.name?.charAt(0) || 'E'}
                            </div>
                            <div className="min-w-0">
                              <p className="fw-semibold mb-0 small text-dark text-truncate">
                                {att.employeeId?.userId?.name}
                              </p>
                              <span className="text-muted" style={{ fontSize: '11px' }}>
                                {att.employeeId?.employeeId}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="small text-muted">{att.employeeId?.department}</td>
                        <td className="small text-nowrap">
                          {att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="small text-nowrap">
                          {att.checkOut ? (
                            new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          ) : (
                            <span className="badge bg-warning-subtle text-warning-emphasis">Active (No Out)</span>
                          )}
                        </td>
                        <td className="small fw-semibold text-nowrap">
                          {att.totalWorkMinutes > 0 ? `${(att.totalWorkMinutes / 60).toFixed(1)} hrs` : '—'}
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill text-capitalize ${
                              att.status === 'present'
                                ? 'bg-success-subtle text-success'
                                : att.status === 'late'
                                ? 'bg-warning-subtle text-warning-emphasis'
                                : 'bg-info-subtle text-info-emphasis'
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="small text-muted text-truncate" style={{ maxWidth: '150px' }}>
                          {att.remarks || '—'}
                        </td>
                        {isHR && (
                          <td className="text-end pe-3 pe-sm-4">
                            <button
                              className="btn btn-sm btn-light border text-primary rounded-pill px-3 text-nowrap"
                              onClick={() => handleOpenEdit(att)}
                              style={{ minHeight: '34px' }}
                            >
                              <Edit3 size={14} className="me-1" /> Adjust
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* HR Edit Modal */}
      {showEditModal && editingRecord && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom p-3 p-sm-4">
                <h5 className="modal-title fw-bold text-dark text-truncate">
                  Adjust: {editingRecord.employeeId?.userId?.name}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} aria-label="Close"></button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-3 p-sm-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Check-In Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={editForm.checkIn}
                      onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Check-Out Time</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={editForm.checkOut}
                      onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Status</label>
                    <select
                      className="form-select"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    >
                      <option value="present">Present (On-time)</option>
                      <option value="late">Late Arrival</option>
                      <option value="half-day">Half Day</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Adjustment Reason / Remarks</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={editForm.remarks}
                      onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                      placeholder="e.g. Corrected missed badge check-out"
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top p-3 d-flex flex-column flex-sm-row justify-content-end gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 w-100 w-sm-auto" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 w-100 w-sm-auto shadow-sm">
                    Save Record
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

export default Attendance;
