import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  badgeText,
  badgeBg = 'bg-primary-subtle text-primary border border-primary-subtle',
  color = 'primary',
  progress,
  onClick,
}) => {
  const colorMap = {
    primary: { bg: 'bg-primary-subtle', text: 'text-primary', border: '#4f46e5' },
    success: { bg: 'bg-success-subtle', text: 'text-success', border: '#10b981' },
    warning: { bg: 'bg-warning-subtle', text: 'text-warning-emphasis', border: '#f59e0b' },
    danger: { bg: 'bg-danger-subtle', text: 'text-danger', border: '#ef4444' },
    info: { bg: 'bg-info-subtle', text: 'text-info-emphasis', border: '#06b6d4' },
  };

  const currentTheme = colorMap[color] || colorMap.primary;

  return (
    <div
      className={`card border-0 shadow-sm rounded-4 h-100 kpi-card ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="card-body p-3 p-sm-4 d-flex flex-column justify-content-between">
        <div>
          {/* Header Row: Icon & Badge/Trend */}
          <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
            {Icon && (
              <div
                className={`kpi-icon-wrapper ${currentTheme.bg} ${currentTheme.text} shadow-xs flex-shrink-0`}
                aria-hidden="true"
              >
                <Icon size={22} />
              </div>
            )}

            <div className="d-flex align-items-center gap-1">
              {trend && (
                <span
                  className={`badge rounded-pill px-2 py-1 small fw-semibold d-inline-flex align-items-center gap-1 ${
                    trend > 0 ? 'stat-trend-up' : 'stat-trend-down'
                  }`}
                  style={{ fontSize: '11px' }}
                >
                  {trend > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>
              )}
              {badgeText && (
                <span
                  className={`badge rounded-pill px-2.5 py-1 fw-semibold flex-shrink-0 ${badgeBg}`}
                  style={{ fontSize: '11px' }}
                >
                  {badgeText}
                </span>
              )}
            </div>
          </div>

          {/* Metric Value & Label */}
          <div>
            <span
              className="text-secondary small fw-semibold text-uppercase ls-wide text-truncate d-block mb-1"
              style={{ fontSize: '11px', letterSpacing: '0.06em' }}
            >
              {title}
            </span>
            <h3
              className="fw-bold mb-0 text-dark text-truncate"
              style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2rem)', letterSpacing: '-0.02em' }}
            >
              {value}
            </h3>
          </div>
        </div>

        {/* Footer / Progress Bar / Subtitle */}
        <div className="mt-3 pt-2 border-top border-light">
          {progress !== undefined && (
            <div className="mb-2">
              <div className="progress rounded-pill" style={{ height: '5px' }}>
                <div
                  className="progress-bar rounded-pill"
                  role="progressbar"
                  style={{
                    width: `${Math.min(100, Math.max(0, progress))}%`,
                    backgroundColor: currentTheme.border,
                  }}
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>
          )}

          {subtitle && (
            <p className="text-muted small mb-0 text-break-word d-flex align-items-center justify-content-between" style={{ fontSize: '12px' }}>
              <span>{subtitle}</span>
              {trendLabel && <span className="text-secondary ms-1 fw-medium">{trendLabel}</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
