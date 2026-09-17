import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

/**
 * Main application shell: sticky Navbar + scrollable page content.
 * Wrap any role-guarded route group with this to get the shared chrome.
 */
export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar />
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
