import React from 'react';

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeBg = 'bg-primary-subtle text-primary border border-primary-subtle',
  color = 'primary',
  onClick,
}) => {
  return (
    <div
      className={`card border-0 shadow-sm rounded-4 h-100 ${
        onClick ? 'cursor-pointer hover-card' : ''
      }`}
      onClick={onClick}
    >
      <div className="card-body p-3 p-sm-4 d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
            <div className="d-flex align-items-center gap-2 gap-sm-3 min-w-0">
              {Icon && (
                <div
                  className={`d-flex align-items-center justify-content-center rounded-3 bg-${color}-subtle text-${color} flex-shrink-0`}
                  style={{ width: '42px', height: '42px' }}
                  aria-hidden="true"
                >
                  <Icon size={22} />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-secondary small fw-medium text-uppercase ls-wide text-truncate d-block" style={{ fontSize: '11px' }}>
                  {title}
                </span>
                <h3 className="fw-bold mb-0 mt-0 text-dark text-truncate" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
                  {value}
                </h3>
              </div>
            </div>

            {badgeText && (
              <span
                className={`badge rounded-pill px-2 py-1 fw-semibold flex-shrink-0 ${badgeBg}`}
                style={{ fontSize: '11px' }}
              >
                {badgeText}
              </span>
            )}
          </div>
        </div>

        {subtitle && (
          <p className="text-muted small mb-0 mt-2 text-break-word" style={{ fontSize: '12px' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
