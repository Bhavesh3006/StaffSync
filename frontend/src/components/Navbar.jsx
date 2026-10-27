import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice.js';
import { setNotifications, markOneAsRead, markAllRead } from '../store/notificationSlice.js';
import API from '../services/api.js';
import {
  Bell,
  User,
  LogOut,
  Menu,
  CheckCircle2,
  Calendar,
  AlertCircle,
  BookOpen,
  Info,
  X,
} from 'lucide-react';

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, employee } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close menus on page route changes
  useEffect(() => {
    setShowNotifs(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  // Click outside and escape key listeners
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowNotifs(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data.success) {
        dispatch(
          setNotifications({
            notifications: res.data.notifications,
            unreadCount: res.data.unreadCount,
          })
        );
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleMarkAsRead = async (id, link) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      dispatch(markOneAsRead(id));
      if (link) {
        setShowNotifs(false);
        navigate(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      dispatch(markAllRead());
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'hr':
        return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'manager':
        return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      default:
        return 'bg-info-subtle text-info-emphasis border border-info-subtle';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave':
        return <Calendar size={16} className="text-primary flex-shrink-0" />;
      case 'attendance':
        return <CheckCircle2 size={16} className="text-success flex-shrink-0" />;
      case 'training':
        return <BookOpen size={16} className="text-info flex-shrink-0" />;
      case 'announcement':
        return <AlertCircle size={16} className="text-warning flex-shrink-0" />;
      default:
        return <Info size={16} className="text-secondary flex-shrink-0" />;
    }
  };

  return (
    <nav
      className="navbar navbar-expand bg-white border-bottom sticky-top px-2 px-sm-3 px-md-4 py-2"
      role="navigation"
      aria-label="Main Navigation"
      style={{ zIndex: 1030 }}
    >
      <div className="d-flex align-items-center gap-2 gap-sm-3 min-w-0">
        <button
          className="btn btn-light d-lg-none p-2 border d-flex align-items-center justify-content-center"
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Close Navigation Sidebar' : 'Open Navigation Sidebar'}
          aria-expanded={sidebarOpen}
          style={{ width: '40px', height: '40px' }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link
          to="/dashboard"
          className="navbar-brand d-flex align-items-center gap-2 fw-bold text-dark m-0 min-w-0"
        >
          <div
            className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0"
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            }}
          >
            S
          </div>
          <span className="fs-5 tracking-tight d-none d-sm-inline">
            Staff<span className="text-primary">Sync</span>
          </span>
        </Link>
      </div>

      <div className="ms-auto d-flex align-items-center gap-2 gap-sm-3 flex-shrink-0">
        {/* Role badge */}
        <span
          className={`badge rounded-pill px-2 px-sm-3 py-1 text-uppercase fw-semibold ${getRoleBadgeClass(
            user?.role
          )}`}
          style={{ fontSize: '11px' }}
        >
          {user?.role === 'hr' ? 'HR Admin' : user?.role}
        </span>

        {/* Notifications Dropdown */}
        <div className="dropdown position-relative" ref={notifRef}>
          <button
            className="btn btn-light rounded-circle position-relative p-2 border d-flex align-items-center justify-content-center"
            type="button"
            onClick={() => {
              setShowNotifs(!showNotifs);
              setShowUserMenu(false);
            }}
            aria-label="Notifications"
            aria-expanded={showNotifs}
            style={{ width: '40px', height: '40px' }}
          >
            <Bell size={18} className="text-secondary" />
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
                <span className="visually-hidden">unread notifications</span>
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              className="dropdown-menu dropdown-menu-end show border-0 shadow-lg rounded-4 p-0 mt-2 dropdown-menu-responsive"
              style={{
                width: 'min(360px, calc(100vw - 20px))',
                maxHeight: '420px',
                zIndex: 1050,
                right: 0,
              }}
            >
              <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-white rounded-top-4">
                <span className="fw-bold text-dark small">Notifications ({unreadCount} new)</span>
                {unreadCount > 0 && (
                  <button
                    className="btn btn-link btn-sm p-0 text-decoration-none small"
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-auto" style={{ maxHeight: '320px' }}>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted small">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleMarkAsRead(n._id, n.link)}
                      className={`p-3 border-bottom dropdown-item d-flex gap-2 align-items-start ${
                        !n.isRead ? 'bg-light' : ''
                      }`}
                      style={{ whiteSpace: 'normal', cursor: 'pointer' }}
                    >
                      <div className="mt-1">{getNotificationIcon(n.type)}</div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex justify-content-between align-items-center gap-1">
                          <p className="fw-semibold mb-0 small text-dark text-truncate">{n.title}</p>
                          {!n.isRead && (
                            <span
                              className="badge bg-primary p-1 rounded-circle flex-shrink-0"
                              style={{ width: '6px', height: '6px' }}
                            ></span>
                          )}
                        </div>
                        <p className="text-secondary small mb-1 text-break-word" style={{ fontSize: '12px' }}>
                          {n.message}
                        </p>
                        <span className="text-muted" style={{ fontSize: '10px' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu Dropdown */}
        <div className="dropdown position-relative" ref={userMenuRef}>
          <button
            className="btn btn-light d-flex align-items-center gap-2 p-1 pe-2 rounded-pill border"
            type="button"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifs(false);
            }}
            aria-label="User Profile Menu"
            aria-expanded={showUserMenu}
          >
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-semibold flex-shrink-0"
              style={{ width: '32px', height: '32px', fontSize: '13px' }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="d-none d-md-inline small fw-semibold text-dark text-truncate" style={{ maxWidth: '120px' }}>
              {user?.name?.split(' ')[0]}
            </span>
          </button>

          {showUserMenu && (
            <div
              className="dropdown-menu dropdown-menu-end show border-0 shadow-lg rounded-4 p-2 mt-2 dropdown-menu-responsive"
              style={{ minWidth: '220px', maxWidth: 'calc(100vw - 20px)', zIndex: 1050, right: 0 }}
            >
              <div className="px-3 py-2 border-bottom mb-2 min-w-0">
                <p className="fw-bold mb-0 text-dark small text-truncate">{user?.name}</p>
                <p className="text-muted mb-0 small text-truncate" style={{ fontSize: '12px' }}>
                  {user?.email}
                </p>
                {employee && (
                  <span className="badge bg-light text-secondary border mt-1" style={{ fontSize: '10px' }}>
                    ID: {employee.employeeId}
                  </span>
                )}
              </div>

              <Link
                to="/profile"
                className="dropdown-item d-flex align-items-center gap-2 rounded-3 py-2 small"
                onClick={() => setShowUserMenu(false)}
              >
                <User size={16} className="text-secondary" />
                <span>My Profile</span>
              </Link>

              <hr className="dropdown-divider my-1" />

              <button
                className="dropdown-item d-flex align-items-center gap-2 rounded-3 py-2 small text-danger"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
