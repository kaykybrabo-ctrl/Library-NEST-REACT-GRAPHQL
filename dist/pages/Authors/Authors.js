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
require("./AuthorsCards.css");
const Authors = () => {
    const { isAdmin } = (0, AuthContext_1.useAuth)();
    const [authors, setAuthors] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [currentPage, setCurrentPage] = (0, react_1.useState)(0);
    const [totalPages, setTotalPages] = (0, react_1.useState)(0);
    const [newAuthor, setNewAuthor] = (0, react_1.useState)({ name: '', biography: '' });
    const [editingAuthor, setEditingAuthor] = (0, react_1.useState)(null);
    const [editData, setEditData] = (0, react_1.useState)({ name: '', biography: '' });
    const [error, setError] = (0, react_1.useState)('');
    const [includeDeleted, setIncludeDeleted] = (0, react_1.useState)(false);
    const limit = 6;
    const navigate = (0, react_router_dom_1.useNavigate)();
    const capitalizeFirst = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
    (0, react_1.useEffect)(() => {
        fetchAuthors();
    }, [currentPage, includeDeleted]);
    const fetchAuthors = async () => {
        try {
            setLoading(true);
            const response = await api_1.default.get(`/api/authors?page=${currentPage + 1}&limit=${limit}${includeDeleted ? '&includeDeleted=1' : ''}`);
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
    const handleRestoreAuthor = async (authorId) => {
        try {
            await api_1.default.patch(`/api/authors/${authorId}/restore`);
            alert('Autor restaurado com sucesso');
            fetchAuthors();
        }
        catch (err) {
            setError('Falha ao restaurar autor');
            alert('Falha ao restaurar autor');
        }
    };
    const handleCreateAuthor = async (e) => {
        e.preventDefault();
        if (!newAuthor.name.trim() || !newAuthor.biography.trim())
            return;
        try {
            await api_1.default.post('/api/authors', {
                name_author: capitalizeFirst(newAuthor.name.trim()),
                biography: capitalizeFirst(newAuthor.biography.trim())
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
        setEditData({ name: author.name_author, biography: author.biography || '' });
    };
    const handleSaveEdit = async () => {
        if (!editData.name.trim() || !editingAuthor)
            return;
        try {
            await api_1.default.patch(`/api/authors/${editingAuthor}`, {
                name_author: capitalizeFirst(editData.name.trim()),
                biography: editData.biography.trim() || null
            });
            alert('Autor atualizado com sucesso');
            setEditingAuthor(null);
            setEditData({ name: '', biography: '' });
            fetchAuthors();
        }
        catch (err) {
            setError('Falha ao atualizar autor');
            alert('Falha ao atualizar autor');
        }
    };
    const handleCancelEdit = () => {
        setEditingAuthor(null);
        setEditData({ name: '', biography: '' });
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
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: "Autores", children: [error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), isAdmin && ((0, jsx_runtime_1.jsxs)("section", { className: "form-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Adicionar Autor" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleCreateAuthor, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "author-name", children: "Nome:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "author-name", value: newAuthor.name, onChange: (e) => setNewAuthor({ ...newAuthor, name: e.target.value }), required: true }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "author-biography", children: "Biografia:" }), (0, jsx_runtime_1.jsx)("textarea", { id: "author-biography", value: newAuthor.biography, onChange: (e) => setNewAuthor({ ...newAuthor, biography: e.target.value }), required: true, rows: 3 }), (0, jsx_runtime_1.jsx)("button", { type: "submit", children: "Adicionar" })] })] })), (0, jsx_runtime_1.jsxs)("section", { className: "author-list", children: [(0, jsx_runtime_1.jsxs)("h2", { children: ["Autores (", authors.length, " ", authors.length === 1 ? 'autor' : 'autores', ")"] }), isAdmin && ((0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 10 }, children: (0, jsx_runtime_1.jsxs)("label", { style: { display: 'inline-flex', gap: 6, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: includeDeleted, onChange: (e) => { setIncludeDeleted(e.target.checked); setCurrentPage(0); } }), "Mostrar exclu\u00EDdos"] }) })), (0, jsx_runtime_1.jsx)("div", { className: `authors-grid ${loading ? 'loading' : ''}`, children: authors.map(author => ((0, jsx_runtime_1.jsxs)("div", { className: `author-card ${author.deleted_at ? 'deleted' : ''} ${editingAuthor === author.author_id ? 'editing' : ''}`, children: [author.deleted_at && (0, jsx_runtime_1.jsx)("div", { className: "deleted-badge", children: "Exclu\u00EDdo" }), (0, jsx_runtime_1.jsxs)("div", { className: "author-card-header", children: [(0, jsx_runtime_1.jsx)("div", { className: "author-card-avatar", children: author.photo && author.photo.trim() !== '' ? ((0, jsx_runtime_1.jsx)("img", { src: author.photo.startsWith('http') || author.photo.startsWith('/') ? author.photo : `/api/uploads/${author.photo}`, alt: author.name_author, onError: (e) => {
                                                    const target = e.currentTarget;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent && !parent.querySelector('.avatar-fallback')) {
                                                        const fallbackDiv = document.createElement('div');
                                                        fallbackDiv.className = 'avatar-fallback';
                                                        fallbackDiv.textContent = author.name_author.charAt(0).toUpperCase();
                                                        parent.appendChild(fallbackDiv);
                                                    }
                                                } })) : ((0, jsx_runtime_1.jsx)("div", { className: "avatar-fallback", children: author.name_author.charAt(0).toUpperCase() })) }), (0, jsx_runtime_1.jsx)("h3", { className: "author-card-name", children: author.name_author })] }), (0, jsx_runtime_1.jsx)("div", { className: "author-card-content", children: editingAuthor === author.author_id ? ((0, jsx_runtime_1.jsxs)("div", { className: "edit-form", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: editData.name, onChange: (e) => setEditData({ ...editData, name: e.target.value }), placeholder: "Nome do autor" }), (0, jsx_runtime_1.jsx)("textarea", { value: editData.biography, onChange: (e) => setEditData({ ...editData, biography: e.target.value }), placeholder: "Biografia do autor", rows: 3 }), (0, jsx_runtime_1.jsxs)("div", { className: "edit-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "save-btn", onClick: handleSaveEdit, children: "Salvar" }), (0, jsx_runtime_1.jsx)("button", { className: "cancel-btn", onClick: handleCancelEdit, children: "Cancelar" })] })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("p", { className: "author-card-biography", children: author.biography || 'Sem biografia disponível para este autor.' }), (0, jsx_runtime_1.jsxs)("div", { className: "author-card-meta", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["ID: ", author.author_id] }), author.deleted_at && (0, jsx_runtime_1.jsx)("span", { style: { color: '#ff9800', fontWeight: 'bold' }, children: "EXCLU\u00CDDO" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "author-card-actions", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => navigate(`/authors/${author.author_id}`), "aria-label": "Ver detalhes", title: "Ver detalhes", className: "icon-button", children: (0, jsx_runtime_1.jsx)("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", fill: "currentColor" }) }) }), isAdmin && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleEditAuthor(author), "aria-label": "Editar", title: "Editar", className: "icon-button", children: (0, jsx_runtime_1.jsx)("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18-11.5a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75L21 5.75Z", fill: "currentColor" }) }) }), author.deleted_at ? ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleRestoreAuthor(author.author_id), "aria-label": "Restaurar", title: "Restaurar", className: "icon-button", style: { borderColor: '#4caf50', color: '#4caf50' }, children: (0, jsx_runtime_1.jsx)("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M12 5v2a5 5 0 1 1-4.9 6h2.02A3 3 0 1 0 12 9v2l4-3-4-3Z", fill: "currentColor" }) }) })) : ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleDeleteAuthor(author.author_id), "aria-label": "Excluir", title: "Excluir", className: "icon-button", style: { borderColor: '#f44336', color: '#f44336' }, children: (0, jsx_runtime_1.jsx)("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M6 7h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7Zm11-3h-3.5l-1-1h-3L8 4H5v2h14V4Z", fill: "currentColor" }) }) }))] }))] })] })) })] }, author.author_id))) }), totalPages > 1 && ((0, jsx_runtime_1.jsx)("div", { className: "pagination", children: Array.from({ length: totalPages }, (_, i) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => handlePageChange(i), className: currentPage === i ? 'active' : '', children: i + 1 }, i))) }))] })] }));
};
exports.default = Authors;
