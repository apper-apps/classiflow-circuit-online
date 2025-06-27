import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';
import { routeArray } from '@/config/routes';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const mainNavItems = routeArray.filter(route => 
    ['home', 'browse', 'postAd', 'myListings'].includes(route.id)
  );

const adminNavItems = routeArray.filter(route => 
    ['admin', 'categories', 'branding'].includes(route.id)
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-surface-200 z-40">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-surface-100 transition-colors"
            >
              <ApperIcon name="Menu" size={20} />
            </button>
            <h1 className="text-xl font-bold text-surface-900">ClassiFlow Pro</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-surface-100 rounded-lg px-3 py-2">
              <ApperIcon name="Search" size={16} className="text-surface-500" />
              <input
                type="text"
                placeholder="Search listings..."
                className="bg-transparent border-none outline-none text-sm w-64"
              />
            </div>
            <button className="p-2 rounded-md hover:bg-surface-100 transition-colors">
              <ApperIcon name="Bell" size={20} className="text-surface-600" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          w-64 bg-white border-r border-surface-200 overflow-y-auto z-50
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'fixed inset-y-0 left-0' : 'fixed inset-y-0 -left-64'}
          transition-transform duration-300 ease-in-out
        `}>
          <nav className="p-4 space-y-6">
            {/* Main Navigation */}
            <div>
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
                Marketplace
              </h3>
              <ul className="space-y-1">
                {mainNavItems.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-primary text-white' 
                          : 'text-surface-700 hover:bg-surface-100'
                        }
                      `}
                    >
                      <ApperIcon name={item.icon} size={18} />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Admin Navigation */}
            <div>
              <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
                Administration
              </h3>
              <ul className="space-y-1">
                {adminNavItems.map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-primary text-white' 
                          : 'text-surface-700 hover:bg-surface-100'
                        }
                      `}
                    >
                      <ApperIcon name={item.icon} size={18} />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="p-4 bg-surface-50 rounded-lg">
              <h4 className="text-sm font-medium text-surface-900 mb-2">Quick Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-600">Active Listings</span>
                  <span className="font-medium">247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">This Month</span>
                  <span className="font-medium text-success">+18</span>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;