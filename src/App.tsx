import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { ChakraProvider, Box, useMediaQuery, Spinner, Center } from '@chakra-ui/react';
import Login from './views/login/Login';
import PuntoDeVenta from './views/puntodeventa/punto_de_venta';
import { AuthProvider, useAuth } from './services/AuthContext';
import Sidebar from './views/modules/NavBar';
import ResumenVentas from './views/ventas/ResumenVentas';
import GestionInventario from './views/inventario/gestionInventario';
import VentasDashboard from './views/dashboards/SalesDashboard';
import Presupuestos from './views/presupuestos/Presupuestos';
import { SwitchProvider } from './services/SwitchContext';
import ConsultaPresupuestos from './views/presupuestos/ConsultaPresupuesto';


const ProtectedLayout: React.FC = () => {
  const { auth, isLoading } = useAuth();
  const [isLargerThan768] = useMediaQuery('(min-width: 768px)');
  
  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

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
    <SwitchProvider>
      <ChakraProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/punto-de-venta" element={<PuntoDeVenta />} />
              <Route path="/consulta-de-ventas" element={<ResumenVentas />} />
              <Route path="/inventario" element={<GestionInventario/>} />
              <Route path="/dashboard" element={<VentasDashboard/>} />
              <Route path='/presupuestos' element = {<Presupuestos/>}/>
              <Route path='/consulta-de-presupuestos' element = {<ConsultaPresupuestos/>}/>
            </Route>
            <Route path="/" element={<Navigate to="/punto-de-venta" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
    </SwitchProvider>
  );
}

export default App;