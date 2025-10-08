import axios from "axios";

const api = axios.create();

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (!config.headers) {
        (config as any).headers = {};
      }
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Interceptor de resposta - erro:', error);
    const status = error?.response?.status;
    const url = error?.config?.url;
    
    if ((status === 401 || status === 403) && !url?.includes('/login')) {
      console.log('Redirecionando para home devido a erro de autenticação');
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
