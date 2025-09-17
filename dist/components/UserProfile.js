"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const api_1 = __importDefault(require("../api"));
const Layout_1 = __importDefault(require("./Layout"));
const AuthContext_1 = require("../contexts/AuthContext");
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
        // append version even for absolute URLs to avoid stale cache
        if (path.startsWith('http'))
            return `${path}${imgVersion ? (path.includes('?') ? `&v=${imgVersion}` : `?v=${imgVersion}`) : ''}`;
        if (path.startsWith('/'))
            return `${path}${imgVersion ? (path.includes('?') ? `&v=${imgVersion}` : `?v=${imgVersion}`) : ''}`;
        // append a version to bust cache/race after uploads
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
            // nada adicional: render direto usa buildImageSrc + key
        }
        catch (e) {
            setError('Failed to load profile. Please login again.');
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
            // resp.data já contém o perfil atualizado com profile_image
            if (resp?.data) {
                setProfile(resp.data);
            }
            setImgVersion((v) => v + 1);
            setImageFile(null);
            setError('');
            try {
                alert('Profile image updated successfully!');
            }
            catch { }
        }
        catch (e) {
            setError('Failed to upload image');
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
        alert('Description updated successfully!');
        setUploading(false);
    };
    const handleReturnBook = async (loanId) => {
        const response = await api_1.default.post(`/api/return/${loanId}`, {}, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        fetchLoans();
        alert('Book returned successfully!');
        setError('');
    };
    if (loading) {
        return ((0, jsx_runtime_1.jsx)(Layout_1.default, { title: "User Profile", children: (0, jsx_runtime_1.jsx)("div", { className: "loading", children: "Loading profile..." }) }));
    }
    return ((0, jsx_runtime_1.jsxs)(Layout_1.default, { title: "User Profile", children: [error && (0, jsx_runtime_1.jsx)("div", { className: "error-message", children: error }), (0, jsx_runtime_1.jsxs)("div", { className: "tabs", children: [(0, jsx_runtime_1.jsx)("button", { className: `tab ${activeTab === 'profile' ? 'active' : ''}`, onClick: () => setActiveTab('profile'), children: "Profile" }), (0, jsx_runtime_1.jsx)("button", { className: `tab ${activeTab === 'loans' ? 'active' : ''}`, onClick: () => setActiveTab('loans'), children: "My Loans" }), (0, jsx_runtime_1.jsx)("button", { className: `tab ${activeTab === 'favorite' ? 'active' : ''}`, onClick: () => setActiveTab('favorite'), children: "Favorite Book" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "tab-content", children: [activeTab === 'profile' && ((0, jsx_runtime_1.jsxs)("section", { className: "profile-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "Profile Information" }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Username:" }), " ", user?.username || 'Unknown'] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Role:" }), " ", user?.role || 'User'] }), (0, jsx_runtime_1.jsxs)("div", { className: "profile-image-container", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Profile Image" }), (0, jsx_runtime_1.jsx)("div", { className: "profile-image-display", children: profile?.profile_image ? ((0, jsx_runtime_1.jsx)("img", { src: buildImageSrc(profile.profile_image), alt: "Profile", className: "profile-image", style: {
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
                                            }, children: "No profile image uploaded yet" })) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "description-section", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Description" }), editingDescription ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Tell us about yourself...", rows: 4, className: "description-textarea" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleUpdateDescription, disabled: uploading, children: uploading ? 'Saving...' : 'Save Description' }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                            setEditingDescription(false);
                                                            setDescription(profile?.description || '');
                                                        }, className: "cancel-button", children: "Cancel" })] })] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { children: profile?.description || 'No description added yet.' }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setEditingDescription(true), children: "Edit Description" })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "image-upload", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Update Profile Image" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("input", { type: "file", accept: "image/*", onChange: onSelectImage, disabled: uploading }), (0, jsx_runtime_1.jsx)("button", { onClick: handleUploadImage, disabled: !imageFile || uploading, children: uploading ? 'Uploading...' : 'Upload' })] })] })] })), activeTab === 'loans' && ((0, jsx_runtime_1.jsxs)("section", { className: "profile-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "My Borrowed Books" }), loans.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { children: "You haven't borrowed any books yet." })) : ((0, jsx_runtime_1.jsx)("div", { children: loans.map(loan => ((0, jsx_runtime_1.jsxs)("div", { className: "loan-card", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { children: loan.title }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Loan Date:" }), " ", new Date(loan.loan_date).toLocaleDateString()] }), loan.description && (0, jsx_runtime_1.jsx)("p", { children: loan.description })] }), (0, jsx_runtime_1.jsxs)("div", { className: "loan-actions", children: [loan.photo && ((0, jsx_runtime_1.jsx)("img", { src: buildImageSrc(loan.photo), alt: loan.title, className: "loan-book-image" })), (0, jsx_runtime_1.jsx)("button", { onClick: (e) => {
                                                        e.preventDefault();
                                                        handleReturnBook(loan.loans_id);
                                                    }, className: "return-button", children: "Return Book" })] })] }, loan.loans_id))) }))] })), activeTab === 'favorite' && ((0, jsx_runtime_1.jsxs)("section", { className: "profile-section", children: [(0, jsx_runtime_1.jsx)("h2", { children: "My Favorite Book" }), !favoriteBook ? ((0, jsx_runtime_1.jsx)("p", { children: "You haven't set a favorite book yet." })) : ((0, jsx_runtime_1.jsxs)("div", { className: "favorite-book-card", children: [favoriteBook.photo && ((0, jsx_runtime_1.jsx)("img", { src: buildImageSrc(favoriteBook.photo), alt: favoriteBook.title, className: "favorite-book-image" })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { children: favoriteBook.title }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Author:" }), " ", favoriteBook.author_name || 'Unknown'] }), favoriteBook.description && ((0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Description:" }), " ", favoriteBook.description] }))] })] }))] }))] })] }));
};
exports.default = UserProfile;
