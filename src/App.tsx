import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Login from './views/login/Login';
import PuntoDeVenta from './views/puntodeventa/punto_de_venta';
import { AuthProvider, useAuth } from './services/AuthContext';
import ResumenDeVenta from './views/puntodeventa/invoice';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = useAuth();
  
  if (!auth) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route 
              path="/login" 
              element={
                <Login />
              } 
            />
            <Route 
              path="/punto-de-venta" 
              element={
                <ProtectedRoute>
                  <PuntoDeVenta />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/punto-de-venta" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;