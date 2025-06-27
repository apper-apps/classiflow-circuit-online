import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import React from 'react';
import Layout from './Layout';
import { routeArray } from './config/routes';
import NotFound from '@/components/pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen bg-surface-50">
<Routes>
          {/* Public embed routes (no layout) */}
          {routeArray
            .filter(route => route.isPublic)
            .map((route) => (
              <Route
                key={route.id}
                path={route.path}
                element={<route.component />}
              />
            ))}
          
          {/* Main application routes (with layout) */}
          <Route path="/" element={<Layout />}>
            {routeArray
              .filter(route => !route.isPublic)
              .map((route) => (
                <Route
                  key={route.id}
                  path={route.path}
                  element={<route.component />}
/>
            ))}
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Account Setup Route (public, no layout) */}
          <Route 
            path="/account-setup" 
            element={React.createElement(React.lazy(() => import('@/components/pages/AccountSetup')))} 
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          className="z-[9999]"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;