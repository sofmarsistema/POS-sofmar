import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { ChakraProvider, Box, useMediaQuery } from '@chakra-ui/react';
import Login from './views/login/Login';
import PuntoDeVenta from './views/puntodeventa/punto_de_venta';
import { AuthProvider, useAuth } from './services/AuthContext';
import Sidebar from './views/modules/NavBar'; // Asegúrate de que la ruta de importación sea correcta

const ProtectedLayout: React.FC = () => {
  const { auth } = useAuth();
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)');
  
  if (!auth) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <Box>
      <Sidebar />
      <Box 
        ml={isLargerThan768 ? ['60px', '60px', '60px'] : 0} 
        mb={isLargerThan768 ? 0 : '60px'} 
        p={4}
        transition="all 0.3s"
      >
        <Outlet />
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/punto-de-venta" element={<PuntoDeVenta />} />
              {/* Agrega aquí más rutas protegidas si es necesario */}
            </Route>
            <Route path="/" element={<Navigate to="/punto-de-venta" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;