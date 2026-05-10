import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="h-screen w-full relative antialiased flex flex-col overflow-hidden">
      <header className="shrink-0 z-50 w-full backdrop-blur-md bg-zinc-950/80 border-b border-white/10 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">GameHub</h1>
      </header>
      
      <main className="flex-1 w-full max-w-screen-2xl mx-auto p-6 overflow-hidden flex flex-col">
        {children}
      </main>
      
      <footer className="shrink-0 w-full border-t border-white/10 px-6 py-4 text-center text-sm text-zinc-500">
        <p>&copy; {new Date().getFullYear()} Game Library. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
