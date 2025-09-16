"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const axios_1 = __importDefault(require("axios"));
const Layout_1 = __importDefault(require("./Layout"));
const AuthContext_1 = require("../contexts/AuthContext");
require("./AuthorDetail.css");
const AuthorDetail = () => {
    const { id } = (0, react_router_dom_1.useParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [author, setAuthor] = (0, react_1.useState)(null);
    const [books, setBooks] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)('');
    const [imageFile, setImageFile] = (0, react_1.useState)(null);
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const [editingBio, setEditingBio] = (0, react_1.useState)(false);
    const [biography, setBiography] = (0, react_1.useState)('');
    const { isAdmin } = (0, AuthContext_1.useAuth)();
    (0, react_1.useEffect)(() => {
        if (id) {
            fetchAuthor();
            fetchAuthorBooks();
        }
    }, [id]);
    const fetchAuthor = async () => {
        try {
            const response = await axios_1.default.get(`/api/authors/${id}`);
            setAuthor(response.data);
            setBiography(response.data.biography || '');
            setLoading(false);
        }
        catch (err) {
            setError('Failed to fetch author details');
            setLoading(false);
        }
    };
    const fetchAuthorBooks = async () => {
        try {
            const response = await axios_1.default.get('/api/books?limit=9999&offset=0');
            const authorBooks = response.data.filter((book) => book.author_id === Number(id));
            setBooks(authorBooks);
        }
        catch (err) {
        }
    };
    const handleImageUpload = async (e) => {
        e.preventDefault();
        if (!imageFile)
            return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', imageFile);
        try {
            const response = await axios_1.default.post(`/api/authors/${id}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAuthor(prev => prev ? { ...prev, photo: response.data.photo } : null);
            setImageFile(null);
            setError('');
            alert('Author image updated successfully!');
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to upload author image');
        }
        finally {
            setUploading(false);
        }
    };
    const handleUpdateBiography = async () => {
        setUploading(true);
        try {
            await axios_1.default.put(`/api/authors/${id}`, {
                name_author: author?.name_author,
                biography: biography
            });
            setAuthor(prev => prev ? { ...prev, biography: biography } : null);
            setEditingBio(false);
            setError('');
            alert('Biography updated successfully!');
        }
        catch (err) {
            setError(err.response?.data?.error || 'Failed to update biography');
        }
        finally {
            setUploading(false);
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(Layout_1.default, { title: "Author Details", children: (0, jsx_runtime_1.jsx)("div", { className: "loading", children: "Loading author details..." }) }));
    }
    if (!author) {
        return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: "Author Details", children: [(0, jsx_runtime_1.jsx)("div", { className: "error-message", children: "Author not found" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => navigate('/authors'), children: "Back to Authors" })] }));
    }
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: `Author: ${author.name_author}`, children: [error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("section", { className: "profile-section", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => navigate('/authors'), className: "back-button", children: "\u2190 Back to Authors" }), (0, jsx_runtime_1.jsx)("h2", { children: author.name_author }), (0, jsx_runtime_1.jsxs)("div", { className: "author-info", children: [author.photo && ((0, jsx_runtime_1.jsx)("img", { src: author.photo.startsWith('http') ? author.photo : `/api/uploads/${author.photo}`, alt: author.name_author, className: "author-image", onError: (e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/api/uploads/default-user.png';
                                } })), (0, jsx_runtime_1.jsxs)("div", { className: "biography-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Biography" }), editingBio ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("textarea", { value: biography, onChange: (e) => setBiography(e.target.value), placeholder: "Enter author biography...", rows: 6, className: "biography-textarea" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleUpdateBiography, disabled: uploading, children: uploading ? 'Saving...' : 'Save Biography' }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                            setEditingBio(false);
                                                            setBiography(author?.biography || '');
                                                        }, className: "cancel-button", children: "Cancel" })] })] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "biography-text", children: author.biography || 'No biography available yet.' }), isAdmin && ((0, jsx_runtime_1.jsx)("button", { onClick: () => setEditingBio(true), children: "Edit Biography" }))] }))] }), isAdmin && ((0, jsx_runtime_1.jsxs)("div", { className: "image-upload image-upload-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Update Author Photo" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleImageUpload, children: [(0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/jpeg,image/jpg,image/png,image/gif,image/webp", onChange: (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file && file.type.startsWith('image/')) {
                                                        setImageFile(file);
                                                        setError('');
                                                    }
                                                    else {
                                                        setError('Please select a valid image file (JPG, PNG, GIF, WebP)');
                                                        e.target.value = '';
                                                    }
                                                }, className: "file-input" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !imageFile || uploading, children: uploading ? 'Uploading...' : 'Upload Photo' })] })] }))] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "book-list", children: [(0, jsx_runtime_1.jsxs)("h3", { children: ["Books by ", author.name_author] }), books.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { children: "No books found for this author." })) : ((0, jsx_runtime_1.jsxs)("table", { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "ID" }), (0, jsx_runtime_1.jsx)("th", { children: "Title" }), (0, jsx_runtime_1.jsx)("th", { children: "Actions" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: books.map(book => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: book.book_id }), (0, jsx_runtime_1.jsx)("td", { children: book.title }), (0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)("button", { onClick: () => navigate(`/books/${book.book_id}`), children: "View Book" }) })] }, book.book_id))) })] }))] })] }));
};
exports.default = AuthorDetail;
