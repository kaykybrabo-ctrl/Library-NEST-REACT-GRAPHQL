"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
const Layout = ({ children, title }) => {
    const { logout, isAdmin } = (0, AuthContext_1.useAuth)();
    const location = (0, react_router_dom_1.useLocation)();
    const handleLogout = () => {
        logout();
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("header", { children: [(0, jsx_runtime_1.jsx)("h1", { children: title }), (0, jsx_runtime_1.jsxs)("button", { id: "logout-button", onClick: handleLogout, "aria-label": "Sair da conta", children: [(0, jsx_runtime_1.jsx)("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "16", height: "16", "aria-hidden": "true", children: (0, jsx_runtime_1.jsx)("path", { fill: "currentColor", d: "M10 3a1 1 0 0 1 1 1v4h-2V5H6v14h3v-3h2v4a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5Zm6.293 6.293 1.414 1.414L15.414 13H21v2h-5.586l2.293 2.293-1.414 1.414L12 14l4.293-4.293Z" }) }), (0, jsx_runtime_1.jsx)("span", { children: "Sair" })] })] }), (0, jsx_runtime_1.jsxs)("nav", { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/books", className: location.pathname === '/books' ? 'active' : '', children: "Livros" }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/authors", className: location.pathname === '/authors' ? 'active' : '', children: "Autores" }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/my-loans", className: location.pathname === '/my-loans' ? 'active' : '', children: "Meus Empr\u00E9stimos" }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/profile", className: location.pathname === '/profile' ? 'active' : '', children: "Perfil" }), isAdmin && ((0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/loans", className: location.pathname === '/loans' ? 'active' : '', children: "Gerenciar Empr\u00E9stimos" }))] }), (0, jsx_runtime_1.jsx)("main", { children: children }), (0, jsx_runtime_1.jsx)("footer", { children: (0, jsx_runtime_1.jsx)("p", { children: "\u00A9 2025 PedBook" }) })] }));
};
exports.default = Layout;
