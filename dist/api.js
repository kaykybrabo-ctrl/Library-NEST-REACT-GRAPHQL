"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const api = axios_1.default.create();
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        if (!config.headers) {
            config.headers = {};
        }
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));
api.interceptors.response.use((response) => response, (error) => {
    console.log('Interceptor de resposta - erro:', error);
    const status = error?.response?.status;
    const url = error?.config?.url;
    // Não redirecionar se for erro de login
    if ((status === 401 || status === 403) && !url?.includes('/login')) {
        console.log('Redirecionando para home devido a erro de autenticação');
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (typeof window !== "undefined") {
            window.location.href = "/";
        }
    }
    return Promise.reject(error);
});
exports.default = api;
