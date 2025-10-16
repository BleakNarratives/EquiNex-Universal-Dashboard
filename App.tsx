import React, { useState } from 'react';
import { AppContextProvider } from './contexts/AppContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FloatingOrbMenu from './components/FloatingOrbMenu';
import SettingsModal from './components/SettingsModal';
import DataWeaveBackground from './components/DataWeaveBackground';
import ErrorBoundary from './components/ErrorBoundary';
import BiometricConsentModal from './components/BiometricConsentModal';
import GlobalAlert from './components/GlobalAlert';

const App: React.FC = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [consentGiven, setConsentGiven] = useState(() => {
        return sessionStorage.getItem('equinex-consent-given') === 'true';
    });

    const handleConsent = () => {
        sessionStorage.setItem('equinex-consent-given', 'true');
        setConsentGiven(true);
    };

    if (!consentGiven) {
        return <BiometricConsentModal onAccept={handleConsent} />;
    }

    return (
        <ErrorBoundary>
            <AppContextProvider>
                <div className="bg-[var(--color-bg-main)] text-[var(--color-text-primary)] min-h-screen font-body relative z-0">
                    <DataWeaveBackground />
                    <GlobalAlert />
                    <Header />
                    <main className="container mx-auto p-4 md:p-6">
                        <Dashboard />
                    </main>
                    <FloatingOrbMenu onOpenSettings={() => setIsSettingsOpen(true)} />
                    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
                </div>
            </AppContextProvider>
        </ErrorBoundary>
    );
};

export default App;
