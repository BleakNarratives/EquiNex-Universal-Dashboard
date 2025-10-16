import React from 'react';
import { useTheme } from '../contexts/AppContext';

const Header: React.FC = () => {
  const { theme, persona } = useTheme();

  return (
    <header className="bg-transparent p-4">
      <div className="container mx-auto flex justify-between items-center border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-from)] to-[var(--color-primary-to)] tracking-wide font-display">
            EquiNex Universal Dashboard
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] font-mono">
            // {theme.displayName.toUpperCase()} :: {persona.toUpperCase()} CORE ACTIVE
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
