"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = exports.useAuth = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = __importDefault(require("../api"));
const AuthContext = (0, react_1.createContext)(undefined);
const useAuth = () => {
    const context = (0, react_1.useContext)(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
exports.useAuth = useAuth;
const AuthProvider = ({ children }) => {
    const [user, setUser] = (0, react_1.useState)(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser && savedUser !== 'undefined') {
            try {
                return JSON.parse(savedUser);
            }
            catch (error) {
                return null;
            }
        }
        return null;
    });
    const [token, setToken] = (0, react_1.useState)(localStorage.getItem('token'));
    const login = async (username, password) => {
        try {
            const response = await api_1.default.post('/api/login', { username, password });
            const { user: userData, token: newToken } = response.data;
            setUser(userData);
            setToken(newToken);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', newToken);
            return true;
        }
        catch (error) {
            return false;
        }
    };
    const register = async (username, password) => {
        try {
            await api_1.default.post('/api/register', { username, password });
            return true;
        }
        catch (error) {
            return false;
        }
    };
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };
    const value = {
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
    };
    return (0, jsx_runtime_1.jsx)(AuthContext.Provider, { value: value, children: children });
};
exports.AuthProvider = AuthProvider;
