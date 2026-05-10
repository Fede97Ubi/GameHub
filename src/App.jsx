import React from 'react';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Layout>
      <div className="w-full h-full flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-4xl font-bold mb-4">Welcome to GameHub</h2>
        <p className="text-zinc-400 text-lg">Your high-performance game library is ready.</p>
      </div>
    </Layout>
  );
}

export default App;
