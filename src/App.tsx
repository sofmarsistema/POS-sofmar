import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './views/login/Login';
import PuntoDeVenta from './views/puntodeventa/punto_de_venta';

function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = () => {
    const newToken = localStorage.getItem('token');
    setToken(newToken);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            token ? (
              <Navigate to="/punto-de-venta" replace />
            ) : (
              <LoginForm onLoginSuccess={handleLogin} />
            )
          } 
        />
        <Route 
          path="/punto-de-venta" 
          element={token ? <PuntoDeVenta /> : <Navigate to="/login" replace />} 
        />
        <Route path="/" element={<Navigate to="/punto-de-venta" replace />} />
      </Routes>
    </Router>
  );
}

export default App;