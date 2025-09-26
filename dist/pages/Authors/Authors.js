"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const api_1 = __importDefault(require("../../api"));
const Layout_1 = __importDefault(require("../../components/Layout"));
const AuthContext_1 = require("../../contexts/AuthContext");
const Authors = () => {
    const { isAdmin } = (0, AuthContext_1.useAuth)();
    const [authors, setAuthors] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [currentPage, setCurrentPage] = (0, react_1.useState)(0);
    const [totalPages, setTotalPages] = (0, react_1.useState)(0);
    const [newAuthor, setNewAuthor] = (0, react_1.useState)({ name: '', biography: '' });
    const [editingAuthor, setEditingAuthor] = (0, react_1.useState)(null);
    const [editData, setEditData] = (0, react_1.useState)({ name: '' });
    const [error, setError] = (0, react_1.useState)('');
    const limit = 5;
    const navigate = (0, react_router_dom_1.useNavigate)();
    (0, react_1.useEffect)(() => {
        fetchAuthors();
    }, [currentPage]);
    const fetchAuthors = async () => {
        try {
            setLoading(true);
            const response = await api_1.default.get(`/api/authors?page=${currentPage + 1}&limit=${limit}`);
            if (response.data.authors) {
                setAuthors(response.data.authors);
                setTotalPages(response.data.totalPages || 0);
            }
            else {
                setAuthors(Array.isArray(response.data) ? response.data : []);
                setTotalPages(1);
            }
        }
        catch (err) {
            setError('Falha ao buscar autores');
            setAuthors([]);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateAuthor = async (e) => {
        e.preventDefault();
        if (!newAuthor.name.trim() || !newAuthor.biography.trim())
            return;
        try {
            await api_1.default.post('/api/authors', {
                name_author: newAuthor.name.trim(),
                biography: newAuthor.biography.trim()
            });
            setNewAuthor({ name: '', biography: '' });
            fetchAuthors();
        }
        catch (err) {
            setError('Falha ao criar autor');
        }
    };
    const handleEditAuthor = (author) => {
        setEditingAuthor(author.author_id);
        setEditData({ name: author.name_author });
    };
    const handleSaveEdit = async () => {
        if (!editData.name.trim() || !editingAuthor)
            return;
        try {
            await api_1.default.patch(`/api/authors/${editingAuthor}`, {
                name_author: editData.name.trim()
            });
            alert('Autor atualizado com sucesso');
            setEditingAuthor(null);
            fetchAuthors();
        }
        catch (err) {
            setError('Falha ao atualizar autor');
            alert('Falha ao atualizar autor');
        }
    };
    const handleCancelEdit = () => {
        setEditingAuthor(null);
        setEditData({ name: '' });
    };
    const handleDeleteAuthor = async (authorId) => {
        if (!confirm('Tem certeza de que deseja excluir este autor?'))
            return;
        try {
            await api_1.default.delete(`/api/authors/${authorId}`);
            alert('Autor excluído com sucesso');
            fetchAuthors();
        }
        catch (err) {
            setError('Falha ao excluir autor');
            alert('Falha ao excluir autor');
        }
    };
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(Layout_1.default, { title: "Autores", children: (0, jsx_runtime_1.jsx)("div", { className: "loading", children: "Carregando autores..." }) }));
    }
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: "Autores", children: [error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), isAdmin && ((0, jsx_runtime_1.jsxs)("section", { className: "form-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Adicionar Autor" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleCreateAuthor, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "author-name", children: "Nome:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "author-name", value: newAuthor.name, onChange: (e) => setNewAuthor({ ...newAuthor, name: e.target.value }), required: true }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "author-biography", children: "Biografia:" }), (0, jsx_runtime_1.jsx)("textarea", { id: "author-biography", value: newAuthor.biography, onChange: (e) => setNewAuthor({ ...newAuthor, biography: e.target.value }), required: true, rows: 3 }), (0, jsx_runtime_1.jsx)("button", { type: "submit", children: "Adicionar" })] })] })), (0, jsx_runtime_1.jsxs)("section", { className: "author-list", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Autores" }), (0, jsx_runtime_1.jsxs)("table", { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "ID" }), (0, jsx_runtime_1.jsx)("th", { children: "Nome" }), (0, jsx_runtime_1.jsx)("th", { children: "A\u00E7\u00F5es" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: authors.map(author => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: author.author_id }), (0, jsx_runtime_1.jsx)("td", { children: editingAuthor === author.author_id ? ((0, jsx_runtime_1.jsx)("input", { type: "text", value: editData.name, onChange: (e) => setEditData({ ...editData, name: e.target.value }) })) : (author.name_author) }), (0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)("div", { className: "action-buttons", children: editingAuthor === author.author_id ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleSaveEdit, children: "Salvar" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleCancelEdit, children: "Cancelar" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => navigate(`/authors/${author.author_id}`), "aria-label": "Ver", title: "Ver", className: "icon-button", children: (0, jsx_runtime_1.jsx)("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", fill: "currentColor" }) }) }), isAdmin && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleEditAuthor(author), "aria-label": "Editar", title: "Editar", className: "icon-button", children: (0, jsx_runtime_1.jsx)("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18-11.5a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75L21 5.75Z", fill: "currentColor" }) }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleDeleteAuthor(author.author_id), "aria-label": "Excluir", title: "Excluir", className: "icon-button", children: (0, jsx_runtime_1.jsx)("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M6 7h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7Zm11-3h-3.5l-1-1h-3L8 4H5v2h14V4Z", fill: "currentColor" }) }) })] }))] })) }) })] }, author.author_id))) })] }), totalPages > 1 && ((0, jsx_runtime_1.jsx)("div", { className: "pagination", children: Array.from({ length: totalPages }, (_, i) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => handlePageChange(i), className: currentPage === i ? 'active' : '', children: i + 1 }, i))) }))] })] }));
};
exports.default = Authors;
