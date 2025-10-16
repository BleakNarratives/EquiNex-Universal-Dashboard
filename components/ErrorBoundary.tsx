import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AlertTriangle } from 'lucide-react';

const FallbackComponent: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-main)] text-[var(--color-text-primary)] p-4">
      <div className="glass-panel max-w-2xl text-center border-[var(--color-status-error-bg)] p-8 rounded-xl">
        <AlertTriangle className="w-16 h-16 mx-auto text-[var(--color-status-error-text)] mb-4" />
        <h1 className="text-2xl font-display font-black text-[var(--color-status-error-text)] mb-2">
          A Critical Error Occurred
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-6">
          A subsystem has failed, and the dashboard cannot be displayed. You can try to refresh the application.
        </p>
        <button
          onClick={resetErrorBoundary}
          className="bg-[var(--color-status-error-bg)] text-[var(--color-status-error-text)] font-bold rounded-lg px-6 py-3 transition-all duration-300 hover:opacity-80"
        >
          Refresh Application
        </button>
        {error && (
          <pre className="mt-6 text-left text-xs text-[var(--color-text-tertiary)] bg-black/20 p-4 rounded-md overflow-x-auto">
            <code>
              {error.name}: {error.message}
            </code>
          </pre>
        )}
      </div>
    </div>
  );
};

const logError = (error: Error, info: { componentStack: string }) => {
    console.error("Uncaught error:", error, info.componentStack);
};

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={logError}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
