import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Maximize } from 'lucide-react';

export const Header = ({ viewMode, setViewMode }) => {
  return (
    <header className="header">
      <h1 className="logo">
        <span className="logo-badge">G</span>
        GameHub
      </h1>

      {/* Switcher Elegante */}
      <div className="header-actions">
        <span className="header-label">View Mode</span>
        
        <div className="view-switcher">
          {/* Sfondo animato dello switch */}
          <motion.div
            className="switcher-bg"
            layout
            initial={false}
            animate={{
              x: viewMode === 'smart' ? 0 : 48 // 48px = larghezza bottone (3rem)
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
          />

          <button
            onClick={() => setViewMode('smart')}
            className={`switcher-btn ${viewMode === 'smart' ? 'active' : ''}`}
            aria-label="Smart View"
          >
            <LayoutGrid size={18} />
          </button>

          <button
            onClick={() => setViewMode('full')}
            className={`switcher-btn ${viewMode === 'full' ? 'active' : ''}`}
            aria-label="Full View"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
