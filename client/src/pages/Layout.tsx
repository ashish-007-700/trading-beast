import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export default function Layout() {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
