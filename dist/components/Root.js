"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("../contexts/AuthContext");
const Login_1 = __importDefault(require("./Login"));
const Root = () => {
    const { isAuthenticated } = (0, AuthContext_1.useAuth)();
    if (isAuthenticated) {
        return (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/books", replace: true });
    }
    return (0, jsx_runtime_1.jsx)(Login_1.default, {});
};
exports.default = Root;
