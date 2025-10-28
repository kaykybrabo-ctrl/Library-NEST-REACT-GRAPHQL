UPDATE library1.books SET title = 'Fragments of Hope' WHERE book_id = 17;
UPDATE library1.books SET title = 'Trails and Scars' WHERE book_id = 18;
UPDATE library1.books SET title = 'From the Other Side of the Street' WHERE book_id = 19;
UPDATE library1.books SET title = 'Interrupted Seasons' WHERE book_id = 20;

UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065256/pedbook/books/book-life-in-silence.jpg' WHERE title = 'Life in Silence';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065258/pedbook/books/book-fragments-of-everyday-life.jpg' WHERE title = 'Fragments of Everyday Life';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065260/pedbook/books/book-stories-of-the-wind.jpg' WHERE title = 'Stories of the Wind';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065262/pedbook/books/book-between-noise-and-calm.jpg' WHERE title = 'Between Noise and Calm';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065264/pedbook/books/book-the-horizon-and-the-sea.jpg' WHERE title = 'The Horizon and the Sea';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065266/pedbook/books/book-winds-of-change.jpg' WHERE title = 'Winds of Change';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065268/pedbook/books/book-paths-of-the-soul.jpg' WHERE title = 'Paths of the Soul';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065270/pedbook/books/book-under-the-grey-sky.jpg' WHERE title = 'Under the Grey Sky';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065272/pedbook/books/book-notes-of-a-silence.jpg' WHERE title = 'Notes of a Silence';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065274/pedbook/books/book-the-last-letter.jpg' WHERE title = 'The Last Letter';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065276/pedbook/books/book-between-words.jpg' WHERE title = 'Between Words';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065278/pedbook/books/book-colors-of-the-city.jpg' WHERE title = 'Colors of the City';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065280/pedbook/books/book-the-weight-of-the-rain.jpg' WHERE title = 'The Weight of the Rain';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065282/pedbook/books/book-blue-night.jpg' WHERE title = 'Blue Night';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065284/pedbook/books/book-faces-of-memory.jpg' WHERE title = 'Faces of Memory';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065286/pedbook/books/book-origin-tales.jpg' WHERE title = 'Origin Tales';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065288/pedbook/books/book-fragments-of-hope.jpg' WHERE title = 'Fragments of Hope';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065290/pedbook/books/book-trails-and-scars.jpg' WHERE title = 'Trails and Scars';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065292/pedbook/books/book-from-the-other-side-of-the-street.jpg' WHERE title = 'From the Other Side of the Street';
UPDATE library1.books SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065294/pedbook/books/book-interrupted-seasons.jpg' WHERE title = 'Interrupted Seasons';

UPDATE library1.authors SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065250/pedbook/profiles/author-guilherme-biondo.jpg' WHERE name_author = 'Guilherme Biondo';
UPDATE library1.authors SET photo = 'https://res.cloudinary.com/ddfgsoh5g/image/upload/v1761065252/pedbook/profiles/author-manoel-leite.jpg' WHERE name_author = 'Manoel Leite';

SELECT 'LIVROS:' as tipo, COUNT(*) as total, COUNT(photo) as with_photos FROM library1.books
UNION ALL
SELECT 'AUTORES:' as tipo, COUNT(*) as total, COUNT(photo) as with_photos FROM library1.authors;
