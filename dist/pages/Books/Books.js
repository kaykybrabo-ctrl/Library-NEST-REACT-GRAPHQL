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
    const [includeDeleted, setIncludeDeleted] = (0, react_1.useState)(false);
    const [featured, setFeatured] = (0, react_1.useState)([]);
    const [carouselItems, setCarouselItems] = (0, react_1.useState)([]);
    const [currentSlide, setCurrentSlide] = (0, react_1.useState)(0);
    const limit = 5;
    const navigate = (0, react_router_dom_1.useNavigate)();
    const featuredInitialized = (0, react_1.useRef)(false);
    const prevFeaturedCount = (0, react_1.useRef)(0);
    const displayedItems = (0, react_1.useMemo)(() => (carouselItems.length > 0
        ? carouselItems
        : (featured.length > 0 ? featured : books.slice(0, Math.min(8, books.length)))), [carouselItems, featured, books]);
    const slidesLength = displayedItems.length;
    const capitalizeFirst = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
    (0, react_1.useEffect)(() => {
        fetchAuthors();
        fetchBooks();
        fetchFeatured().catch(() => { });
    }, []);
    (0, react_1.useEffect)(() => {
        fetchBooks();
    }, [currentPage, searchQuery, includeDeleted]);
    (0, react_1.useEffect)(() => {
        if (slidesLength <= 1)
            return;
        const id = setTimeout(() => {
            setCurrentSlide((s) => (s + 1) % slidesLength);
        }, 5000);
        return () => clearTimeout(id);
    }, [currentSlide, slidesLength]);
    (0, react_1.useEffect)(() => {
        if (currentSlide >= slidesLength) {
            setCurrentSlide(0);
        }
    }, [slidesLength]);
    const fetchFeatured = async () => {
        try {
            const latestResp = await api_1.default.get(`/api/books?limit=${9999}&page=1${includeDeleted ? '&includeDeleted=1' : ''}`);
            const list = Array.isArray(latestResp.data?.books) ? latestResp.data.books : [];
            const sorted = [...list].sort((a, b) => b.book_id - a.book_id);
            if (sorted.length) {
                const next = sorted.slice(0, Math.min(8, sorted.length));
                setFeatured(next);
                setCarouselItems(next);
                if (prevFeaturedCount.current === 0) {
                    setCurrentSlide(0);
                }
                prevFeaturedCount.current = next.length;
                featuredInitialized.current = true;
            }
        }
        catch { }
    };
    const handleRestoreBook = async (bookId) => {
        try {
            await api_1.default.patch(`/api/books/${bookId}/restore`);
            alert('Livro restaurado com sucesso');
            await fetchBooks();
            setError('');
        }
        catch (err) {
            setError('Falha ao restaurar livro');
            alert('Falha ao restaurar livro');
        }
    };
    const fetchBooks = async () => {
        setLoading(true);
        const page = currentPage + 1;
        const response = await api_1.default.get(`/api/books?limit=${limit}&page=${page}&search=${searchQuery}${includeDeleted ? '&includeDeleted=1' : ''}`);
        if (response.data && Array.isArray(response.data.books)) {
            setBooks(response.data.books);
            setTotalPages(response.data.totalPages);
            if (carouselItems.length === 0) {
                try {
                    const allResp = await api_1.default.get(`/api/books?limit=${9999}&page=1${includeDeleted ? '&includeDeleted=1' : ''}`);
                    const allList = Array.isArray(allResp.data?.books) ? allResp.data.books : response.data.books;
                    const sorted = [...allList].sort((a, b) => b.book_id - a.book_id);
                    const next = sorted.slice(0, Math.min(8, sorted.length));
                    setFeatured(next);
                    setCarouselItems(next);
                    if (prevFeaturedCount.current === 0) {
                        setCurrentSlide(0);
                    }
                    prevFeaturedCount.current = next.length;
                }
                catch {
                    if (response.data.books.length > 0) {
                        const sorted = [...response.data.books].sort((a, b) => b.book_id - a.book_id);
                        const next = sorted.slice(0, Math.min(8, sorted.length));
                        setFeatured(next);
                        setCarouselItems(next);
                        if (prevFeaturedCount.current === 0) {
                            setCurrentSlide(0);
                        }
                        prevFeaturedCount.current = next.length;
                    }
                }
            }
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
            title: capitalizeFirst(newBook.title.trim()),
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
            title: capitalizeFirst(editData.title.trim()),
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
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: "Livros", children: [error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("section", { className: "featured-carousel", style: { marginBottom: 24 }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { marginBottom: 12 }, children: "Novidades" }), slidesLength === 0 ? (books.length > 0 ? ((0, jsx_runtime_1.jsx)("div", { style: { padding: 16, background: '#fff', borderRadius: 10, border: '2px solid #1976d2' }, children: (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }, children: books.slice(0, 8).map((bk) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 14, alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 10, padding: 12, background: '#fff' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: 70, height: 100, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, overflow: 'hidden', flex: '0 0 auto', alignSelf: 'center' }, children: bk.photo ? ((0, jsx_runtime_1.jsx)("img", { src: bk.photo.startsWith('http') || bk.photo.startsWith('/') ? bk.photo : `/api/uploads/${bk.photo}`, alt: bk.title, style: { width: '100%', height: '100%', objectFit: 'cover' } })) : ((0, jsx_runtime_1.jsx)("span", { style: { color: '#999', fontSize: 11 }, children: "Sem imagem" })) }), (0, jsx_runtime_1.jsxs)("div", { style: { minWidth: 0, flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }, children: bk.title }), (0, jsx_runtime_1.jsxs)("div", { style: { color: '#666', fontSize: 12, marginTop: 4 }, children: ["Autor: ", getAuthorName(bk.author_id) || 'Desconhecido'] }), (0, jsx_runtime_1.jsx)("div", { style: { color: '#777', marginTop: 6, fontSize: 12, lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 36 }, children: bk.description || '—' })] })] }, `fallback-${bk.book_id}`))) }) })) : ((0, jsx_runtime_1.jsx)("div", { style: { padding: 20, background: '#fff', borderRadius: 8, border: '2px solid #1976d2' }, children: (0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'center', color: '#666' }, children: "Sem livros para exibir no carrossel." }) }))) : ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', overflow: 'hidden', borderRadius: 10, border: '2px solid #1976d2', background: '#fff', height: 240 }, children: [(() => {
                                const bk = displayedItems[currentSlide];
                                if (!bk)
                                    return null;
                                return ((0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(calc(-50% + 8px))', padding: '0 72px', background: '#fff' }, children: (0, jsx_runtime_1.jsxs)("div", { onClick: () => navigate(`/books/${bk.book_id}`), style: { display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', columnGap: 18, width: '100%', maxWidth: 920, cursor: 'pointer', margin: '0 auto' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: 96, height: 136, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, children: bk.photo ? ((0, jsx_runtime_1.jsx)("img", { src: bk.photo.startsWith('http') || bk.photo.startsWith('/') ? bk.photo : `/api/uploads/${bk.photo}`, alt: bk.title, style: { width: '100%', height: '100%', objectFit: 'cover' } })) : ((0, jsx_runtime_1.jsx)("span", { style: { color: '#999', fontSize: 12 }, children: "Sem imagem" })) }), (0, jsx_runtime_1.jsxs)("div", { style: { minWidth: 0, flex: 1, maxWidth: 620, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 800, fontSize: 20, lineHeight: 1.2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: 48 }, children: bk.title }), (0, jsx_runtime_1.jsxs)("div", { style: { color: '#5a5a5a', fontSize: 13, lineHeight: 1.2 }, children: ["Autor: ", getAuthorName(bk.author_id) || 'Desconhecido'] }), (0, jsx_runtime_1.jsx)("div", { style: { color: '#777', fontSize: 13, lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', minHeight: 56 }, children: bk.description || '—' })] })] }) }, bk.book_id));
                            })(), slidesLength > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 64, background: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)', pointerEvents: 'none', zIndex: 1 } }), (0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 64, background: 'linear-gradient(270deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)', pointerEvents: 'none', zIndex: 1 } })] })), slidesLength > 1 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { type: "button", "aria-label": "Anterior", title: "Anterior", onClick: () => setCurrentSlide((s) => (s - 1 + slidesLength) % slidesLength), style: { position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', background: '#fff', border: '2px solid #1976d2', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3, boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }, children: (0, jsx_runtime_1.jsx)("span", { style: { color: '#1976d2', fontSize: 24, lineHeight: 1 }, children: "<" }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", "aria-label": "Pr\u00F3ximo", title: "Pr\u00F3ximo", onClick: () => setCurrentSlide((s) => (s + 1) % slidesLength), style: { position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', background: '#fff', border: '2px solid #1976d2', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 3, boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }, children: (0, jsx_runtime_1.jsx)("span", { style: { color: '#1976d2', fontSize: 24, lineHeight: 1 }, children: ">" }) }), (0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }, children: displayedItems.map((_, i) => ((0, jsx_runtime_1.jsx)("span", { style: { width: 8, height: 8, borderRadius: '50%', background: i === currentSlide ? '#333' : '#bbb' } }, i))) })] }))] }))] }), isAdmin && ((0, jsx_runtime_1.jsxs)("section", { className: "form-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Adicionar Livro" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleCreateBook, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "author-select", children: "Autor:" }), (0, jsx_runtime_1.jsxs)("select", { id: "author-select", value: newBook.author_id, onChange: (e) => setNewBook({ ...newBook, author_id: e.target.value }), required: true, children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Selecione um autor" }), authors.map(author => ((0, jsx_runtime_1.jsx)("option", { value: author.author_id, children: author.name_author }, author.author_id)))] }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "book-title", children: "T\u00EDtulo:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "book-title", value: newBook.title, onChange: (e) => setNewBook({ ...newBook, title: e.target.value }), required: true }), (0, jsx_runtime_1.jsx)("button", { type: "submit", children: "Adicionar" })] })] })), (0, jsx_runtime_1.jsxs)("section", { className: "search-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Buscar Livros" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSearch, children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Buscar por t\u00EDtulo" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", "aria-label": "Buscar", title: "Buscar", className: "icon-button", children: (0, jsx_runtime_1.jsx)("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z", fill: "currentColor" }) }) }), isAdmin && ((0, jsx_runtime_1.jsxs)("label", { style: { marginLeft: 12, display: 'inline-flex', gap: 6, alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: includeDeleted, onChange: (e) => { setIncludeDeleted(e.target.checked); setCurrentPage(0); } }), "Mostrar exclu\u00EDdos"] }))] })] }), books.length === 0 && searchQuery ? ((0, jsx_runtime_1.jsx)("div", { className: "no-results", children: "Nenhum resultado encontrado para sua busca." })) : ((0, jsx_runtime_1.jsxs)("section", { className: "book-list", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Livros" }), (0, jsx_runtime_1.jsxs)("table", { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { style: { textAlign: 'center' }, children: "ID" }), (0, jsx_runtime_1.jsx)("th", { style: { textAlign: 'center' }, children: "ID do Autor" }), (0, jsx_runtime_1.jsx)("th", { style: { textAlign: 'center' }, children: "Autor" }), (0, jsx_runtime_1.jsx)("th", { style: { textAlign: 'center' }, children: "T\u00EDtulo" }), (0, jsx_runtime_1.jsx)("th", { style: { textAlign: 'center' }, children: "A\u00E7\u00F5es" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: books.map(book => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { style: { textAlign: 'center' }, children: book.book_id }), (0, jsx_runtime_1.jsx)("td", { style: { textAlign: 'center' }, children: book.author_id }), (0, jsx_runtime_1.jsx)("td", { style: { textAlign: 'center' }, children: editingBook === book.book_id ? ((0, jsx_runtime_1.jsx)("select", { value: editData.author_id, onChange: (e) => setEditData({ ...editData, author_id: e.target.value }), children: authors.map(author => ((0, jsx_runtime_1.jsx)("option", { value: author.author_id, children: author.name_author }, author.author_id))) })) : (getAuthorName(book.author_id)) }), (0, jsx_runtime_1.jsx)("td", { style: { textAlign: 'center' }, children: editingBook === book.book_id ? ((0, jsx_runtime_1.jsx)("input", { type: "text", value: editData.title, onChange: (e) => setEditData({ ...editData, title: e.target.value }) })) : (book.title) }), (0, jsx_runtime_1.jsx)("td", { style: { textAlign: 'center' }, children: (0, jsx_runtime_1.jsx)("div", { className: "action-buttons", children: editingBook === book.book_id ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleSaveEdit, children: "Salvar" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleCancelEdit, children: "Cancelar" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => navigate(`/books/${book.book_id}`), "aria-label": "Ver", title: "Ver", className: "icon-button", children: (0, jsx_runtime_1.jsx)("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", fill: "currentColor" }) }) }), isAdmin && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleEditBook(book), "aria-label": "Editar", title: "Editar", className: "icon-button", children: (0, jsx_runtime_1.jsx)("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18-11.5a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75L21 5.75Z", fill: "currentColor" }) }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleDeleteBook(book.book_id), "aria-label": "Excluir", title: "Excluir", className: "icon-button", children: (0, jsx_runtime_1.jsx)("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M6 7h12v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7Zm11-3h-3.5l-1-1h-3L8 4H5v2h14V4Z", fill: "currentColor" }) }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleRestoreBook(book.book_id), "aria-label": "Restaurar", title: "Restaurar", className: "icon-button", children: (0, jsx_runtime_1.jsx)("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { d: "M12 5v2a5 5 0 1 1-4.9 6h2.02A3 3 0 1 0 12 9v2l4-3-4-3Z", fill: "currentColor" }) }) })] }))] })) }) })] }, book.book_id))) })] }), totalPages > 1 && ((0, jsx_runtime_1.jsx)("div", { className: "pagination", children: Array.from({ length: totalPages }, (_, i) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => handlePageChange(i), className: currentPage === i ? 'active' : '', children: i + 1 }, i))) }))] }))] }));
};
exports.default = Books;
