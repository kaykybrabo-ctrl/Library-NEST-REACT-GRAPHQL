import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

const PROTECTED_IMAGES = [
  'pedbook/books/default-book',
  'pedbook/profiles/default-user', 
  'pedbook/profiles/default-author',
  'pedbook/carousel/carousel-1',
  'pedbook/carousel/carousel-2', 
  'pedbook/carousel/carousel-3',
  'pedbook/books/book-life-in-silence',
  'pedbook/books/book-fragments-of-everyday-life',
  'pedbook/books/book-stories-of-the-wind',
  'pedbook/books/book-between-noise-and-calm',
  'pedbook/books/book-the-horizon-and-the-sea',
  'pedbook/books/book-winds-of-change',
  'pedbook/books/book-paths-of-the-soul',
  'pedbook/books/book-under-the-grey-sky',
  'pedbook/books/book-notes-of-a-silence',
  'pedbook/books/book-the-last-letter',
  'pedbook/books/book-between-words',
  'pedbook/books/book-colors-of-the-city',
  'pedbook/books/book-the-weight-of-the-rain',
  'pedbook/books/book-blue-night',
  'pedbook/books/book-faces-of-memory',
  'pedbook/books/book-origin-tales',
  'pedbook/books/book-fragments-of-hope',
  'pedbook/books/book-trails-and-scars',
  'pedbook/books/book-from-the-other-side-of-the-street',
  'pedbook/books/book-interrupted-seasons',
  'pedbook/profiles/author-guilherme-biondo',
  'pedbook/profiles/author-manoel-leite',
  'pedbook/carousel/carousel-1',
  'pedbook/carousel/carousel-2',
  'pedbook/carousel/carousel-3',
];

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'library-nest/books',
    customPublicId?: string
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const publicId = customPublicId || `user-upload-${timestamp}-${randomId}`;
      
      const result = await cloudinary.uploader.upload(
        file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, 
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          transformation: [
            { width: 600, height: 900, crop: 'fill' },
            { quality: 'auto:good' },
            { format: 'webp' }
          ]
        }
      );

      return result.secure_url;
    } catch (error) {
      throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
  }

  async uploadImageFromUrl(
    imageUrl: string,
    publicId?: string,
    folder: string = 'library-nest/books'
  ): Promise<string> {
    try {
      const uploadOptions: any = {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 600, height: 900, crop: 'fill' },
          { quality: 'auto:good' },
          { format: 'webp' }
        ]
      };

      if (publicId) {
        uploadOptions.public_id = `${folder}/${publicId}`;
        uploadOptions.overwrite = true;
      }

      const result = await cloudinary.uploader.upload(imageUrl, uploadOptions);
      return result.secure_url;
    } catch (error) {
      throw new Error(`Failed to upload image from URL to Cloudinary: ${error.message}`);
    }
  }

  async uploadProfileImage(
    file: Express.Multer.File,
    publicId?: string
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const safePublicId = publicId || `user-profile-${timestamp}-${randomId}`;
      
      const uploadOptions: any = {
        folder: 'pedbook/profiles',
        public_id: safePublicId,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' },
          { format: 'webp' }
        ]
      };

      const result = await cloudinary.uploader.upload(
        file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        uploadOptions
      );

      return result.secure_url;
    } catch (error) {
      throw new Error(`Failed to upload profile image to Cloudinary: ${error.message}`);
    }
  }

  async safeDeleteImage(publicId: string): Promise<{ success: boolean; message: string }> {
    try {
      if (this.isProtectedImage(publicId)) {
        return {
          success: false,
          message: `Imagem protegida não pode ser deletada: ${publicId}`
        };
      }

      try {
        await cloudinary.api.resource(publicId);
      } catch (error: any) {
        if (error.http_code === 404) {
          return {
            success: false,
            message: `Imagem não encontrada: ${publicId}`
          };
        }
        throw error;
      }

      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        return {
          success: true,
          message: `Imagem deletada com sucesso: ${publicId}`
        };
      } else {
        return {
          success: false,
          message: `Falha ao deletar imagem: ${publicId} - ${result.result}`
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erro ao deletar imagem: ${publicId} - ${error.message}`
      };
    }
  }

  isProtectedImage(publicId: string): boolean {
    return PROTECTED_IMAGES.includes(publicId);
  }

  getFallbackImageUrl(type: 'book' | 'profile' | 'author' = 'book'): string {
    const defaultImages = {
      book: 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062932/pedbook/books/default-book.svg',
      profile: 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062930/pedbook/profiles/default-user.svg',
      author: 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062934/pedbook/profiles/default-author.svg'
    };
    return defaultImages[type];
  }

  getImageUrl(photo: string | null | undefined, type: 'book' | 'profile' | 'author' = 'book', forceRefresh: boolean = false): string {
    if (!photo) {
      return this.getFallbackImageUrl(type);
    }

    let url = '';
    
    if (photo.startsWith('http')) {
      url = photo;
    } else if (photo.includes('pedbook/') || photo.includes('library-nest/')) {
      url = `https://res.cloudinary.com/${this.configService.get('CLOUDINARY_CLOUD_NAME')}/image/upload/${photo}`;
    } else if (photo.startsWith('book-') || photo.startsWith('author-')) {
      const folder = type === 'book' ? 'library-nest/books' : 'library-nest/profiles';
      url = `https://res.cloudinary.com/${this.configService.get('CLOUDINARY_CLOUD_NAME')}/image/upload/${folder}/${photo}`;
    } else if (photo.startsWith('default-')) {
      return '';
    } else {
      url = `/uploads/${photo}`;
    }
    
    if (forceRefresh) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}t=${Date.now()}`;
    }
    
    return url;
  }


  extractPublicId(cloudinaryUrl: string): string {
    const parts = cloudinaryUrl.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && uploadIndex < parts.length - 1) {
      return parts.slice(uploadIndex + 1).join('/').split('.')[0];
    }
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }

  async createImageBackupList(): Promise<{ [key: string]: string }> {
    const backupList: { [key: string]: string } = {};
    
    for (const publicId of PROTECTED_IMAGES) {
      try {
        const resource = await cloudinary.api.resource(publicId);
        backupList[publicId] = resource.secure_url;
      } catch (error) {
        console.warn(`Imagem protegida não encontrada: ${publicId}`);
      }
    }
    
    return backupList;
  }
}
