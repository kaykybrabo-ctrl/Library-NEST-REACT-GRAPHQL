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
            setError('Please select a valid image file (JPG, PNG, GIF, WebP)');
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
            try {
                alert('Author image updated successfully!');
            }
            catch { }
        }
        catch (err) {
            const msg = err?.response?.data?.error || err?.message || 'Failed to upload author image';
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
            setError('Failed to fetch author details');
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
            try {
                alert('Author image updated successfully!');
            }
            catch { }
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
            await api_1.default.put(`/api/authors/${id}`, {
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
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: `Author: ${author.name_author}`, children: [error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("section", { className: "profile-section image-tight", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => navigate('/authors'), className: "back-button", children: "\u2190 Back to Authors" }), (0, jsx_runtime_1.jsx)("h2", { children: author.name_author }), (0, jsx_runtime_1.jsxs)("div", { className: "author-info", children: [previewUrl ? ((0, jsx_runtime_1.jsx)("img", { src: previewUrl, alt: "Selected preview", className: "author-image" })) : author.photo ? ((0, jsx_runtime_1.jsx)("img", { src: buildImageSrc(author.photo), alt: author.name_author, className: "author-image", onError: (e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = '/api/uploads/default-user.png';
                                } }, `${author.photo}-${imgVersion}`)) : ((0, jsx_runtime_1.jsx)("div", { className: "image-placeholder", children: "No photo set yet. Select a file below to upload." })), !author.photo && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8, fontSize: 12, color: '#666' }, children: "No photo set for this author yet." })), (0, jsx_runtime_1.jsxs)("div", { className: "biography-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Biography" }), editingBio ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("textarea", { value: biography, onChange: (e) => setBiography(e.target.value), placeholder: "Enter author biography...", rows: 6, className: "biography-textarea" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleUpdateBiography, disabled: uploading, children: uploading ? 'Saving...' : 'Save Biography' }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                            setEditingBio(false);
                                                            setBiography(author?.biography || '');
                                                        }, className: "cancel-button", children: "Cancel" })] })] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "biography-text", children: author.biography || 'No biography available yet.' }), isAdmin && ((0, jsx_runtime_1.jsx)("button", { onClick: () => setEditingBio(true), children: "Edit Biography" }))] }))] }), isAdmin && ((0, jsx_runtime_1.jsxs)("div", { className: "image-upload image-upload-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Update Author Photo" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", onChange: onSelectImage, className: "file-input", disabled: uploading }), imageFile && ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12, color: '#666', marginTop: 4 }, children: ["Selected: ", imageFile.name] })), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleUploadImageClick(), disabled: !imageFile || uploading, children: uploading ? 'Uploading...' : 'Upload Photo' })] })] }))] })] })] }));
};
exports.default = AuthorDetail;
