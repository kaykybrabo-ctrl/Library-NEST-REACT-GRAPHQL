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
require("./AuthorDetail.css");
const AuthorDetail = () => {
    const { id } = (0, react_router_dom_1.useParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [author, setAuthor] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)('');
    const [imageFile, setImageFile] = (0, react_1.useState)(null);
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const [editingBio, setEditingBio] = (0, react_1.useState)(false);
    const [biography, setBiography] = (0, react_1.useState)('');
    const { isAdmin } = (0, AuthContext_1.useAuth)();
    const [imgVersion, setImgVersion] = (0, react_1.useState)(0);
    const [previewUrl, setPreviewUrl] = (0, react_1.useState)('');
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
        handleUploadImageClick(file);
    };
    const handleUploadImageClick = async (fileParam) => {
        const file = fileParam || imageFile;
        if (!file)
            return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await api_1.default.post(`/api/authors/${id}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAuthor(prev => prev ? { ...prev, photo: response.data.photo } : null);
            setImageFile(null);
            setImgVersion(v => v + 1);
            setError('');
            alert('Imagem do autor atualizada com sucesso!');
        }
        catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Falha ao enviar a imagem do autor';
            setError(msg);
            alert(`Erro: ${msg}`);
        }
        finally {
            setUploading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        if (id) {
            fetchAuthor();
        }
        return () => {
            if (previewUrl)
                URL.revokeObjectURL(previewUrl);
        };
    }, [id, previewUrl]);
    const fetchAuthor = async () => {
        try {
            const response = await api_1.default.get(`/api/authors/${id}`);
            setAuthor(response.data);
            setBiography(response.data.biography || '');
            setLoading(false);
        }
        catch (err) {
            setError('Falha ao buscar detalhes do autor');
            setLoading(false);
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
            const response = await api_1.default.post(`/api/authors/${id}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAuthor(prev => prev ? { ...prev, photo: response.data.photo } : null);
            setImageFile(null);
            setError('');
            setImgVersion(v => v + 1);
            alert('Imagem do autor atualizada com sucesso!');
        }
        catch (err) {
            setError(err.response?.data?.error || 'Falha ao enviar a imagem do autor');
        }
        finally {
            setUploading(false);
        }
    };
    const handleUpdateBiography = async () => {
        setUploading(true);
        try {
            await api_1.default.put(`/api/authors/${id}`, {
                name_author: author?.name_author,
                biography: biography
            });
            setAuthor(prev => prev ? { ...prev, biography: biography } : null);
            setEditingBio(false);
            setError('');
            alert('Biografia atualizada com sucesso!');
        }
        catch (err) {
            setError(err.response?.data?.error || 'Falha ao atualizar a biografia');
        }
        finally {
            setUploading(false);
        }
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(Layout_1.default, { title: "Detalhes do Autor", children: (0, jsx_runtime_1.jsx)("div", { className: "loading", children: "Carregando detalhes do autor..." }) }));
    }
    if (!author) {
        return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: "Detalhes do Autor", children: [(0, jsx_runtime_1.jsx)("div", { className: "error-message", children: "Autor n\u00E3o encontrado" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => navigate('/authors'), children: "Voltar para Autores" })] }));
    }
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: `Autor: ${author.name_author}`, children: [error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("section", { className: "profile-section image-tight", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => navigate('/authors'), className: "back-button", children: "\u2190 Voltar para Autores" }), (0, jsx_runtime_1.jsx)("h2", { children: author.name_author }), (0, jsx_runtime_1.jsxs)("div", { className: "author-info", children: [previewUrl ? ((0, jsx_runtime_1.jsx)("img", { src: previewUrl, alt: "Pr\u00E9-visualiza\u00E7\u00E3o selecionada", className: "author-image" })) : author.photo ? ((0, jsx_runtime_1.jsx)("img", { src: buildImageSrc(author.photo), alt: author.name_author, className: "author-image", onError: (e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/api/uploads/default-user.png';
                                } }, `${author.photo}-${imgVersion}`)) : ((0, jsx_runtime_1.jsx)("div", { className: "image-placeholder", children: "Nenhuma foto definida ainda. Selecione um arquivo abaixo para enviar." })), !author.photo && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8, fontSize: 12, color: '#666' }, children: "Nenhuma foto definida para este autor ainda." })), (0, jsx_runtime_1.jsxs)("div", { className: "biography-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Biografia" }), editingBio ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("textarea", { value: biography, onChange: (e) => setBiography(e.target.value), placeholder: "Digite a biografia do autor...", rows: 6, className: "biography-textarea" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleUpdateBiography, disabled: uploading, children: uploading ? 'Salvando...' : 'Salvar Biografia' }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                            setEditingBio(false);
                                                            setBiography(author?.biography || '');
                                                        }, className: "cancel-button", children: "Cancelar" })] })] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "biography-text", children: author.biography || 'Nenhuma biografia disponível ainda.' }), isAdmin && ((0, jsx_runtime_1.jsx)("button", { onClick: () => setEditingBio(true), children: "Editar Biografia" }))] }))] }), isAdmin && ((0, jsx_runtime_1.jsxs)("div", { className: "image-upload image-upload-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Atualizar Foto do Autor" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", onChange: onSelectImage, className: "file-input", disabled: uploading }), imageFile && ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12, color: '#666', marginTop: 4 }, children: ["Selecionado: ", imageFile.name] })), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleUploadImageClick(), disabled: !imageFile || uploading, children: uploading ? 'Enviando...' : 'Enviar Foto' })] })] }))] })] })] }));
};
exports.default = AuthorDetail;
