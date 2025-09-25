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
const AuthContext_1 = require("../contexts/AuthContext");
const Books = () => {
    const { isAdmin } = (0, AuthContext_1.useAuth)();
    const [books, setBooks] = (0, react_1.useState)([]);
    const [authors, setAuthors] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [currentPage, setCurrentPage] = (0, react_1.useState)(0);
    const [totalPages, setTotalPages] = (0, react_1.useState)(0);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [newBook, setNewBook] = (0, react_1.useState)({ title: '', author_id: '' });
    const [editingBook, setEditingBook] = (0, react_1.useState)(null);
    const [editData, setEditData] = (0, react_1.useState)({ title: '', author_id: '' });
    const [error, setError] = (0, react_1.useState)('');
    const limit = 5;
    const navigate = (0, react_router_dom_1.useNavigate)();
    (0, react_1.useEffect)(() => {
        fetchAuthors();
    }, []);
    (0, react_1.useEffect)(() => {
        if (authors.length > 0) {
            fetchBooks();
        }
    }, [currentPage, searchQuery, authors]);
    const fetchBooks = async () => {
        setLoading(true);
        const page = currentPage + 1;
        const response = await api_1.default.get(`/api/books?limit=${limit}&page=${page}&search=${searchQuery}`);
        if (response.data && Array.isArray(response.data.books)) {
            setBooks(response.data.books);
            setTotalPages(response.data.totalPages);
        }
        else {
            setBooks([]);
            setTotalPages(0);
        }
        setLoading(false);
    };
    const fetchAuthors = async () => {
        const response = await api_1.default.get('/api/authors?limit=9999&page=1');
        if (response.data && Array.isArray(response.data.authors)) {
            setAuthors(response.data.authors);
        }
        else {
            setAuthors([]);
        }
    };
    const getAuthorName = (authorId) => {
        const author = authors.find(a => a.author_id === authorId);
        return author ? author.name_author : '';
    };
    const handleCreateBook = async (e) => {
        e.preventDefault();
        if (!newBook.title.trim() || !newBook.author_id)
            return;
        await api_1.default.post('/api/books', {
            title: newBook.title.trim(),
            author_id: Number(newBook.author_id)
        });
        setNewBook({ title: '', author_id: '' });
        fetchBooks();
    };
    const handleEditBook = (book) => {
        setEditingBook(book.book_id);
        setEditData({ title: book.title, author_id: book.author_id.toString() });
    };
    const handleSaveEdit = async () => {
        if (!editData.title.trim() || !editData.author_id || !editingBook)
            return;
        const payload = {
            title: editData.title.trim(),
            author_id: Number(editData.author_id)
        };
        await api_1.default.patch(`/api/books/${editingBook}`, payload);
        setEditingBook(null);
        setEditData({ title: '', author_id: '' });
        setError('');
        fetchBooks();
    };
    const handleCancelEdit = () => {
        setEditingBook(null);
        setEditData({ title: '', author_id: '' });
    };
    const handleDeleteBook = async (bookId) => {
        if (!confirm('Tem certeza de que deseja excluir este livro?'))
            return;
        try {
            await api_1.default.delete(`/api/books/${bookId}`);
            alert('Livro excluído com sucesso');
            await fetchBooks();
            setError('');
        }
        catch (err) {
            setError('Falha ao excluir livro');
            alert('Falha ao excluir livro');
        }
    };
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchBooks();
    };
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(Layout_1.default, { title: "Livros", children: (0, jsx_runtime_1.jsx)("div", { className: "loading", children: "Carregando livros..." }) }));
    }
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: "Livros", children: [error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), isAdmin && ((0, jsx_runtime_1.jsxs)("section", { className: "form-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Adicionar Livro" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleCreateBook, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "author-select", children: "Autor:" }), (0, jsx_runtime_1.jsxs)("select", { id: "author-select", value: newBook.author_id, onChange: (e) => setNewBook({ ...newBook, author_id: e.target.value }), required: true, children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Selecione um autor" }), authors.map(author => ((0, jsx_runtime_1.jsx)("option", { value: author.author_id, children: author.name_author }, author.author_id)))] }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "book-title", children: "T\u00EDtulo:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "book-title", value: newBook.title, onChange: (e) => setNewBook({ ...newBook, title: e.target.value }), required: true }), (0, jsx_runtime_1.jsx)("button", { type: "submit", children: "Adicionar" })] })] })), (0, jsx_runtime_1.jsxs)("section", { className: "search-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Buscar Livros" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSearch, children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Buscar por t\u00EDtulo" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", children: "Buscar" })] })] }), books.length === 0 && searchQuery ? ((0, jsx_runtime_1.jsx)("div", { className: "no-results", children: "Nenhum resultado encontrado para sua busca." })) : ((0, jsx_runtime_1.jsxs)("section", { className: "book-list", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Livros" }), (0, jsx_runtime_1.jsxs)("table", { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "ID" }), (0, jsx_runtime_1.jsx)("th", { children: "ID do Autor" }), (0, jsx_runtime_1.jsx)("th", { children: "Autor" }), (0, jsx_runtime_1.jsx)("th", { children: "T\u00EDtulo" }), (0, jsx_runtime_1.jsx)("th", { children: "A\u00E7\u00F5es" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: books.map(book => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: book.book_id }), (0, jsx_runtime_1.jsx)("td", { children: book.author_id }), (0, jsx_runtime_1.jsx)("td", { children: editingBook === book.book_id ? ((0, jsx_runtime_1.jsx)("select", { value: editData.author_id, onChange: (e) => setEditData({ ...editData, author_id: e.target.value }), children: authors.map(author => ((0, jsx_runtime_1.jsx)("option", { value: author.author_id, children: author.name_author }, author.author_id))) })) : (getAuthorName(book.author_id)) }), (0, jsx_runtime_1.jsx)("td", { children: editingBook === book.book_id ? ((0, jsx_runtime_1.jsx)("input", { type: "text", value: editData.title, onChange: (e) => setEditData({ ...editData, title: e.target.value }) })) : (book.title) }), (0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)("div", { className: "action-buttons", children: editingBook === book.book_id ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleSaveEdit, children: "Salvar" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleCancelEdit, children: "Cancelar" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => navigate(`/books/${book.book_id}`), "aria-label": "Ver", title: "Ver", className: "icon-button", children: (0, jsx_runtime_1.jsx)("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", fill: "currentColor" }) }) }), isAdmin && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleEditBook(book), "aria-label": "Editar", title: "Editar", className: "icon-button", children: (0, jsx_runtime_1.jsx)("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18-11.5a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75L21 5.75Z", fill: "currentColor" }) }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleDeleteBook(book.book_id), "aria-label": "Excluir", title: "Excluir", className: "icon-button", children: (0, jsx_runtime_1.jsx)("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M6 7h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7Zm11-3h-3.5l-1-1h-3L8 4H5v2h14V4Z", fill: "currentColor" }) }) })] }))] })) }) })] }, book.book_id))) })] }), totalPages > 1 && ((0, jsx_runtime_1.jsx)("div", { className: "pagination", children: Array.from({ length: totalPages }, (_, i) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => handlePageChange(i), className: currentPage === i ? 'active' : '', children: i + 1 }, i))) }))] }))] }));
};
exports.default = Books;
