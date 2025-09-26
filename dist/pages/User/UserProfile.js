"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = __importDefault(require("../../api"));
const Layout_1 = __importDefault(require("../../components/Layout"));
const AuthContext_1 = require("../../contexts/AuthContext");
require("./UserProfile.css");
const UserProfile = () => {
    const { user } = (0, AuthContext_1.useAuth)();
    const [profile, setProfile] = (0, react_1.useState)(null);
    const [loans, setLoans] = (0, react_1.useState)([]);
    const [favoriteBook, setFavoriteBook] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)('');
    const [activeTab, setActiveTab] = (0, react_1.useState)('profile');
    const [imageFile, setImageFile] = (0, react_1.useState)(null);
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const [imgVersion, setImgVersion] = (0, react_1.useState)(0);
    const [description, setDescription] = (0, react_1.useState)('');
    const [editingDescription, setEditingDescription] = (0, react_1.useState)(false);
    const buildImageSrc = (path) => {
        if (!path)
            return '';
        if (path.startsWith('http'))
            return `${path}${imgVersion ? (path.includes('?') ? `&v=${imgVersion}` : `?v=${imgVersion}`) : ''}`;
        if (path.startsWith('/'))
            return `${path}${imgVersion ? (path.includes('?') ? `&v=${imgVersion}` : `?v=${imgVersion}`) : ''}`;
        return `/api/uploads/${path}${imgVersion ? `?v=${imgVersion}` : ''}`;
    };
    (0, react_1.useEffect)(() => {
        const token = localStorage.getItem('token');
        if (!token)
            return;
        fetchProfile();
        fetchLoans();
        fetchFavoriteBook();
    }, []);
    (0, react_1.useEffect)(() => {
        if (profile?.description !== undefined) {
            setDescription(profile.description || '');
        }
    }, [profile?.description]);
    const fetchProfile = async () => {
        try {
            const response = await api_1.default.get('/api/get-profile');
            setProfile(response.data);
            setError('');
        }
        catch (e) {
            setError('Falha ao carregar o perfil. Faça login novamente.');
        }
        finally {
            setLoading(false);
        }
    };
    const fetchLoans = async () => {
        if (!user?.username)
            return;
        const response = await api_1.default.get(`/api/loans?username=${user.username}`);
        setLoans(response.data);
    };
    const fetchFavoriteBook = async () => {
        if (!user?.username)
            return;
        const response = await api_1.default.get(`/api/users/favorite?username=${user.username}`);
        if (response.data) {
            setFavoriteBook(response.data);
        }
        else {
            setFavoriteBook(null);
        }
    };
    const onSelectImage = (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        setImageFile(file);
    };
    const handleUploadImage = async () => {
        if (!imageFile)
            return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            const resp = await api_1.default.post('/api/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (resp?.data) {
                setProfile(resp.data);
            }
            setImgVersion((v) => v + 1);
            setImageFile(null);
            setError('');
            alert('Imagem de perfil atualizada com sucesso!');
        }
        catch (e) {
            setError('Falha ao enviar a imagem');
        }
        finally {
            setUploading(false);
        }
    };
    const handleUpdateDescription = async () => {
        setUploading(true);
        const response = await api_1.default.post('/api/save-description', {
            description: description
        });
        setProfile(prev => prev ? {
            ...prev,
            description: description
        } : null);
        setEditingDescription(false);
        setError('');
        alert('Descrição atualizada com sucesso!');
        setUploading(false);
    };
    const handleReturnBook = async (loanId) => {
        const response = await api_1.default.post(`/api/return/${loanId}`, {}, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        fetchLoans();
        alert('Livro devolvido com sucesso!');
        setError('');
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(Layout_1.default, { title: "Perfil do Usu\u00E1rio", children: (0, jsx_runtime_1.jsx)("div", { className: "loading", children: "Carregando perfil..." }) }));
    }
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: "Perfil do Usu\u00E1rio", children: [error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("div", { className: "tabs", children: [(0, jsx_runtime_1.jsx)("button", { className: `tab ${activeTab === 'profile' ? 'active' : ''}`, onClick: () => setActiveTab('profile'), children: "Perfil" }), (0, jsx_runtime_1.jsx)("button", { className: `tab ${activeTab === 'loans' ? 'active' : ''}`, onClick: () => setActiveTab('loans'), children: "Meus Empr\u00E9stimos" }), (0, jsx_runtime_1.jsx)("button", { className: `tab ${activeTab === 'favorite' ? 'active' : ''}`, onClick: () => setActiveTab('favorite'), children: "Livro Favorito" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "tab-content", children: [activeTab === 'profile' && ((0, jsx_runtime_1.jsxs)("section", { className: "profile-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Informa\u00E7\u00F5es do Perfil" }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "E-mail:" }), " ", user?.username || 'Desconhecido'] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Fun\u00E7\u00E3o:" }), " ", user?.role || 'Usuário'] }), (0, jsx_runtime_1.jsxs)("div", { className: "profile-image-container", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Imagem de Perfil" }), (0, jsx_runtime_1.jsx)("div", { className: "profile-image-display", children: profile?.profile_image ? ((0, jsx_runtime_1.jsx)("img", { src: buildImageSrc(profile.profile_image), alt: "Perfil", className: "profile-image", style: {
                                                maxWidth: '200px',
                                                maxHeight: '200px',
                                                objectFit: 'cover',
                                                border: '2px solid #ddd',
                                                borderRadius: '8px',
                                                display: 'block'
                                            }, onError: (e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = '/api/uploads/default-user.png';
                                            } }, `${profile?.profile_image}-${imgVersion}`)) : ((0, jsx_runtime_1.jsx)("div", { style: {
                                                width: '200px',
                                                height: '200px',
                                                border: '2px dashed #ccc',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#f9f9f9',
                                                color: '#666'
                                            }, children: "Nenhuma imagem de perfil enviada ainda" })) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "description-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Descri\u00E7\u00E3o" }), editingDescription ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Conte-nos sobre voc\u00EA...", rows: 4, className: "description-textarea" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleUpdateDescription, disabled: uploading, children: uploading ? 'Salvando...' : 'Salvar Descrição' }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                            setEditingDescription(false);
                                                            setDescription(profile?.description || '');
                                                        }, className: "cancel-button", children: "Cancelar" })] })] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { children: profile?.description || 'Nenhuma descrição adicionada ainda.' }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setEditingDescription(true), children: "Editar Descri\u00E7\u00E3o" })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "image-upload", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Atualizar Imagem de Perfil" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", onChange: onSelectImage, disabled: uploading }), (0, jsx_runtime_1.jsx)("button", { onClick: handleUploadImage, disabled: !imageFile || uploading, children: uploading ? 'Enviando...' : 'Enviar' })] })] })] })), activeTab === 'loans' && ((0, jsx_runtime_1.jsxs)("section", { className: "profile-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Meus Livros Emprestados" }), loans.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { children: "Voc\u00EA ainda n\u00E3o emprestou nenhum livro." })) : ((0, jsx_runtime_1.jsx)("div", { children: loans.map(loan => ((0, jsx_runtime_1.jsxs)("div", { className: "loan-card", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { children: loan.title }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Data do Empr\u00E9stimo:" }), " ", new Date(loan.loan_date).toLocaleDateString('pt-BR')] }), loan.description && (0, jsx_runtime_1.jsx)("p", { children: loan.description })] }), (0, jsx_runtime_1.jsxs)("div", { className: "loan-actions", children: [loan.photo && ((0, jsx_runtime_1.jsx)("img", { src: buildImageSrc(loan.photo), alt: loan.title, className: "loan-book-image" })), (0, jsx_runtime_1.jsx)("button", { onClick: (e) => {
                                                        e.preventDefault();
                                                        handleReturnBook(loan.loans_id);
                                                    }, className: "return-button", children: "Devolver Livro" })] })] }, loan.loans_id))) }))] })), activeTab === 'favorite' && ((0, jsx_runtime_1.jsxs)("section", { className: "profile-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Meu Livro Favorito" }), !favoriteBook ? ((0, jsx_runtime_1.jsx)("p", { children: "Voc\u00EA ainda n\u00E3o definiu um livro favorito." })) : ((0, jsx_runtime_1.jsxs)("div", { className: "favorite-book-card", children: [favoriteBook.photo && ((0, jsx_runtime_1.jsx)("img", { src: buildImageSrc(favoriteBook.photo), alt: favoriteBook.title, className: "favorite-book-image" })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { children: favoriteBook.title }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Autor:" }), " ", favoriteBook.author_name || 'Desconhecido'] }), favoriteBook.description && ((0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Descri\u00E7\u00E3o:" }), " ", favoriteBook.description] }))] })] }))] }))] })] }));
};
exports.default = UserProfile;
