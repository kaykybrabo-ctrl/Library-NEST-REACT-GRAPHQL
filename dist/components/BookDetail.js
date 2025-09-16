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
require("./BookDetail.css");
const BookDetail = () => {
    const { id } = (0, react_router_dom_1.useParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [book, setBook] = (0, react_1.useState)(null);
    const [reviews, setReviews] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)('');
    const [imageFile, setImageFile] = (0, react_1.useState)(null);
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const [newReview, setNewReview] = (0, react_1.useState)({ rating: 5, comment: '' });
    const [currentUser, setCurrentUser] = (0, react_1.useState)(null);
    const { isAdmin } = (0, AuthContext_1.useAuth)();
    (0, react_1.useEffect)(() => {
        if (id) {
            fetchBook();
            fetchReviews();
            checkAuthStatus();
        }
    }, [id]);
    const checkAuthStatus = async () => {
        try {
            const response = await axios_1.default.get('/api/user/me', {
                withCredentials: true
            });
            setCurrentUser(response.data);
        }
        catch {
            setCurrentUser(null);
        }
    };
    const fetchBook = async () => {
        try {
            const response = await axios_1.default.get(`/api/books/${id}`);
            setBook(response.data);
            setLoading(false);
        }
        catch (err) {
            setError('Failed to fetch book details');
            setLoading(false);
        }
    };
    const fetchReviews = async () => {
        try {
            const response = await axios_1.default.get('/api/reviews');
            const bookReviews = response.data.filter((review) => review.book_id === Number(id));
            setReviews(bookReviews);
        }
        catch (err) {
        }
    };
    const handleImageUpload = async (e) => {
        e.preventDefault();
        if (!imageFile || !id)
            return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', imageFile);
        try {
            await axios_1.default.post(`/api/books/${id}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchBook();
            setImageFile(null);
        }
        catch (err) {
            setError('Failed to upload image');
        }
        finally {
            setUploading(false);
        }
    };
    const handleRentBook = async () => {
        try {
            await axios_1.default.post(`/api/rent/${id}`, {}, {
                withCredentials: true
            });
            alert('Book rented successfully!');
            setError('');
        }
        catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to rent book. You may not be logged in or book is already rented.';
            setError(errorMsg);
            alert(`Error: ${errorMsg}`);
        }
    };
    const handleFavoriteBook = async () => {
        try {
            await axios_1.default.post(`/api/favorite/${id}`, {}, {
                withCredentials: true
            });
            alert('Book added to favorites!');
            setError('');
        }
        catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to add book to favorites';
            setError(errorMsg);
            alert(`Error: ${errorMsg}`);
        }
    };
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            setError('Please log in to submit a review');
            return;
        }
        try {
            await axios_1.default.post('/api/reviews', {
                book_id: Number(id),
                user_id: currentUser.id,
                rating: newReview.rating,
                comment: newReview.comment
            }, {
                withCredentials: true
            });
            setNewReview({ rating: 5, comment: '' });
            fetchReviews();
            alert('Review submitted successfully!');
            setError('');
        }
        catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to submit review';
            setError(errorMsg);
            alert(`Error: ${errorMsg}`);
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(Layout_1.default, { title: "Book Details", children: (0, jsx_runtime_1.jsx)("div", { className: "loading", children: "Loading book details..." }) }));
    }
    if (!book) {
        return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: "Book Details", children: [(0, jsx_runtime_1.jsx)("div", { className: "error-message", children: "Book not found" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => navigate('/books'), children: "Back to Books" })] }));
    }
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: `Book: ${book.title}`, children: [error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("section", { className: "profile-section", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => navigate('/books'), className: "back-button", children: "\u2190 Back to Books" }), (0, jsx_runtime_1.jsx)("h2", { children: book.title }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Author:" }), " ", book.author_name || 'Unknown'] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Description:" }), " ", book.description || 'No description available'] }), book.photo && ((0, jsx_runtime_1.jsx)("img", { src: book.photo.startsWith('http') ? book.photo : `/api/uploads/${book.photo}`, alt: book.title, className: "book-image" })), isAdmin && ((0, jsx_runtime_1.jsxs)("div", { className: "image-upload", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Update Book Image" }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleImageUpload, children: [(0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", onChange: (e) => setImageFile(e.target.files?.[0] || null), required: true }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !imageFile || uploading, children: uploading ? 'Uploading...' : 'Update Image' })] })] }))] })] }));
};
exports.default = BookDetail;
