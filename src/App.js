import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MedProvider } from './context/MedContext';
import { mockMedicamentos } from './data/mockData';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import NuevaMedicinaScreen from './screens/NuevaMedicinaScreen';
import BotiquinScreen from './screens/BotiquinScreen';
import HistorialScreen from './screens/HistorialScreen';
import AjustesScreen from './screens/AjustesScreen';

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MedProvider initialMedicines={mockMedicamentos}>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardScreen />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/nuevo" 
              element={
                <ProtectedRoute>
                  <NuevaMedicinaScreen />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/botiquin" 
              element={
                <ProtectedRoute>
                  <BotiquinScreen />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/historial" 
              element={
                <ProtectedRoute>
                  <HistorialScreen />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/ajustes" 
              element={
                <ProtectedRoute>
                  <AjustesScreen />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MedProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

