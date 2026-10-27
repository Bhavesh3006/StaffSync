import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API from '../services/api.js';
import {
  Megaphone,
  Plus,
  Search,
  Calendar,
  AlertCircle,
  Tag,
  Trash2,
} from 'lucide-react';

const Announcements = () => {
  const { user } = useSelector((state) => state.auth);
  const isHR = user?.role === 'hr';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState(null);

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Company News',
    priority: 'medium',
    targetAudience: 'all',
  });

  const categories = [
    'All',
    'Company News',
    'Holidays',
    'Policy Updates',
    'Events',
    'Important Notices',
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, [category]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'All') params.category = category;
      if (search) params.search = search;

      const res = await API.get('/announcements', { params });
      if (res.data.success) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAnnouncements();
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/announcements', formData);
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Announcement published successfully!' });
        setShowModal(false);
        setFormData({
          title: '',
          content: '',
          category: 'Company News',
          priority: 'medium',
          targetAudience: 'all',
        });
        fetchAnnouncements();
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to create announcement' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await API.delete(`/announcements/${id}`);
      if (res.data.success) {
        setMsg({ type: 'success', text: 'Announcement removed' });
        fetchAnnouncements();
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Delete failed' });
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-danger text-white';
      case 'high':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'low':
        return 'bg-light text-muted border';
      default:
        return 'bg-primary-subtle text-primary border border-primary-subtle';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>
            Company Announcements
          </h2>
          <p className="text-secondary small mb-0">
            Official communications, policy publications, upcoming holidays, and team events
          </p>
        </div>

        {isHR && (
          <button
            className="btn btn-primary rounded-pill px-4 fw-medium d-flex align-items-center justify-content-center gap-2 shadow-sm w-100 w-md-auto"
            onClick={() => setShowModal(true)}
            style={{ minHeight: '44px' }}
          >
            <Plus size={18} /> Broadcast Announcement
          </button>
        )}
      </div>

      {msg && (
        <div className={`alert alert-${msg.type} alert-dismissible fade show rounded-4`} role="alert">
          {msg.text}
          <button type="button" className="btn-close" onClick={() => setMsg(null)} aria-label="Close"></button>
        </div>
      )}

      {/* Filter and Category Pills: Responsive */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-12 col-lg-7">
            <div className="d-flex gap-2 overflow-auto text-nowrap pb-1">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`btn btn-sm rounded-pill px-3 fw-medium flex-shrink-0 ${
                    category === c ? 'btn-primary shadow-sm' : 'btn-light text-secondary border'
                  }`}
                  onClick={() => setCategory(c)}
                  style={{ minHeight: '36px' }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <form onSubmit={handleSearch}>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted" aria-hidden="true">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm bg-light border-start-0"
                  placeholder="Search announcements..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search announcements"
                />
                <button className="btn btn-sm btn-light border" type="submit">
                  Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Announcements List: Responsive Card Grid (1 col phone, 2 col tablet, 3 col desktop) */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
          <span className="text-muted small">Loading communications...</span>
        </div>
      ) : announcements.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <Megaphone size={40} className="text-muted mx-auto mb-3" />
          <h5 className="fw-bold text-dark">No Announcements Found</h5>
          <p className="text-muted small mb-0">Check back later or change your category filter.</p>
        </div>
      ) : (
        <div className="row g-3 g-sm-4">
          {announcements.map((item) => (
            <div key={item._id} className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 h-100 p-3 p-sm-4 bg-white d-flex flex-column justify-content-between hover-card">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
                    <span className="badge bg-secondary-subtle text-secondary rounded-pill px-3 py-1 small text-truncate">
                      {item.category}
                    </span>
                    <span className={`badge rounded-pill px-2 py-1 text-uppercase small flex-shrink-0 ${getPriorityBadge(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-2 text-break-word">{item.title}</h5>
                  <p className="text-secondary small mb-3 text-break-word" style={{ whiteSpace: 'pre-line' }}>
                    {item.content}
                  </p>
                </div>

                <div className="border-top pt-3 mt-3 d-flex justify-content-between align-items-center gap-2">
                  <div className="small text-muted min-w-0">
                    <span className="d-block text-truncate">Published by <strong>{item.publishedBy?.name}</strong></span>
                    <div style={{ fontSize: '11px' }}>
                      {new Date(item.publishDate || item.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {isHR && (
                    <button
                      className="btn btn-sm btn-light text-danger rounded-circle p-2 border flex-shrink-0 d-flex align-items-center justify-content-center"
                      title="Delete"
                      aria-label="Delete announcement"
                      onClick={() => handleDelete(item._id)}
                      style={{ width: '34px', height: '34px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Announcement Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom p-3 p-sm-4">
                <h5 className="modal-title fw-bold text-dark">Broadcast Company Announcement</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} aria-label="Close"></button>
              </div>
              <form onSubmit={handleCreateAnnouncement}>
                <div className="modal-body p-3 p-sm-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Subject / Title <span className="required-asterisk">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Q4 Company All-Hands & Strategy Meeting"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-12 col-sm-4">
                      <label className="form-label small fw-semibold text-secondary">Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {categories.filter((c) => c !== 'All').map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-sm-4">
                      <label className="form-label small fw-semibold text-secondary">Priority</label>
                      <select
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div className="col-12 col-sm-4">
                      <label className="form-label small fw-semibold text-secondary">Audience</label>
                      <select
                        className="form-select"
                        value={formData.targetAudience}
                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      >
                        <option value="all">Everyone (All)</option>
                        <option value="employees">Employees Only</option>
                        <option value="managers">Managers Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">
                      Content & Message <span className="required-asterisk">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      required
                      placeholder="Write announcement body here..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top p-3 d-flex flex-column flex-sm-row justify-content-end gap-2">
                  <button type="button" className="btn btn-light rounded-pill px-4 w-100 w-sm-auto" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 w-100 w-sm-auto shadow-sm">
                    Publish Announcement
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

export default Announcements;
