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
                setError('Invalid email or password');
            }
        }
        catch (err) {
            setError('Login failed. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    const handleForgotPassword = async () => {
        if (!username.trim()) {
            setError('Please enter your email to receive the reset link');
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
            try {
                alert('If the account exists, a reset email has been sent.');
            }
            catch { }
        }
        catch (e) {
            try {
                alert('If the account exists, a reset email has been sent.');
            }
            catch { }
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "login-container", children: [(0, jsx_runtime_1.jsx)("h1", { children: "Library System" }), error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "email", children: "Email:" }), (0, jsx_runtime_1.jsx)("input", { type: "email", id: "email", value: username, onChange: (e) => setUsername(e.target.value), required: true, disabled: loading, placeholder: "you@example.com" }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "password", children: "Password:" }), (0, jsx_runtime_1.jsx)("input", { type: "password", id: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: loading }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading, children: loading ? 'Logging in...' : 'Login' }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "link-button", onClick: handleForgotPassword, disabled: loading, style: { marginTop: 10 }, children: "Forgot password?" }), preview && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 12 }, children: [(0, jsx_runtime_1.jsx)("div", { children: "Preview your reset email (Ethereal):" }), (0, jsx_runtime_1.jsx)("a", { href: preview, target: "_blank", rel: "noopener noreferrer", children: preview })] }))] }), (0, jsx_runtime_1.jsxs)("p", { className: "auth-link", children: ["Don't have an account? ", (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/register", children: "Register here" })] })] }));
};
exports.default = Login;
