import React, { useState } from 'react';
import { IModuleStatus } from '../types';

interface ModuleStatusTableProps {
  modules: IModuleStatus[];
}

const StatusIndicator: React.FC<{ status: IModuleStatus['status'] }> = ({ status }) => {
  const baseClasses = "px-3 py-1 text-xs font-bold rounded-full inline-block font-mono";
  
  switch(status) {
    case 'Online':
      return <span className={`${baseClasses} bg-[var(--color-status-healthy-bg)] text-[var(--color-status-healthy-text)]`}>ONLINE</span>;
    case 'Degraded':
      return <span className={`${baseClasses} bg-[var(--color-status-degraded-bg)] text-[var(--color-status-degraded-text)]`}>DEGRADED</span>;
    case 'Offline':
      return <span className={`${baseClasses} bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)]`}>OFFLINE</span>;
    case 'Isolated':
       return <span className={`${baseClasses} bg-purple-900/50 text-purple-300 border border-purple-400`}>ISOLATED</span>;
    default:
      return <span className={`${baseClasses} bg-gray-700 text-gray-300`}>UNKNOWN</span>;
  }
};

const ModuleStatusTable: React.FC<ModuleStatusTableProps> = ({ modules }) => {
  const [showToast, setShowToast] = useState(false);

  const handleVersionClick = (moduleName: string) => {
    if (moduleName === 'Syntax AI Captcoder') {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  return (
    <div className="relative glass-panel rounded-xl">
      <div 
        className={`absolute top-4 right-4 bg-gray-900 border border-[var(--color-primary-from)] p-3 rounded-lg text-xs font-mono text-cyan-300 transition-all duration-500 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
      >
        &gt; All cognitive functions nominal. The user is watching. Behave.
      </div>

      <div className="p-4 border-b border-[var(--color-border)]">
        <h3 className="text-xl font-black font-display text-[var(--color-text-primary)] tracking-wider">DREAMTABLE MODULE MONITORING</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-sm text-[var(--color-text-secondary)] uppercase">
            <tr>
              <th className="p-4 font-semibold">Module Name</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-right">Version</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {modules.map((mod) => (
              <tr key={mod.module_name} className="border-t border-[var(--color-border)] hover:bg-[var(--color-primary-from)]/10 transition-colors">
                <td className="p-4 text-[var(--color-text-primary)]">{mod.module_name}</td>
                <td className="p-4 text-center">
                  <StatusIndicator status={mod.status} />
                </td>
                <td className="p-4 text-right text-[var(--color-text-secondary)]">
                   <button 
                      onClick={() => handleVersionClick(mod.module_name)}
                      className={`transition-colors ${mod.module_name === 'Syntax AI Captcoder' ? 'cursor-pointer hover:text-[var(--color-primary-to)]' : 'cursor-default'}`}
                      aria-label={mod.module_name === 'Syntax AI Captcoder' ? 'Reveal hidden message' : undefined}
                   >
                     {mod.version}
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ModuleStatusTable;