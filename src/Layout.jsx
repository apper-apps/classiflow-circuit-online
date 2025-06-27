import { NavLink, Outlet, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "@/index.css";
import brandingData from "@/services/mockData/branding.json";
import packagesData from "@/services/mockData/packages.json";
import messagesData from "@/services/mockData/messages.json";
import teamsData from "@/services/mockData/teams.json";
import listingsData from "@/services/mockData/listings.json";
import embedsData from "@/services/mockData/embeds.json";
import categoriesData from "@/services/mockData/categories.json";
import usersData from "@/services/mockData/users.json";
import { routeArray } from "@/config/routes";
import ApperIcon from "@/components/ApperIcon";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

const mainNavItems = routeArray.filter(route => 
    ['home', 'browse', 'postAd', 'myListings', 'garageSales'].includes(route.id)
  );

  const adminNavItems = routeArray.filter(route => 
    ['admin', 'categories', 'branding', 'teams', 'embeds'].includes(route.id)
  );

  // Authentication handlers
  const handleAccountSetup = () => {
    window.location.href = '/account-setup';
  };

  const handleLogin = () => {
    // For demo, simulate login with first user
    const demoUser = { 
      Id: 1, 
      name: 'Demo User', 
      email: 'demo@example.com',
      role: 'user'
    };
    setCurrentUser(demoUser);
    localStorage.setItem('currentUser', JSON.stringify(demoUser));
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setShowUserMenu(false);
  };

  // Load user on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.relative')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

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
            
            {/* User Account Section */}
            <div className="relative">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-surface-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {currentUser.name?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <ApperIcon name="ChevronDown" size={16} className="text-surface-600" />
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-surface-200 rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-surface-100">
                        <p className="text-sm font-medium text-surface-900">{currentUser.name || 'User'}</p>
                        <p className="text-xs text-surface-500">{currentUser.email}</p>
                      </div>
                      <button className="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors">
                        Account Settings
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLogin}
                    className="px-3 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100 rounded-md transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleAccountSetup}
                    className="px-3 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
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