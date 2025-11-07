import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPLOAD_BOOK_IMAGE_GRAPHQL, UPLOAD_AUTHOR_IMAGE_GRAPHQL, UPLOAD_USER_IMAGE_GRAPHQL } from '../graphql/queries/uploads';

interface GraphQLUploadProps {
  type: 'book' | 'author' | 'user';
  entityId: number;
  onSuccess?: () => void;
  title?: string;
  onImageUpdate?: () => void;
}

const GraphQLUpload: React.FC<GraphQLUploadProps> = ({ type, entityId, onSuccess, title, onImageUpdate }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const getMutation = () => {
    switch (type) {
      case 'book': return UPLOAD_BOOK_IMAGE_GRAPHQL;
      case 'author': return UPLOAD_AUTHOR_IMAGE_GRAPHQL;
      case 'user': return UPLOAD_USER_IMAGE_GRAPHQL;
      default: return UPLOAD_BOOK_IMAGE_GRAPHQL;
    }
  };

  const [uploadMutation] = useMutation(getMutation());

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setMessage('❌ Apenas arquivos de imagem são permitidos');
        return;
      }
      
      const fileSizeMB = selectedFile.size / (1024 * 1024);
      if (fileSizeMB > 10) {
        setMessage('⚠️ Imagem muito grande (>10MB). Será comprimida automaticamente.');
      } else if (fileSizeMB > 5) {
        setMessage('ℹ️ Imagem grande. Será otimizada para envio.');
      } else {
        setMessage('');
      }
      
      setFile(selectedFile);
    }
  };

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Selecione um arquivo primeiro');
      return;
    }

    setUploading(true);
    setMessage('📤 Enviando imagem...');

    try {
      const fileData = await compressImage(file);

      const getVariables = () => {
        const baseVars = { filename: file.name, fileData };
        switch (type) {
          case 'book': return { bookId: entityId, ...baseVars };
          case 'author': return { authorId: entityId, ...baseVars };
          case 'user': return { userId: entityId, ...baseVars };
          default: return { bookId: entityId, ...baseVars };
        }
      };

      const result = await uploadMutation({
        variables: getVariables()
      });

      const getResponseMessage = () => {
        switch (type) {
          case 'book': return result.data?.uploadBookImagePureGraphQL;
          case 'author': return result.data?.uploadAuthorImagePureGraphQL;
          case 'user': return result.data?.uploadUserImagePureGraphQL;
          default: return result.data?.uploadBookImagePureGraphQL;
        }
      };

      const responseMessage = getResponseMessage();
      if (responseMessage) {
        setMessage(responseMessage);
        setFile(null);
        
        if (onImageUpdate) onImageUpdate();
        if (onSuccess) onSuccess();
        
        setTimeout(() => {
          const images = document.querySelectorAll('img');
          images.forEach(img => {
            if (img.src && !img.src.includes('?v=')) {
              img.src = img.src + '?v=' + Date.now();
            } else if (img.src.includes('?v=')) {
              img.src = img.src.replace(/\?v=\d+/, '?v=' + Date.now());
            }
          });
        }, 500);
      } else {
        setMessage('❌ Erro no upload');
      }
    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'book': return 'Livro';
      case 'author': return 'Autor';
      case 'user': return 'Usuário';
      default: return 'Item';
    }
  };

  return (
    <div 
      className="graphql-upload-container"
      style={{
        position: 'static',
        display: 'block',
        width: '100%',
        maxWidth: '280px',
        margin: '15px auto 0 auto',
        padding: '12px',
        background: 'rgba(22, 44, 116, 0.05)',
        border: '2px dashed #162c74',
        borderRadius: '8px',
        boxSizing: 'border-box',
        zIndex: 'auto',
        top: 'auto',
        left: 'auto',
        right: 'auto',
        bottom: 'auto',
        transform: 'none',
        float: 'none',
        clear: 'both'
      }}
    >
      <h3 style={{
        color: '#162c74',
        fontSize: '14px',
        marginBottom: '10px',
        textAlign: 'center',
        margin: '0 0 10px 0'
      }}>
        📤 {title || `Upload de Imagem - ${getTypeLabel()}`}
      </h3>
      
      <div style={{ marginBottom: '10px' }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginBottom: '10px',
            background: 'white',
            fontSize: '12px'
          }}
        />
        {file && (
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '5px',
            padding: '5px',
            background: '#f0f0f0',
            borderRadius: '4px'
          }}>
            📎 Selecionado: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        style={{
          width: '100%',
          background: '#162c74',
          color: 'white',
          border: 'none',
          padding: '10px',
          borderRadius: '4px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          fontSize: '14px',
          transition: 'all 0.3s ease',
          opacity: (!file || uploading) ? 0.6 : 1
        }}
      >
        {uploading ? '📤 Enviando...' : '📤 Enviar Imagem'}
      </button>

      {message && (
        <div style={{
          marginTop: '10px',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '14px',
          textAlign: 'center',
          background: message.includes('✅') ? '#d4edda' : 
                     message.includes('❌') ? '#f8d7da' : '#d1ecf1',
          color: message.includes('✅') ? '#155724' : 
                 message.includes('❌') ? '#721c24' : '#0c5460',
          border: `1px solid ${
            message.includes('✅') ? '#c3e6cb' : 
            message.includes('❌') ? '#f5c6cb' : '#bee5eb'
          }`
        }}>
          {message}
        </div>
      )}

    </div>
  );
};

export default GraphQLUpload;
