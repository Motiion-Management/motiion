import React from 'react';

export default function AdminPage() {
  return (
    <div>
      <header>
        <h1>Admin Panel</h1>
        <nav>
          <ul>
            <li><a href="#users">Manage Users</a></li>
            <li><a href="#settings">Settings</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <section id="users">
          <h2>Manage Users</h2>
          {/* User management components will go here */}
        </section>
        <section id="settings">
          <h2>Settings</h2>
          {/* Settings management components will go here */}
        </section>
      </main>
    </div>
  );
}
