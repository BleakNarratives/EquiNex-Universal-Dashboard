import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface SystemHealthProps {
  overall_status: 'HEALTHY' | 'DEGRADED' | 'ERROR';
  pattern_journal_summary: string;
}

const statusConfig = {
  HEALTHY: {
    text: 'SYSTEM HEALTHY',
    icon: <ShieldCheck className="w-7 h-7 mr-3" />,
    style: 'bg-[var(--color-status-healthy-bg)] text-[var(--color-status-healthy-text)]',
    glow: 'shadow-[0_0_20px_var(--color-status-healthy-bg)]',
  },
  DEGRADED: {
    text: 'SYSTEM DEGRADED',
    icon: <ShieldAlert className="w-7 h-7 mr-3" />,
    style: 'bg-[var(--color-status-degraded-bg)] text-[var(--color-status-degraded-text)]',
    glow: 'shadow-[0_0_20px_var(--color-status-degraded-bg)]',
  },
  ERROR: {
    text: 'SYSTEM ERROR',
    icon: <ShieldX className="w-7 h-7 mr-3" />,
    style: 'bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]',
    glow: 'shadow-[0_0_20px_var(--color-status-error-bg)]',
  }
};

const SystemHealth: React.FC<SystemHealthProps> = ({ overall_status, pattern_journal_summary }) => {
  const config = statusConfig[overall_status];

  return (
    <div className={`border border-current/20 p-5 rounded-xl flex flex-col md:flex-row items-start ${config.style} ${config.glow}`}>
      <div className="flex items-center mb-2 md:mb-0 md:mr-6 flex-shrink-0">
        {config.icon}
        <h2 className="text-xl font-display font-black tracking-wider">{config.text}</h2>
      </div>
      <div className="flex-1 border-t border-current/20 md:border-t-0 md:border-l md:border-current/20 mt-3 md:mt-0 pt-3 md:pt-0 md:pl-6">
        <p className="text-[var(--color-text-tertiary)] font-mono text-sm leading-relaxed">
          <span className="font-bold text-[var(--color-text-secondary)]">[PATTERN_JOURNAL]: </span> 
          {pattern_journal_summary}
        </p>
      </div>
    </div>
  );
};

export default SystemHealth;