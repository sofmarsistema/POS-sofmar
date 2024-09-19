import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AuthState {
  token: string;
  userId: string;
  userName: string;
  userSuc: string;
}

interface LoginData {
  token: string;
  usuario: [{
    op_codigo: string;
    op_nombre: string;
    op_sucursal: string;
  }];
}

interface AuthContextType {
  auth: AuthState | null;
  login: (data: LoginData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    const userName = localStorage.getItem('user_name');
    const userSuc = localStorage.getItem('user_suc');

    if (token && userId && userName && userSuc) {
      setAuth({ token, userId, userName, userSuc });
      axios.defaults.headers.common['Authorization'] = token;
    }
  }, []);

  const login = (data: LoginData) => {
    const authData: AuthState = {
      token: `Bearer ${data.token}`,
      userId: data.usuario[0].op_codigo,
      userName: data.usuario[0].op_nombre,
      userSuc: data.usuario[0].op_sucursal,
    };

    localStorage.setItem('token', authData.token);
    localStorage.setItem('user_id', authData.userId);
    localStorage.setItem('user_name', authData.userName);
    localStorage.setItem('user_suc', authData.userSuc);

    setAuth(authData);

    axios.defaults.headers.common['Authorization'] = authData.token;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_suc');
    setAuth(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};