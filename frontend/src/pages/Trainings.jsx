import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api.js';
import {
  GraduationCap,
  Plus,
  UserCheck,
  CheckCircle,
  Calendar,
  Users,
  Award,
  BookOpen,
} from 'lucide-react';

const Trainings = () => {
  const { user } = useSelector((state) => state.auth);
  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';

  const [activeTab, setActiveTab] = useState('catalog');
  const [trainings, setTrainings] = useState([]);
  const [teamEnrollments, setTeamEnrollments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);

  // Create form
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    trainer: '',
    category: 'Technical Skills',
    startDate: '',
    endDate: '',
    maxCapacity: 25,
    location: 'Virtual Classroom (Zoom)',
  });

  // Assign form
  const [assignEmployeeId, setAssignEmployeeId] = useState('');

  useEffect(() => {
    fetchTrainings();
    if (isHR || isManager) {
      fetchTeamEnrollments();
      fetchEmployees();
    }
  }, []);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/trainings');
      if (res.data.success) {
        setTrainings(res.data.trainings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamEnrollments = async () => {
    try {
      const res = await API.get('/trainings/team');
      if (res.data.success) {
        setTeamEnrollments(res.data.enrollments);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await API.get('/employees');
      if (res.data.success) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnroll = async (id) => {
    try {
      const res = await API.post(`/trainings/${id}/enroll`);
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Enrolled in training program successfully!' });
        fetchTrainings();
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Enrollment failed' });
    }
  };

  const handleUpdateProgress = async (enrollmentId, currentProgress) => {
    const newProgress = Math.min(100, currentProgress + 25);
    try {
      const res = await API.patch(`/trainings/enrollment/${enrollmentId}`, {
        progress: newProgress,
      });
      if (res.data.success) {
        setMsg({ type: 'success', text: `Training progress updated to ${newProgress}%` });
        fetchTrainings();
        if (isHR || isManager) fetchTeamEnrollments();
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Update failed' });
    }
  };

  const handleCreateTraining = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/trainings', createForm);
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Training program added to catalog!' });
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          description: '',
          trainer: '',
          category: 'Technical Skills',
          startDate: '',
          endDate: '',
          maxCapacity: 25,
          location: 'Virtual Classroom (Zoom)',
        });
        fetchTrainings();
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Creation failed' });
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/trainings/${selectedTraining._id}/assign`, {
        employeeId: assignEmployeeId,
      });
      if (res.data.success) {
        setMsg({ type: 'success', text: res.data.message });
        setShowAssignModal(false);
        setAssignEmployeeId('');
        fetchTrainings();
        fetchTeamEnrollments();
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Assignment failed' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            Training & Professional Development
          </h2>
          <p className="text-secondary small mb-0">
            Upskill through verified workshops, track certifications, and manage team enrollments
          </p>
        </div>

        <div className="d-flex gap-2">
          {isHR && (
            <button
              className="btn btn-primary rounded-pill px-4 fw-medium d-flex align-items-center justify-content-center gap-2 shadow-sm w-100 w-md-auto"
              onClick={() => setShowCreateModal(true)}
              style={{ minHeight: '44px' }}
            >
              <Plus size={18} /> Create Program
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show rounded-4`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMsg(null)} aria-label="Close"></button>
        </div>
      )}

      {/* Tabs if HR/Manager: Responsive Scrollable */}
      {(isHR || isManager) && (
        <div className="d-flex gap-2 mb-3 border-bottom pb-2 overflow-auto text-nowrap">
          <button
            className={`btn btn-sm rounded-pill px-3 px-sm-4 fw-medium flex-shrink-0 ${
              activeTab === 'catalog' ? 'btn-primary' : 'btn-light text-secondary'
            }`}
            onClick={() => setActiveTab('catalog')}
            style={{ minHeight: '38px' }}
          >
            Course Catalog
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 px-sm-4 fw-medium flex-shrink-0 ${
              activeTab === 'team-progress' ? 'btn-primary' : 'btn-light text-secondary'
            }`}
            onClick={() => setActiveTab('team-progress')}
            style={{ minHeight: '38px' }}
          >
            {isHR ? 'Organization Participation' : 'Team Skill Progress'} ({teamEnrollments.length})
          </button>
        </div>
      )}

      {/* TAB 1: CATALOG */}
      {activeTab === 'catalog' && (
        <div>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
              <span className="text-muted small">Loading training programs...</span>
            </div>
          ) : trainings.length === 0 ? (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <GraduationCap size={40} className="text-muted mx-auto mb-3" />
              <h5 className="fw-bold text-dark">No Training Programs Scheduled</h5>
              <p className="text-muted small mb-0">New courses will be published soon by the HR team.</p>
            </div>
          ) : (
            <div className="row g-3 g-sm-4">
              {trainings.map((t) => {
                const enr = t.myEnrollment;
                const isFull = t.enrolledCount >= t.maxCapacity;

                return (
                  <div key={t._id} className="col-12 col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-3 p-sm-4 bg-white d-flex flex-column justify-content-between hover-card">
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                          <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 small text-truncate">
                            {t.category}
                          </span>
                          <span className="text-muted small flex-shrink-0" style={{ fontSize: '11px' }}>
                            <Users size={14} className="me-1" /> {t.enrolledCount}/{t.maxCapacity} Seats
                          </span>
                        </div>

                        <h5 className="fw-bold text-dark mb-2 text-break-word">{t.title}</h5>
                        <p className="text-secondary small mb-3 text-break-word">{t.description}</p>

                        <div className="small text-muted mb-3 space-y-1">
                          <p className="mb-1 text-truncate">
                            <strong className="text-dark">Trainer:</strong> {t.trainer}
                          </p>
                          <p className="mb-1 text-nowrap">
                            <Calendar size={14} className="me-1" />
                            {new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}
                          </p>
                          <p className="mb-0 text-truncate">
                            <BookOpen size={14} className="me-1" /> {t.location}
                          </p>
                        </div>
                      </div>

                      <div className="border-top pt-3 mt-3">
                        {enr ? (
                          <div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="small fw-semibold text-dark">Your Progress</span>
                              <span className="badge bg-success-subtle text-success">{enr.progress}%</span>
                            </div>
                            <div className="progress mb-3" style={{ height: '8px' }}>
                              <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                aria-valuenow={enr.progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                                style={{ width: `${enr.progress}%` }}
                              ></div>
                            </div>
                            {enr.progress < 100 ? (
                              <button
                                className="btn btn-sm btn-outline-primary rounded-pill w-100 fw-medium"
                                onClick={() => handleUpdateProgress(enr._id, enr.progress)}
                                style={{ minHeight: '38px' }}
                              >
                                Advance Progress (+25%)
                              </button>
                            ) : (
                              <div className="text-center">
                                <span className="badge bg-success text-white py-2 px-3 rounded-pill small">
                                  <CheckCircle size={14} className="me-1" /> Certificate Completed
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-primary btn-sm rounded-pill flex-fill fw-medium"
                              disabled={isFull}
                              onClick={() => handleEnroll(t._id)}
                              style={{ minHeight: '38px' }}
                            >
                              {isFull ? 'Program Full' : 'Self Enroll'}
                            </button>

                            {(isHR || isManager) && (
                              <button
                                className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                                title="Assign to team member"
                                aria-label="Assign to team member"
                                onClick={() => {
                                  setSelectedTraining(t);
                                  setShowAssignModal(true);
                                }}
                                style={{ minHeight: '38px' }}
                              >
                                Assign
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEAM PARTICIPATION (HR & Manager) */}
      {activeTab === 'team-progress' && (isHR || isManager) && (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white border-bottom p-3">
            <h6 className="fw-bold mb-0 text-dark">Staff Training Completion & Enrollment Roster</h6>
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light small text-secondary">
                <tr>
                  <th className="ps-3 ps-sm-4 text-nowrap">Employee</th>
                  <th className="text-nowrap">Training Course</th>
                  <th className="text-nowrap">Department</th>
                  <th className="text-nowrap">Status</th>
                  <th className="text-nowrap">Progress</th>
                  <th className="text-nowrap">Enrolled On</th>
                </tr>
              </thead>
              <tbody>
                {teamEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted small">
                      No team enrollments recorded yet.
                    </td>
                  </tr>
                ) : (
                  teamEnrollments.map((enr) => (
                    <tr key={enr._id}>
                      <td className="ps-3 ps-sm-4">
                        <span className="fw-semibold text-dark small text-truncate d-block" style={{ maxWidth: '160px' }}>
                          {enr.userId?.name}
                        </span>
                        <div className="text-muted" style={{ fontSize: '11px' }}>
                          {enr.employeeId?.employeeId}
                        </div>
                      </td>
                      <td>
                        <strong className="text-dark small text-truncate d-block" style={{ maxWidth: '200px' }}>
                          {enr.trainingId?.title}
                        </strong>
                        <div className="text-muted" style={{ fontSize: '11px' }}>
                          {enr.trainingId?.trainer}
                        </div>
                      </td>
                      <td className="small text-muted">{enr.employeeId?.department}</td>
                      <td>
                        <span
                          className={`badge rounded-pill text-capitalize ${
                            enr.status === 'completed'
                              ? 'bg-success-subtle text-success'
                              : 'bg-primary-subtle text-primary'
                          }`}
                        >
                          {enr.status}
                        </span>
                      </td>
                      <td style={{ minWidth: '140px' }}>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '6px' }}>
                            <div
                              className="progress-bar bg-primary"
                              role="progressbar"
                              aria-valuenow={enr.progress}
                              aria-valuemin="0"
                              aria-valuemax="100"
                              style={{ width: `${enr.progress}%` }}
                            ></div>
                          </div>
                          <span className="small fw-semibold">{enr.progress}%</span>
                        </div>
                      </td>
                      <td className="small text-muted text-nowrap">
                        {new Date(enr.enrolledAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Training Modal (HR) */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom p-3 p-sm-4">
                <h5 className="modal-title fw-bold text-dark">Add New Training Course</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} aria-label="Close"></button>
              </div>
              <form onSubmit={handleCreateTraining}>
                <div className="modal-body p-3 p-sm-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">
                        Course Title <span className="required-asterisk">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. AWS Solutions Architecture & Cloud Migration"
                        value={createForm.title}
                        onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Trainer / Instructor <span className="required-asterisk">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Dr. Robert Vance"
                        value={createForm.trainer}
                        onChange={(e) => setCreateForm({ ...createForm, trainer: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">Category</label>
                      <select
                        className="form-select"
                        value={createForm.category}
                        onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                      >
                        <option value="Technical Skills">Technical Skills</option>
                        <option value="Leadership & Soft Skills">Leadership & Soft Skills</option>
                        <option value="Compliance & Security">Compliance & Security</option>
                        <option value="Product & Design">Product & Design</option>
                      </select>
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Start Date <span className="required-asterisk">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={createForm.startDate}
                        onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
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
                        value={createForm.endDate}
                        onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">Capacity Limit</label>
                      <input
                        type="number"
                        className="form-control"
                        value={createForm.maxCapacity}
                        onChange={(e) => setCreateForm({ ...createForm, maxCapacity: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold text-secondary">Location / Link</label>
                      <input
                        type="text"
                        className="form-control"
                        value={createForm.location}
                        onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-secondary">
                        Course Description & Outcomes <span className="required-asterisk">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        required
                        placeholder="Key syllabus objectives..."
                        value={createForm.description}
                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top p-3 d-flex flex-column flex-sm-row justify-content-end gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 w-100 w-sm-auto" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 w-100 w-sm-auto shadow-sm">
                    Create Program
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal (Manager & HR) */}
      {showAssignModal && selectedTraining && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom p-3 p-sm-4">
                <h5 className="modal-title fw-bold text-dark text-truncate">
                  Assign "{selectedTraining.title}"
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)} aria-label="Close"></button>
              </div>
              <form onSubmit={handleAssignSubmit}>
                <div className="modal-body p-3 p-sm-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Select Employee <span className="required-asterisk">*</span>
                    </label>
                    <select
                      className="form-select"
                      required
                      value={assignEmployeeId}
                      onChange={(e) => setAssignEmployeeId(e.target.value)}
                    >
                      <option value="">-- Choose Employee --</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.userId?.name} ({emp.employeeId} - {emp.department})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top p-3 d-flex flex-column flex-sm-row justify-content-end gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 w-100 w-sm-auto" onClick={() => setShowAssignModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 w-100 w-sm-auto shadow-sm">
                    Confirm Assignment
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

export default Trainings;
