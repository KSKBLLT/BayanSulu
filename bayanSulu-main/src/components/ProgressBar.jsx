import React from 'react';
function ProgressBar({ value, max, label }) {
  const safeMax = Math.max(max, 1);
  const percent = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div className="progress">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-track" aria-label={label || `Прогресс ${value} из ${max}`}>
        <span className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default ProgressBar;
