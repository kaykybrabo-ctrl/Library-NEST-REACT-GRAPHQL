"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const api_1 = __importDefault(require("../api"));
const Layout_1 = __importDefault(require("./Layout"));
const ResetPassword = () => {
    const location = (0, react_router_dom_1.useLocation)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const email = (0, react_1.useMemo)(() => {
        const params = new URLSearchParams(location.search);
        return (params.get('u') || '').trim().toLowerCase();
    }, [location.search]);
    const token = (0, react_1.useMemo)(() => {
        const params = new URLSearchParams(location.search);
        return (params.get('t') || '').trim();
    }, [location.search]);
    const [newPassword, setNewPassword] = (0, react_1.useState)('');
    const [confirmPassword, setConfirmPassword] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)('');
    const [success, setSuccess] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!email) {
            setError('Link de e-mail inválido ou ausente. Solicite um novo e-mail de redefinição.');
            return;
        }
        if (!newPassword || newPassword.length < 3) {
            setError('Por favor, informe uma nova senha com pelo menos 3 caracteres');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }
        setLoading(true);
        try {
            const payload = { newPassword };
            if (token)
                payload.token = token;
            else
                payload.username = email;
            const res = await api_1.default.post('/api/reset-password', payload);
            if (res?.data?.ok) {
                setSuccess('Senha atualizada com sucesso. Você já pode entrar.');
                alert('Senha atualizada com sucesso!');
                setTimeout(() => navigate('/'), 1200);
            }
            else {
                setError(res?.data?.message || 'Falha ao redefinir a senha');
            }
        }
        catch (e) {
            setError('Falha ao redefinir a senha');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)(Layout_1.default, { title: "Redefinir Senha", children: (0, jsx_runtime_1.jsxs)("section", { className: "form-section", style: { maxWidth: 480, margin: '40px auto' }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "Escolha uma nova senha" }), email ? ((0, jsx_runtime_1.jsxs)("p", { style: { color: '#555' }, children: ["Redefinindo a senha para: ", (0, jsx_runtime_1.jsx)("strong", { children: email })] })) : ((0, jsx_runtime_1.jsx)("p", { style: { color: '#a00' }, children: "Nenhum e-mail no link. Volte para o Login e clique novamente em \"Esqueceu a senha?\"." })), error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", style: { marginTop: 12 }, children: error }), success && (0, jsx_runtime_1.jsx)("div", { className: "success-message", style: { marginTop: 12 }, children: success }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, style: { marginTop: 16 }, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "newPassword", children: "Nova senha:" }), (0, jsx_runtime_1.jsx)("input", { id: "newPassword", type: "password", value: newPassword, onChange: (e) => setNewPassword(e.target.value), required: true, disabled: loading }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "confirmPassword", children: "Confirmar nova senha:" }), (0, jsx_runtime_1.jsx)("input", { id: "confirmPassword", type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true, disabled: loading }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading, children: loading ? 'Salvando...' : 'Redefinir Senha' }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 10 }, children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/", children: "Voltar ao Login" }) })] })] }) }));
};
exports.default = ResetPassword;
