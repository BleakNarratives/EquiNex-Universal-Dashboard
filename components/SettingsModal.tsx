import React, { useRef } from 'react';
import { Settings as SettingsIcon, X, Download, Upload } from 'lucide-react';
import { useTheme } from '../contexts/AppContext';
import { UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, exportProfile, importProfile } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const result = e.target?.result;
            if (typeof result === 'string') {
                const profile = JSON.parse(result) as UserProfile;
                importProfile(profile);
                onClose();
            }
        } catch (error) {
            console.error("Failed to parse profile JSON:", error);
            // In a real app, you might trigger an alert here
        }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md" onClick={onClose} role="dialog" aria-modal="true">
      <div className="glass-panel p-6 rounded-xl w-full max-w-lg relative text-[var(--color-text-primary)]" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" aria-label="Close settings">
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center mb-6">
          <SettingsIcon className="w-8 h-8 mr-4 text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)]" />
          <h2 id="settings-title" className="text-2xl font-display font-black tracking-wider">Configuration</h2>
        </div>
        
        <div className="space-y-4">
            <p className="font-sans text-sm text-[var(--color-text-secondary)]">
              The application is configured to use the Google Gemini API. Your API key is managed securely as an environment variable.
            </p>
            <div className="border-t border-[var(--color-border)] my-4"></div>
            <h3 className="font-display font-bold text-lg">User Profile Transfer</h3>
            <p className="font-sans text-sm text-[var(--color-text-secondary)]">
              Export your current settings (persona, theme) to a JSON file to transfer your profile across devices or sessions.
            </p>
            <div className="flex gap-4 mt-2">
                <button onClick={exportProfile} className="flex-1 flex items-center justify-center gap-2 border border-[var(--color-border)] text-white font-bold rounded-lg px-4 py-2 transition-all duration-300 hover:bg-[var(--color-border)]">
                    <Download className="w-4 h-4" /> Export Profile
                </button>
                <button onClick={handleImportClick} className="flex-1 flex items-center justify-center gap-2 border border-[var(--color-border)] text-white font-bold rounded-lg px-4 py-2 transition-all duration-300 hover:bg-[var(--color-border)]">
                    <Upload className="w-4 h-4" /> Import Profile
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            </div>
        </div>

        <div className="mt-8 flex justify-end">
            <button
                onClick={onClose}
                className="flex items-center gap-2 bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)] text-white font-bold rounded-lg px-6 py-2 transition-all duration-300 hover:opacity-90 shadow-lg"
                style={{boxShadow: `0 4px 15px 0 ${theme.properties['--color-primary-from']}80`}}
            >
                <X className="w-5 h-5" />
                Close
            </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
