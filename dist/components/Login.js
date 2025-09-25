"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
const api_1 = __importDefault(require("../api"));
require("./Login.css");
const Login = () => {
    const [username, setUsername] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const [preview, setPreview] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const { login } = (0, AuthContext_1.useAuth)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const success = await login(username, password);
            if (success) {
                navigate('/books');
            }
            else {
                setError('E-mail ou senha inválidos');
            }
        }
        catch (err) {
            setError('Falha no login. Tente novamente.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleForgotPassword = async () => {
        if (!username.trim()) {
            setError('Informe seu e-mail para receber o link de redefinição');
            return;
        }
        setError('');
        setPreview(null);
        setLoading(true);
        try {
            const res = await api_1.default.post('/api/forgot-password', { username: username.trim() });
            const data = res?.data || {};
            if (data.preview) {
                setPreview(data.preview);
            }
            alert('Se a conta existir, um e-mail de redefinição foi enviado.');
        }
        catch (e) {
            alert('Se a conta existir, um e-mail de redefinição foi enviado.');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "login-container", children: [(0, jsx_runtime_1.jsx)("h1", { children: "PedBook" }), error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "email", children: "E-mail:" }), (0, jsx_runtime_1.jsx)("input", { type: "email", id: "email", value: username, onChange: (e) => setUsername(e.target.value), required: true, disabled: loading, placeholder: "voce@exemplo.com" }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "password", children: "Senha:" }), (0, jsx_runtime_1.jsx)("input", { type: "password", id: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: loading }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading, children: loading ? 'Entrando...' : 'Entrar' }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "link-button", onClick: handleForgotPassword, disabled: loading, style: { marginTop: 10 }, children: "Esqueceu a senha?" }), preview && ((0, jsx_runtime_1.jsxs)("div", { className: "email-preview", children: [(0, jsx_runtime_1.jsx)("div", { className: "email-preview-title", children: "Visualize seu e-mail de redefini\u00E7\u00E3o (Ethereal):" }), (0, jsx_runtime_1.jsx)("a", { className: "email-preview-link", href: preview, target: "_blank", rel: "noopener noreferrer", children: preview })] }))] }), (0, jsx_runtime_1.jsxs)("p", { className: "auth-link", children: ["N\u00E3o tem uma conta? ", (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/register", children: "Cadastre-se aqui" })] })] }));
};
exports.default = Login;
