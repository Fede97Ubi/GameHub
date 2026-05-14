import React from 'react';

const Layout = ({ children, header }) => {
  return (
    <div className="app-root antialiased">
      {header}
      
      <main className="app-main">
        {children}
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Game Library. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
