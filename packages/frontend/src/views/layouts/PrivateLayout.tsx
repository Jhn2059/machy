import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['ADMIN', 'SELLER'] },
  { path: '/sales', label: 'Ventas', icon: '🛒', roles: ['ADMIN', 'SELLER'] },
  { path: '/sales/history', label: 'Historial', icon: '📋', roles: ['ADMIN', 'SELLER'] },
  { path: '/products', label: 'Productos', icon: '📦', roles: ['ADMIN', 'SELLER'] },
  { path: '/inventory', label: 'Inventario', icon: '📈', roles: ['ADMIN', 'SELLER'] },
  { path: '/categories', label: 'Categorías', icon: '🏷️', roles: ['ADMIN'] },
  { path: '/suppliers', label: 'Proveedores', icon: '🏭', roles: ['ADMIN'] },
  { path: '/users', label: 'Usuarios', icon: '👥', roles: ['ADMIN'] },
  { path: '/attendance', label: 'Asistencia', icon: '🕐', roles: ['ADMIN'] },
  { path: '/config', label: 'Configuración', icon: '⚙️', roles: ['ADMIN'] },
];

export default function PrivateLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter((item) => isAdmin || item.roles.includes('SELLER'));

  const SidebarContent = () => (
    <nav className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">📚</span>
          <div>
            <h1 className="text-lg font-bold text-machy-800">Machy</h1>
            <p className="text-xs text-gray-500">Sistema de Ventas</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = (() => {
            const loc = location.pathname;
            if (loc === item.path) return true;
            if (!loc.startsWith(item.path + '/')) return false;
            const suffix = loc.slice(item.path.length);
            if (suffix.includes('/')) {
              const betterMatch = filteredNav.some(
                (n) => n.path !== item.path && loc.startsWith(n.path + '/') && n.path.length > item.path.length,
              );
              if (betterMatch) return false;
            }
            return true;
          })();
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                isActive
                  ? 'bg-machy-100 text-machy-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-machy-100 flex items-center justify-center text-sm font-bold text-machy-700">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role === 'ADMIN' ? 'Administrador' : 'Vendedor'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-secondary w-full text-sm py-2 min-h-[40px]">
          Cerrar sesión
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-white border-r">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar - Mobile */}
        <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-secondary p-2 min-h-[44px] min-w-[44px]"
            aria-label="Abrir menú"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-machy-800">Machy</span>
          <div className="w-11" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
