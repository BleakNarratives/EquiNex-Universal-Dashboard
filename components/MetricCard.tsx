import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon }) => {
  return (
    <div className="glass-panel p-5 rounded-xl flex items-center space-x-4">
      <div className="p-3 rounded-full bg-gradient-to-br from-[var(--color-primary-from)]/20 to-transparent">
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)]">
            {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-[var(--color-text-secondary)] font-mono uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-[var(--color-text-primary)]">{value}</p>
      </div>
    </div>
  );
};

export default MetricCard;
