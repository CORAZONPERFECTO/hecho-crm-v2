import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import AuthPage from '@/components/auth/AuthPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Index from '@/pages/Index';
import SharedTicket from '@/pages/SharedTicket';
import NotFound from '@/pages/NotFound';
import TechnicianDashboard from '@/pages/TechnicianDashboard';
import TestTechnician from '@/pages/TestTechnician';
import './App.css';
import OfflineSyncManager from '@/components/OfflineSyncManager';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/shared/:token" element={<SharedTicket />} />
            <Route path="/shared-ticket/:token" element={<SharedTicket />} />

            {/* Ruta de técnico SIN protección para debugging */}
            <Route path="/technician" element={<TestTechnician />} />
            <Route path="/technician/*" element={<TestTechnician />} />

            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['admin', 'manager', 'contador', 'asistente', 'supervisor']}>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route path="/404" element={<NotFound />} />

            {/* Catch-all debe ir al final */}
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster />
          {/* Agregar el administrador de sincronización offline */}
          {/* <OfflineSyncManager /> */}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
