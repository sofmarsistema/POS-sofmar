import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://localhost:4000/api', // Reemplaza con la URL base de tu API
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;