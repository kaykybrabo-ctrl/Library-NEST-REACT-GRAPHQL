export const getImageUrl = (
  photo: string | null | undefined, 
  type: 'book' | 'profile' | 'author' = 'book', 
  forceRefresh: boolean = false,
  name?: string
): string => {
  if (!photo && name && (type === 'book' || type === 'author')) {
    const specificUrl = getSpecificImageUrl(name, type);
    if (specificUrl) {
      return specificUrl;
    }
  }
  
  if (!photo) {
    return getFallbackImageUrl(type);
  }

  let url = '';
  
  if (photo.startsWith('http')) {
    url = photo;
  } 
  else if (photo.startsWith('book-') || photo.startsWith('author-')) {
    const folder = type === 'book' ? 'library-nest/books' : 'library-nest/profiles'
    url = `https://res.cloudinary.com/ddfgsoh5g/image/upload/${folder}/${photo}`
  }
  else if (photo.startsWith('default-')) {
    return getFallbackImageUrl(type);
  } 
  else {
    url = `/uploads/${photo}`;
  }
  
  if (forceRefresh) {
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}t=${Date.now()}`;
  }
  
  return url;
};

export const getFallbackImageUrl = (type: 'book' | 'profile' | 'author' = 'book'): string => {
  const defaultImages = {
    book: 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062932/pedbook/books/default-book.svg',
    profile: 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062930/pedbook/profiles/default-user.svg',
    author: 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761062934/pedbook/profiles/default-author.svg'
  };
  return defaultImages[type];
};

export const getSpecificImageUrl = (name: string, type: 'book' | 'author'): string | null => {
  const normalizedName = name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  if (type === 'book') {
    const bookMappings: { [key: string]: string } = {
      'life-in-silence': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065256/pedbook/books/book-life-in-silence.jpg',
      'fragments-of-everyday-life': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065258/pedbook/books/book-fragments-of-everyday-life.jpg',
      'stories-of-the-wind': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065260/pedbook/books/book-stories-of-the-wind.jpg',
      'between-noise-and-calm': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065262/pedbook/books/book-between-noise-and-calm.jpg',
      'the-horizon-and-the-sea': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065264/pedbook/books/book-the-horizon-and-the-sea.jpg',
      'winds-of-change': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065266/pedbook/books/book-winds-of-change.jpg',
      'paths-of-the-soul': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065268/pedbook/books/book-paths-of-the-soul.jpg',
      'under-the-grey-sky': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065270/pedbook/books/book-under-the-grey-sky.jpg',
      'notes-of-a-silence': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065272/pedbook/books/book-notes-of-a-silence.jpg',
      'the-last-letter': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065274/pedbook/books/book-the-last-letter.jpg',
      'between-words': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065276/pedbook/books/book-between-words.jpg',
      'colors-of-the-city': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065278/pedbook/books/book-colors-of-the-city.jpg',
      'the-weight-of-the-rain': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065280/pedbook/books/book-the-weight-of-the-rain.jpg',
      'blue-night': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065282/pedbook/books/book-blue-night.jpg',
      'faces-of-memory': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065284/pedbook/books/book-faces-of-memory.jpg',
      'origin-tales': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065286/pedbook/books/book-origin-tales.jpg',
      'fragments-of-hope': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065288/pedbook/books/book-fragments-of-hope.jpg',
      'trails-and-scars': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065290/pedbook/books/book-trails-and-scars.jpg',
      'from-the-other-side-of-the-street': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065292/pedbook/books/book-from-the-other-side-of-the-street.jpg',
      'interrupted-seasons': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065294/pedbook/books/book-interrupted-seasons.jpg',
    };
    
    return bookMappings[normalizedName] || null;
  }
  
  if (type === 'author') {
    const authorMappings: { [key: string]: string } = {
      'guilherme-biondo': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065250/pedbook/profiles/author-guilherme-biondo.jpg',
      'manoel-leite': 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065252/pedbook/profiles/author-manoel-leite.jpg',
    };
    
    return authorMappings[normalizedName] || null;
  }
  
  return null;
};

export const extractPublicId = (cloudinaryUrl: string): string => {
  const parts = cloudinaryUrl.split('/');
  const uploadIndex = parts.findIndex(part => part === 'upload');
  if (uploadIndex !== -1 && uploadIndex < parts.length - 1) {
    return parts.slice(uploadIndex + 1).join('/').split('.')[0];
  }
  const filename = parts[parts.length - 1];
  return filename.split('.')[0];
};
