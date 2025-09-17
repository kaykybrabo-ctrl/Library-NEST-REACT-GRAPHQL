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
const material_1 = require("@mui/material");
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
    const [previewUrl, setPreviewUrl] = (0, react_1.useState)('');
    const [uploadStatus, setUploadStatus] = (0, react_1.useState)('');
    const [newReview, setNewReview] = (0, react_1.useState)({ rating: 5, comment: '' });
    const [currentUser, setCurrentUser] = (0, react_1.useState)(null);
    const { isAdmin } = (0, AuthContext_1.useAuth)();
    const [imgVersion, setImgVersion] = (0, react_1.useState)(0);
    const buildImageSrc = (path) => {
        if (!path)
            return '';
        if (path.startsWith('http'))
            return `${path}${imgVersion ? (path.includes('?') ? `&v=${imgVersion}` : `?v=${imgVersion}`) : ''}`;
        if (path.startsWith('/'))
            return `${path}${imgVersion ? (path.includes('?') ? `&v=${imgVersion}` : `?v=${imgVersion}`) : ''}`;
        return `/api/uploads/${path}${imgVersion ? `?v=${imgVersion}` : ''}`;
    };
    const onSelectImage = (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file (JPG, PNG, GIF, WebP)');
            event.currentTarget.value = '';
            return;
        }
        setImageFile(file);
        setError('');
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        uploadImage(file);
    };
    const uploadImage = async (file) => {
        if (!file || !id)
            return;
        setUploading(true);
        setUploadStatus('Uploading image...');
        try {
            const formData = new FormData();
            formData.append('file', file);
            console.log('[BookDetail] Uploading image for book', id, 'file=', file?.name);
            const uploadResp = await api_1.default.post(`/api/books/${id}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('[BookDetail] Upload success, refreshing book');
            setBook(prev => {
                if (!prev)
                    return prev;
                const respPhoto = uploadResp?.data?.photo;
                return { ...prev, photo: respPhoto || prev?.photo || null };
            });
            await fetchBook();
            setImageFile(null);
            setPreviewUrl('');
            setImgVersion(v => v + 1);
            setUploadStatus('Image updated successfully!');
            try {
                alert('Book image updated successfully!');
            }
            catch { }
        }
        catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Failed to upload image';
            setError(msg);
            console.error('[BookDetail] Upload error:', err?.response || err);
            setUploadStatus(`Error: ${msg}`);
            try {
                alert(`Error: ${msg}`);
            }
            catch { }
        }
        finally {
            setUploading(false);
        }
    };
    const handleUploadImageClick = async () => {
        if (!imageFile)
            return;
        await uploadImage(imageFile);
    };
    (0, react_1.useEffect)(() => {
        if (id) {
            fetchBook();
            fetchReviews();
            checkAuthStatus();
        }
        return () => {
            if (previewUrl)
                URL.revokeObjectURL(previewUrl);
        };
    }, [id, previewUrl]);
    const checkAuthStatus = async () => {
        try {
            const response = await api_1.default.get('/api/user/me');
            setCurrentUser(response.data);
        }
        catch {
            setCurrentUser(null);
        }
    };
    const fetchBook = async () => {
        try {
            const response = await api_1.default.get(`/api/books/${id}`);
            setBook(prev => {
                const incoming = response.data;
                if (!incoming)
                    return null;
                const photo = incoming.photo ?? prev?.photo ?? null;
                return { ...incoming, photo: photo };
            });
            setLoading(false);
        }
        catch (err) {
            setError('Failed to fetch book details');
            setLoading(false);
        }
    };
    const fetchReviews = async () => {
        try {
            const response = await api_1.default.get('/api/reviews');
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
            const resp = await api_1.default.post(`/api/books/${id}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchBook();
            setImageFile(null);
            setImgVersion(v => v + 1);
            try {
                alert('Book image updated successfully!');
            }
            catch { }
        }
        catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Failed to upload image';
            setError(msg);
            try {
                alert(`Error: ${msg}`);
            }
            catch { }
        }
        finally {
            setUploading(false);
        }
    };
    const handleRentBook = async () => {
        try {
            await api_1.default.post(`/api/rent/${id}`);
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
            await api_1.default.post(`/api/favorite/${id}`);
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
            await api_1.default.post('/api/reviews', {
                book_id: Number(id),
                user_id: currentUser.id,
                rating: newReview.rating,
                comment: newReview.comment
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
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: `Book: ${book.title}`, children: [error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("section", { className: "profile-section image-tight", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => navigate('/books'), className: "back-button", children: "\u2190 Back to Books" }), (0, jsx_runtime_1.jsx)("h2", { children: book.title }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Author:" }), " ", book.author_name || 'Unknown'] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Description:" }), " ", book.description || 'No description available'] }), previewUrl ? ((0, jsx_runtime_1.jsx)("img", { src: previewUrl, alt: "Selected preview", className: "book-image" })) : book.photo ? ((0, jsx_runtime_1.jsx)("img", { src: buildImageSrc(book.photo), alt: book.title, className: "book-image", onError: (e) => {
                            try {
                                const current = e.currentTarget.getAttribute('src') || '';
                                const file = (current.split('?')[0].split('/').pop() || '').trim();
                                if (file) {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = `/api/uploads/${file}`;
                                    return;
                                }
                            }
                            catch { }
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/api/uploads/default-user.png';
                        } }, `${book.photo}-${imgVersion}`)) : null, !previewUrl && !book.photo && ((0, jsx_runtime_1.jsx)("div", { className: "image-placeholder", children: "No image set yet. Select a file below to upload." })), book.photo && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8, fontSize: 12, color: '#666' }, children: ["Current image src: ", (0, jsx_runtime_1.jsx)("a", { href: buildImageSrc(book.photo), target: "_blank", rel: "noreferrer", children: buildImageSrc(book.photo) }), (0, jsx_runtime_1.jsxs)("div", { children: ["Raw book.photo: ", (0, jsx_runtime_1.jsx)("code", { children: String(book.photo) })] })] })), !book.photo && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8, fontSize: 12, color: '#666' }, children: "No image set for this book yet." })), isAdmin && ((0, jsx_runtime_1.jsxs)("div", { className: "image-upload", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Update Book Image" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", onChange: onSelectImage, disabled: uploading }), imageFile && ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12, color: '#666', marginTop: 4 }, children: ["Selected: ", imageFile.name] })), (0, jsx_runtime_1.jsx)("button", { onClick: handleUploadImageClick, disabled: !imageFile || uploading, children: uploading ? 'Uploading...' : 'Update Image' })] })] })), uploadStatus && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8, fontSize: 12, color: uploadStatus.startsWith('Error') ? '#c00' : '#0a0' }, children: uploadStatus })), (0, jsx_runtime_1.jsxs)("details", { style: { marginTop: 12 }, children: [(0, jsx_runtime_1.jsx)("summary", { children: "Debug: Raw book JSON" }), (0, jsx_runtime_1.jsx)("pre", { style: { whiteSpace: 'pre-wrap', fontSize: 12, color: '#444', background: '#f7f7f7', padding: 8, borderRadius: 4 }, children: JSON.stringify(book, null, 2) })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "form-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Book Actions" }), (0, jsx_runtime_1.jsxs)("div", { className: "book-actions", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleRentBook, children: "Rent Book" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleFavoriteBook, children: "Add to Favorites" })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "form-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Write a Review" }), !currentUser ? ((0, jsx_runtime_1.jsx)("p", { children: "Please log in to write a review." })) : ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmitReview, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { component: "legend", sx: { mb: 1 }, children: "Rating:" }), (0, jsx_runtime_1.jsx)(material_1.Rating, { name: "book-rating", value: newReview.rating, onChange: (_, newValue) => {
                                            setNewReview({ ...newReview, rating: newValue || 1 });
                                        }, max: 5, size: "large" })] }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "comment", children: "Comment:" }), (0, jsx_runtime_1.jsx)("textarea", { id: "comment", value: newReview.comment, onChange: (e) => setNewReview({ ...newReview, comment: e.target.value }), rows: 4, className: "review-textarea" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", children: "Submit Review" })] }))] }), (0, jsx_runtime_1.jsxs)("section", { className: "form-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Reviews" }), reviews.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { children: "No reviews yet." })) : ((0, jsx_runtime_1.jsx)("div", { children: reviews.map(review => ((0, jsx_runtime_1.jsxs)("div", { className: "review-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "review-header", children: [(0, jsx_runtime_1.jsx)("strong", { children: review.username }), (0, jsx_runtime_1.jsxs)("span", { children: ['★'.repeat(review.rating), '☆'.repeat(5 - review.rating)] })] }), (0, jsx_runtime_1.jsx)("p", { children: review.comment }), (0, jsx_runtime_1.jsx)("small", { className: "review-date", children: new Date(review.review_date).toLocaleDateString() })] }, review.review_id))) }))] })] }));
};
exports.default = BookDetail;
