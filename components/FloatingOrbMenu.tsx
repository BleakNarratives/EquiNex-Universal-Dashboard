import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Settings, Mic, MicOff, RotateCcw } from 'lucide-react';
import { useVoiceConnection } from '../contexts/AppContext';
import { useAesthesis } from '../hooks/useAesthesis';

interface FloatingOrbMenuProps {
  onOpenSettings: () => void;
}

const OrbMenuItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  action: () => void;
  style: React.CSSProperties;
  disabled: boolean;
}> = ({ label, icon, action, style, disabled }) => {
  const { handlers, isPressed } = useAesthesis({ onActivate: action });
  return (
    <button
      {...handlers}
      disabled={disabled}
      aria-label={label}
      className={`absolute transition-all duration-300 ease-out
        bg-indigo-600/75 backdrop-blur-sm border border-cyan-500/50 rounded-full w-16 h-16
        flex items-center justify-center text-cyan-400
        hover:border-cyan-400 hover:text-cyan-300
        disabled:opacity-50 disabled:cursor-not-allowed`}
      style={{
        ...style,
        transform: `${style.transform} ${isPressed ? 'scale(0.95)' : 'scale(1)'}`,
        willChange: 'transform, opacity',
      }}
    >
      {icon}
    </button>
  );
};

const HotCorner: React.FC<{ onActivate: () => void; position: string }> = ({ onActivate, position }) => (
    <div
        onPointerEnter={onActivate}
        className={`fixed ${position} w-24 h-24 z-30`}
    />
);

const FloatingOrbMenu: React.FC<FloatingOrbMenuProps> = ({ onOpenSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const { status, toggleConnection } = useVoiceConnection();
  const idleTimerRef = useRef<number | null>(null);
  
  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => setIsIdle(true), 5000);
  };

  useEffect(() => {
      resetIdleTimer();
      window.addEventListener('pointermove', resetIdleTimer);
      window.addEventListener('keydown', resetIdleTimer);
      
      return () => {
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
          window.removeEventListener('pointermove', resetIdleTimer);
          window.removeEventListener('keydown', resetIdleTimer);
      }
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const isConnecting = status === 'CONNECTING';
  const isConnected = status === 'CONNECTED';

  const menuItems = [
    {
      label: 'Settings',
      icon: <Settings className="w-6 h-6" />,
      action: () => { onOpenSettings(); setIsOpen(false); },
      baseStyle: { transform: 'translate(0, -85px)' },
      disabled: false,
    },
    {
      label: isConnected ? 'Disconnect' : 'Connect',
      icon: isConnected ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />,
      action: () => { toggleConnection(); setIsOpen(false); },
      baseStyle: { transform: 'translate(-60px, -60px)' },
      disabled: isConnecting,
    },
    {
      label: 'Clear & Refresh',
      icon: <RotateCcw className="w-6 h-6" />,
      action: handleRefresh,
      baseStyle: { transform: 'translateX(-85px)' },
      disabled: false,
    },
  ];

  return (
    <>
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/50 z-30" />}
      
      <HotCorner onActivate={resetIdleTimer} position="top-0 left-0" />
      <HotCorner onActivate={resetIdleTimer} position="top-0 right-0" />
      <HotCorner onActivate={resetIdleTimer} position="bottom-0 left-0" />
      <HotCorner onActivate={resetIdleTimer} position="bottom-0 right-0" />
      
      <div className={`fixed bottom-6 right-6 z-40 transition-opacity duration-700 ${isIdle ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
        <div className="relative flex items-center justify-center">
          {menuItems.map((item, index) => (
            <OrbMenuItem
              key={item.label}
              {...item}
              style={{
                ...item.baseStyle,
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? item.baseStyle.transform : 'translate(0,0)',
                pointerEvents: isOpen ? 'auto' : 'none',
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
              }}
            />
          ))}

          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label="Open system menu"
            className={`relative w-20 h-20 bg-indigo-700/75 border-2 border-cyan-400 rounded-full flex items-center justify-center text-cyan-400 shadow-2xl shadow-black/60 hover:border-cyan-300 hover:text-cyan-300 hover:bg-indigo-700/90 transition-all duration-300 z-10 ${isIdle ? 'pointer-events-auto' : ''}`}
          >
            <Sparkles className={`w-9 h-9 transition-transform duration-500 ease-in-out ${isOpen ? 'rotate-90 scale-110' : 'rotate-0'}`} />
          </button>
        </div>
      </div>
    </>
  );
};

export default FloatingOrbMenu;
