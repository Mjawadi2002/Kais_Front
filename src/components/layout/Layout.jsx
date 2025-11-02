import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ children }) {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar />
      <div className="flex-grow-1">
        <Topbar />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
