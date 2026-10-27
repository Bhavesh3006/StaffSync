import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Megaphone,
  GraduationCap,
  UserCheck,
  ChevronRight,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role;

  // Close sidebar on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSidebar]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['employee', 'manager', 'hr'],
    },
    {
      name: 'Employees',
      path: '/employees',
      icon: Users,
      roles: ['manager', 'hr'],
    },
    {
      name: 'Attendance',
      path: '/attendance',
      icon: Clock,
      roles: ['employee', 'manager', 'hr'],
    },
    {
      name: 'Leave Management',
      path: '/leaves',
      icon: CalendarDays,
      roles: ['employee', 'manager', 'hr'],
    },
    {
      name: 'Announcements',
      path: '/announcements',
      icon: Megaphone,
      roles: ['employee', 'manager', 'hr'],
    },
    {
      name: 'Training & Skills',
      path: '/trainings',
      icon: GraduationCap,
      roles: ['employee', 'manager', 'hr'],
    },
    {
      name: 'My Profile',
      path: '/profile',
      icon: UserCheck,
      roles: ['employee', 'manager', 'hr'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="modal-backdrop fade show d-lg-none"
          onClick={closeSidebar}
          style={{ zIndex: 1040, backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
          aria-hidden="true"
        />
      )}

      <aside
        id="app-sidebar"
        aria-label="Sidebar Navigation"
        className={`bg-white border-end position-fixed top-0 bottom-0 start-0 d-flex flex-column transition-all ${
          isOpen ? 'translate-none' : 'sidebar-hidden'
        } d-lg-block`}
        style={{
          width: '260px',
          zIndex: 1045,
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Mobile-only Header with Close button */}
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom d-lg-none bg-light">
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
              style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              }}
            >
              S
            </div>
            <span className="fw-bold fs-6">Staff<span className="text-primary">Sync</span></span>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-light border rounded-circle p-1 d-flex align-items-center justify-content-center"
            onClick={closeSidebar}
            aria-label="Close Navigation Sidebar"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Desktop Header Spacer */}
        <div className="px-4 py-3 border-bottom d-none d-lg-block" style={{ marginTop: '58px' }}>
          <p
            className="text-uppercase text-muted fw-bold mb-0"
            style={{ fontSize: '11px', letterSpacing: '0.08em' }}
          >
            Main Navigation
          </p>
        </div>

        {/* Navigation list */}
        <div className="p-3 flex-grow-1 overflow-auto">
          <ul className="nav nav-pills flex-column gap-1 list-unstyled mb-0">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <li className="nav-item" key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center justify-content-between rounded-3 py-2 px-3 fw-medium ${
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-secondary hover-bg-light'
                      }`
                    }
                    style={{ minHeight: '44px' }}
                  >
                    <div className="d-flex align-items-center gap-3 min-w-0">
                      <Icon size={18} className="flex-shrink-0" />
                      <span className="small text-truncate">{item.name}</span>
                    </div>
                    <ChevronRight size={14} className="opacity-50 flex-shrink-0" />
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* System info badge at bottom */}
        <div className="p-3 border-top mt-auto bg-light m-3 rounded-4">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              className="badge bg-success-subtle text-success border border-success-subtle p-1 rounded-circle"
              style={{ width: '8px', height: '8px' }}
            ></span>
            <span className="small fw-semibold text-dark">StaffSync Cloud</span>
          </div>
          <p className="text-muted mb-0 small" style={{ fontSize: '11px' }}>
            Active Role: <strong className="text-capitalize">{role}</strong>
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
