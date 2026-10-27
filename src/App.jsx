import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './components/dashboard/DashboardPage';
import EnquiryWorkbench from './components/enquiries/EnquiryWorkbench';
import ProductsPage from './components/products/ProductsPage';
import TechniciansPage from './components/technicians/TechniciansPage';
import ReportsPage from './components/reports/ReportsPage';
import TechnicianTasksPage from './components/technician-portal/TechnicianTasksPage';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="workflow" element={<EnquiryWorkbench />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="technicians" element={<TechniciansPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="technician-portal" element={<TechnicianTasksPage />} />
            {/* Catch-all redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

