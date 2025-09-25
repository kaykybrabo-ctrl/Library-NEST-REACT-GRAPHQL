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
            setError('Selecione um arquivo de imagem válido (JPG, PNG, GIF, WebP)');
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
        setUploadStatus('Enviando imagem...');
        try {
            const formData = new FormData();
            formData.append('file', file);
            const uploadResp = await api_1.default.post(`/api/books/${id}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
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
            setUploadStatus('Imagem atualizada com sucesso!');
        }
        catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Falha ao enviar a imagem';
            setError(msg);
            setUploadStatus(`Erro: ${msg}`);
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
            setError('Falha ao buscar detalhes do livro');
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
            alert('Imagem do livro atualizada com sucesso!');
        }
        catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Falha ao enviar a imagem';
            setError(msg);
            alert(`Erro: ${msg}`);
        }
        finally {
            setUploading(false);
        }
    };
    const handleRentBook = async () => {
        try {
            await api_1.default.post(`/api/rent/${id}`);
            alert('Livro alugado com sucesso!');
            setError('');
        }
        catch (err) {
            const errorMsg = err.response?.data?.error || 'Falha ao alugar o livro. Você pode não estar logado ou o livro já está alugado.';
            setError(errorMsg);
            alert(`Erro: ${errorMsg}`);
        }
    };
    const handleFavoriteBook = async () => {
        try {
            await api_1.default.post(`/api/favorite/${id}`);
            alert('Livro adicionado aos favoritos!');
            setError('');
        }
        catch (err) {
            const errorMsg = err.response?.data?.error || 'Falha ao adicionar o livro aos favoritos';
            setError(errorMsg);
            alert(`Erro: ${errorMsg}`);
        }
    };
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            setError('Faça login para enviar uma avaliação');
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
            alert('Avaliação enviada com sucesso!');
            setError('');
        }
        catch (err) {
            const errorMsg = err.response?.data?.error || 'Falha ao enviar a avaliação';
            setError(errorMsg);
            alert(`Erro: ${errorMsg}`);
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(Layout_1.default, { title: "Detalhes do Livro", children: (0, jsx_runtime_1.jsx)("div", { className: "loading", children: "Carregando detalhes do livro..." }) }));
    }
    if (!book) {
        return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: "Detalhes do Livro", children: [(0, jsx_runtime_1.jsx)("div", { className: "error-message", children: "Livro n\u00E3o encontrado" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => navigate('/books'), children: "Voltar para Livros" })] }));
    }
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: `Livro: ${book.title}`, children: [error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("section", { className: "profile-section image-tight", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => navigate('/books'), className: "back-button", children: "\u2190 Voltar para Livros" }), (0, jsx_runtime_1.jsx)("h2", { children: book.title }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Autor:" }), " ", book.author_name || 'Desconhecido'] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Descri\u00E7\u00E3o:" }), " ", book.description || 'Sem descrição disponível'] }), previewUrl ? ((0, jsx_runtime_1.jsx)("img", { src: previewUrl, alt: "Pr\u00E9-visualiza\u00E7\u00E3o selecionada", className: "book-image" })) : book.photo ? ((0, jsx_runtime_1.jsx)("img", { src: buildImageSrc(book.photo), alt: book.title, className: "book-image", onError: (e) => {
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
                        } }, `${book.photo}-${imgVersion}`)) : null, !previewUrl && !book.photo && ((0, jsx_runtime_1.jsx)("div", { className: "image-placeholder", children: "Nenhuma imagem definida ainda. Selecione um arquivo abaixo para enviar." })), !book.photo && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8, fontSize: 12, color: '#666' }, children: "Nenhuma imagem definida para este livro ainda." })), isAdmin && ((0, jsx_runtime_1.jsxs)("div", { className: "image-upload", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Atualizar Imagem do Livro" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", onChange: onSelectImage, disabled: uploading }), imageFile && ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12, color: '#666', marginTop: 4 }, children: ["Selecionado: ", imageFile.name] })), (0, jsx_runtime_1.jsx)("button", { onClick: handleUploadImageClick, disabled: !imageFile || uploading, children: uploading ? 'Enviando...' : 'Atualizar Imagem' })] })] })), uploadStatus && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8, fontSize: 12, color: uploadStatus.startsWith('Erro') ? '#c00' : '#0a0' }, children: uploadStatus }))] }), (0, jsx_runtime_1.jsxs)("section", { className: "form-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "A\u00E7\u00F5es do Livro" }), (0, jsx_runtime_1.jsxs)("div", { className: "book-actions", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleRentBook, children: "Alugar Livro" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleFavoriteBook, children: "Adicionar aos Favoritos" })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "form-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Escreva uma Avalia\u00E7\u00E3o" }), !currentUser ? ((0, jsx_runtime_1.jsx)("p", { children: "Fa\u00E7a login para escrever uma avalia\u00E7\u00E3o." })) : ((0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmitReview, children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { sx: { mb: 2 }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { component: "legend", sx: { mb: 1 }, children: "Nota:" }), (0, jsx_runtime_1.jsx)(material_1.Rating, { name: "book-rating", value: newReview.rating, onChange: (_, newValue) => {
                                            setNewReview({ ...newReview, rating: newValue || 1 });
                                        }, max: 5, size: "large" })] }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "comment", children: "Coment\u00E1rio:" }), (0, jsx_runtime_1.jsx)("textarea", { id: "comment", value: newReview.comment, onChange: (e) => setNewReview({ ...newReview, comment: e.target.value }), rows: 4, className: "review-textarea" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", children: "Enviar Avalia\u00E7\u00E3o" })] }))] }), (0, jsx_runtime_1.jsxs)("section", { className: "form-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Avalia\u00E7\u00F5es" }), reviews.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { children: "Sem avalia\u00E7\u00F5es ainda." })) : ((0, jsx_runtime_1.jsx)("div", { children: reviews.map(review => ((0, jsx_runtime_1.jsxs)("div", { className: "review-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "review-header", children: [(0, jsx_runtime_1.jsx)("strong", { children: review.username }), (0, jsx_runtime_1.jsxs)("span", { children: ['★'.repeat(review.rating), '☆'.repeat(5 - review.rating)] })] }), (0, jsx_runtime_1.jsx)("p", { children: review.comment }), (0, jsx_runtime_1.jsx)("small", { className: "review-date", children: new Date(review.review_date).toLocaleDateString('pt-BR') })] }, review.review_id))) }))] })] }));
};
exports.default = BookDetail;
