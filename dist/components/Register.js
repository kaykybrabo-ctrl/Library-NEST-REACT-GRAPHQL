"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
require("./Register.css");
const Register = () => {
    const [username, setUsername] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [confirmPassword, setConfirmPassword] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const [success, setSuccess] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const { register } = (0, AuthContext_1.useAuth)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }
        if (password.length < 3) {
            setError('A senha deve ter pelo menos 3 caracteres');
            return;
        }
        setLoading(true);
        try {
            const success = await register(username, password);
            if (success) {
                setSuccess('Registro realizado com sucesso! Você já pode entrar.');
                setTimeout(() => navigate('/'), 2000);
            }
            else {
                setError('Falha no registro. O e-mail pode já estar em uso.');
            }
        }
        catch (err) {
            setError('Falha no registro. Tente novamente.');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "login-container", children: [(0, jsx_runtime_1.jsx)("h1", { children: "Cadastro - PedBook" }), error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), success && (0, jsx_runtime_1.jsx)("div", { className: "success-message", children: success }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "email", children: "E-mail:" }), (0, jsx_runtime_1.jsx)("input", { type: "email", id: "email", value: username, onChange: (e) => setUsername(e.target.value), required: true, disabled: loading }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "password", children: "Senha:" }), (0, jsx_runtime_1.jsx)("input", { type: "password", id: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: loading }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "confirmPassword", children: "Confirmar senha:" }), (0, jsx_runtime_1.jsx)("input", { type: "password", id: "confirmPassword", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true, disabled: loading }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading, children: loading ? 'Cadastrando...' : 'Cadastrar' })] }), (0, jsx_runtime_1.jsxs)("p", { className: "auth-link", children: ["J\u00E1 tem uma conta? ", (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/", children: "Entre aqui" })] })] }));
};
exports.default = Register;
