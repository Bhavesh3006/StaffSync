import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api.js';
import {
  Users,
  Search,
  Plus,
  Filter,
  Edit2,
  UserX,
  UserCheck,
  Building,
  Phone,
  Mail,
  X,
  Check,
} from 'lucide-react';

const Employees = () => {
  const { user } = useSelector((state) => state.auth);
  const isHR = user?.role === 'hr';

  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('All');
  const [msg, setMsg] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    department: 'Engineering',
    designation: '',
    phone: '',
    managerId: '',
    salary: '',
  });

  const departments = [
    'All',
    'Engineering',
    'Human Resources',
    'Marketing',
    'Sales',
    'Finance',
    'Operations',
    'Design',
    'Customer Support',
  ];

  useEffect(() => {
    fetchEmployees();
    fetchManagers();
  }, [department, status]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (department !== 'All') params.department = department;
      if (status !== 'All') params.status = status;
      if (search) params.search = search;

      const res = await API.get('/employees', { params });
      if (res.data.success) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await API.get('/employees/managers/list');
      if (res.data.success) {
        setManagers(res.data.managers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      role: 'employee',
      department: 'Engineering',
      designation: '',
      phone: '',
      managerId: '',
      salary: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      name: emp.userId?.name || '',
      email: emp.userId?.email || '',
      role: emp.userId?.role || 'employee',
      department: emp.department || 'Engineering',
      designation: emp.designation || '',
      phone: emp.phone || '',
      managerId: emp.managerId?._id || '',
      salary: emp.salary || '',
      employmentStatus: emp.employmentStatus || 'active',
    });
    setShowEditModal(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/employees', formData);
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Employee profile created successfully!' });
        setShowAddModal(false);
        fetchEmployees();
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Error creating employee' });
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.patch(`/employees/${selectedEmployee._id}`, formData);
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Employee details updated successfully!' });
        setShowEditModal(false);
        fetchEmployees();
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Error updating employee' });
    }
  };

  const handleToggleDeactivate = async (emp) => {
    const isActivating = emp.employmentStatus === 'inactive';
    if (!window.confirm(`Are you sure you want to ${isActivating ? 'activate' : 'deactivate'} ${emp.userId?.name}?`)) {
      return;
    }
    try {
      const res = await API.patch(`/employees/${emp._id}/deactivate`);
      if (res.data.success) {
        setMsg({ type: 'success', text: res.data.message });
        fetchEmployees();
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Action failed' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            Employee Directory
          </h2>
          <p className="text-secondary small mb-0">
            Manage workforce records, department alignments, and manager assignments
          </p>
        </div>

        {isHR && (
          <button
            className="btn btn-primary rounded-pill px-4 fw-medium d-flex align-items-center justify-content-center gap-2 shadow-sm w-100 w-md-auto"
            onClick={handleOpenAdd}
            style={{ minHeight: '44px' }}
          >
            <Plus size={18} /> Add New Employee
          </button>
        )}
      </div>

      {msg && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show rounded-4`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMsg(null)} aria-label="Close"></button>
        </div>
      )}

      {/* Filters & Search Toolbar: Responsive Stack */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted" aria-hidden="true">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="Search by name, ID, or title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search employee directory"
                />
                <button className="btn btn-light border" type="submit">
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="col-12 col-sm-6 col-md-4">
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="filter-dept" className="small text-muted fw-semibold text-nowrap">Department:</label>
              <select
                id="filter-dept"
                className="form-select form-select-sm bg-light"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="filter-status" className="small text-muted fw-semibold text-nowrap">Status:</label>
              <select
                id="filter-status"
                className="form-select form-select-sm bg-light"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="active">Active</option>
                <option value="on-leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table (Horizontally Scrollable, Never Forces Page Scroll) */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light small text-secondary">
              <tr>
                <th className="ps-3 ps-sm-4 text-nowrap">Employee</th>
                <th className="text-nowrap">Employee ID</th>
                <th className="text-nowrap">Department & Role</th>
                <th className="text-nowrap">Manager</th>
                <th className="text-nowrap">Status</th>
                <th className="text-nowrap">Joining Date</th>
                {isHR && <th className="text-end pe-3 pe-sm-4 text-nowrap">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isHR ? 7 : 6} className="text-center py-5">
                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    <span className="text-muted small">Loading staff records...</span>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={isHR ? 7 : 6} className="text-center py-5 text-muted small">
                    No employees matching the search criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id}>
                    <td className="ps-3 ps-sm-4">
                      <div className="d-flex align-items-center gap-3 min-w-0">
                        <div
                          className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '38px', height: '38px', fontSize: '14px' }}
                        >
                          {emp.userId?.name?.charAt(0) || 'E'}
                        </div>
                        <div className="min-w-0">
                          <p className="fw-semibold mb-0 text-dark text-truncate">{emp.userId?.name}</p>
                          <span className="text-muted small text-truncate d-block" style={{ maxWidth: '180px' }}>
                            {emp.userId?.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="text-primary fw-semibold">{emp.employeeId}</code>
                    </td>
                    <td>
                      <p className="mb-0 fw-medium small text-dark text-truncate" style={{ maxWidth: '160px' }}>
                        {emp.designation}
                      </p>
                      <span className="text-muted small">{emp.department}</span>
                    </td>
                    <td className="small text-secondary text-truncate" style={{ maxWidth: '140px' }}>
                      {emp.managerId?.name || <span className="text-muted italic">None assigned</span>}
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill text-capitalize ${
                          emp.employmentStatus === 'active'
                            ? 'bg-success-subtle text-success'
                            : emp.employmentStatus === 'on-leave'
                            ? 'bg-warning-subtle text-warning-emphasis'
                            : 'bg-secondary-subtle text-secondary'
                        }`}
                      >
                        {emp.employmentStatus}
                      </span>
                    </td>
                    <td className="small text-muted text-nowrap">
                      {new Date(emp.joiningDate).toLocaleDateString()}
                    </td>
                    {isHR && (
                      <td className="text-end pe-3 pe-sm-4">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-light rounded-circle p-2 text-primary border d-flex align-items-center justify-content-center"
                            title="Edit Details"
                            aria-label={`Edit ${emp.userId?.name}`}
                            onClick={() => handleOpenEdit(emp)}
                            style={{ width: '34px', height: '34px' }}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className={`btn btn-sm rounded-circle p-2 border d-flex align-items-center justify-content-center ${
                              emp.employmentStatus === 'inactive'
                                ? 'btn-outline-success'
                                : 'btn-outline-danger'
                            }`}
                            title={emp.employmentStatus === 'inactive' ? 'Activate Account' : 'Deactivate Account'}
                            aria-label={`${emp.employmentStatus === 'inactive' ? 'Activate' : 'Deactivate'} ${emp.userId?.name}`}
                            onClick={() => handleToggleDeactivate(emp)}
                            style={{ width: '34px', height: '34px' }}
                          >
                            {emp.employmentStatus === 'inactive' ? <UserCheck size={15} /> : <UserX size={15} />}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom p-3 p-sm-4">
                <h5 className="modal-title fw-bold text-dark">Add New Employee Record</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)} aria-label="Close"></button>
              </div>
              <form onSubmit={handleSaveAdd}>
                <div className="modal-body p-3 p-sm-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Full Name <span className="required-asterisk">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Work Email <span className="required-asterisk">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@staffsync.com"
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">System Role</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="hr">HR Administrator</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Department <span className="required-asterisk">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        {departments.filter((d) => d !== 'All').map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">
                        Designation <span className="required-asterisk">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        placeholder="e.g. Senior Software Engineer"
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Assigned Manager</label>
                      <select
                        className="form-select"
                        value={formData.managerId}
                        onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      >
                        <option value="">None</option>
                        {managers.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name} ({m.role})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Annual Salary ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        placeholder="e.g. 85000"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top p-3 d-flex flex-column flex-sm-row justify-content-end gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 w-100 w-sm-auto" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 w-100 w-sm-auto shadow-sm">
                    Create Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom p-3 p-sm-4">
                <h5 className="modal-title fw-bold text-dark text-truncate">
                  Edit: {selectedEmployee.userId?.name} ({selectedEmployee.employeeId})
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} aria-label="Close"></button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-3 p-sm-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Department</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        {departments.filter((d) => d !== 'All').map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Assigned Manager</label>
                      <select
                        className="form-select"
                        value={formData.managerId}
                        onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      >
                        <option value="">None</option>
                        {managers
                          .filter((m) => m._id !== selectedEmployee.userId?._id)
                          .map((m) => (
                            <option key={m._id} value={m._id}>
                              {m.name} ({m.role})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Employment Status</label>
                      <select
                        className="form-select"
                        value={formData.employmentStatus}
                        onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="on-leave">On Leave</option>
                        <option value="inactive">Inactive</option>
                        <option value="terminated">Terminated</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold text-secondary">Annual Salary ($)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top p-3 d-flex flex-column flex-sm-row justify-content-end gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 w-100 w-sm-auto" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 w-100 w-sm-auto shadow-sm">
                    Save Changes
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

export default Employees;
