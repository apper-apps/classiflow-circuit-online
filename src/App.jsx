import "@/index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import React, { Suspense } from "react";
import Layout from "@/Layout";
import { routeArray } from "@/config/routes";
import NotFound from "@/components/pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen bg-surface-50">
        <Routes>
          <Route path="/" element={<Layout />}>
            {routeArray.map((route) => (
              <Route
                key={route.id}
                path={route.path}
                element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                    {React.createElement(route.component)}
                  </Suspense>
                }
              />
            ))}
<Route path="/listing/:id" element={
              <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                {React.createElement(React.lazy(() => import('@/components/pages/ListingDetail')))}
              </Suspense>
            } />
            <Route path="/embed/:id" element={
              <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                {React.createElement(React.lazy(() => import('@/components/pages/EmbedViewer')))}
              </Suspense>
            } />
            <Route path="/payment/success" element={
              <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                {React.createElement(React.lazy(() => import('@/components/pages/PaymentSuccess')))}
              </Suspense>
            } />
            <Route path="/payment/cancel" element={
              <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
                {React.createElement(React.lazy(() => import('@/components/pages/PaymentCancel')))}
              </Suspense>
} />
            <Route path="*" element={<NotFound />} />
          </Route>
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