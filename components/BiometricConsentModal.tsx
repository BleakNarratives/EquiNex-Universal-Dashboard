import React, { useState } from 'react';
import { Shield, Check, X, AlertTriangle } from 'lucide-react';

interface BiometricConsentModalProps {
  onAccept: () => void;
}

const BiometricConsentModal: React.FC<BiometricConsentModalProps> = ({ onAccept }) => {
  const [declined, setDeclined] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-lg font-body">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-2xl text-[var(--color-text-primary)]">
        
        {declined ? (
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-[var(--color-status-degraded-text)] mb-4" />
            <h2 className="text-2xl font-display font-black tracking-wider text-[var(--color-text-primary)] mb-2">Access Denied</h2>
            <p className="text-[var(--color-text-secondary)]">
              Consent to the data use protocol is required to initialize the EquiNex Universal Dashboard.
              Please refresh the page to review the agreement again.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              <Shield className="w-16 h-16 mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)]" />
              <h2 id="consent-title" className="text-2xl font-display font-black tracking-wider">Biometric & Data Use Consent</h2>
              <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                Initialization requires acceptance of the data use protocol.
              </p>
            </div>

            <div className="text-sm text-[var(--color-text-secondary)] space-y-4 font-mono p-4 border border-[var(--color-border)] rounded-lg bg-black/20">
              <p>To enable advanced, adaptive features and contribute to the evolution of the integrated AI systems (including ModMind, AugMind, and the JaneNat Hub), you must consent to the collection and processing of the following data categories:</p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>
                  <strong className="text-[var(--color-text-primary)]">Interaction Metrics:</strong> Analysis of behavioral patterns such as click hesitation, timing, and navigational choices to optimize user experience and predictive models.
                </li>
                <li>
                  <strong className="text-[var(--color-text-primary)]">Device Sensor Data:</strong> (Simulated for this build) Access to gyroscope and accelerometer data for future development of enhanced, physically-aware interaction models.
                </li>
                <li>
                  <strong className="text-[var(--color-text-primary)]">Natural Language Commands:</strong> Collection of all voice and text-based commands to train and improve the "Nat" command system and related AI predictive learning algorithms.
                </li>
              </ul>
              <p className="pt-2">By proceeding, you acknowledge and agree to this data collection for the purposes outlined. This agreement is essential for the full functionality of the ChAImeleon and aFiREFLY systems.</p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setDeclined(true)}
                className="flex items-center justify-center gap-2 border border-[var(--color-border)] text-white font-bold rounded-lg px-6 py-3 transition-all duration-300 hover:bg-[var(--color-border)]"
              >
                <X className="w-5 h-5" />
                Decline
              </button>
              <button
                onClick={onAccept}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)] text-white font-bold rounded-lg px-6 py-3 transition-all duration-300 hover:opacity-90 shadow-lg"
                style={{boxShadow: `0 4px 20px 0 var(--color-primary-from, #000)50`}}
              >
                <Check className="w-5 h-5" />
                Accept & Initialize
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BiometricConsentModal;