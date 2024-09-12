import { useState, useEffect } from 'react';
import PuntoDeVenta from './views/puntodeventa/punto_de_venta';
import { supabase } from './utils/supabase';
import { Session } from '@supabase/supabase-js'; // Aseguramos que el tipo 'Session' sea importado
import './index.css';
import Login from './views/login/Login';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  // Verificar la sesión activa y cambios en la sesión
  useEffect(() => {
    // Obtener la sesión actual
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    getSession();

    // Escuchar cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Limpiar el listener
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Renderizar la pantalla de autenticación si no hay sesión
  if (!session) {
    return <Login />;
  }

  // Si hay sesión, cargar el componente PuntoDeVenta
  return (
    <>
      <PuntoDeVenta />
    </>
  );
}

export default App;
