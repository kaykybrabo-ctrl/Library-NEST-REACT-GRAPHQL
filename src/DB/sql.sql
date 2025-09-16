-- DROP DATABASE IF EXISTS library1;

-- CREATE DATABASE IF NOT EXISTS library1;
-- USE library1;

-- DROP TABLE IF EXISTS authors;
-- CREATE TABLE authors (
--   author_id INT NOT NULL AUTO_INCREMENT,
--   name_author VARCHAR(100) NOT NULL,
--   biography TEXT,
--   photo VARCHAR(255) DEFAULT NULL,
--   PRIMARY KEY (author_id)
-- );

-- INSERT INTO authors VALUES
--   (1, 'Guilherme Biondo', 'Guilherme Biondo is a writer who started writing at a young age, driven by curiosity and a passion for storytelling. His books talk about people, feelings, and everything that is part of everyday life, but with a unique and sincere perspective.', NULL),
--   (2, 'Manoel Leite', 'Manoel Leite is an author and keen observer of daily life. His stories arise from simple experiences, but full of meaning. With a direct and human writing style, Manoel aims to touch the reader with themes about memory, affection, and identity.', NULL);

-- DROP TABLE IF EXISTS categories;
-- CREATE TABLE categories (
--   category_id INT NOT NULL AUTO_INCREMENT,
--   name_category VARCHAR(100) NOT NULL,
--   PRIMARY KEY (category_id)
-- );

-- INSERT INTO categories VALUES
--   (1, 'Romance'),
--   (2, 'Chronicle'),
--   (3, 'Fiction'),
--   (4, 'Drama');

-- DROP TABLE IF EXISTS publishers;
-- CREATE TABLE publishers (
--   publish_id INT NOT NULL AUTO_INCREMENT,
--   publish_name VARCHAR(100) NOT NULL,
--   PRIMARY KEY (publish_id)
-- );

-- INSERT INTO publishers VALUES
--   (1, 'Aurora Publishing'),
--   (2, 'Books of Time'),
--   (3, 'House of Letters');

-- DROP TABLE IF EXISTS books;
-- CREATE TABLE books (
--   book_id INT NOT NULL AUTO_INCREMENT,
--   author_id INT DEFAULT NULL,
--   title VARCHAR(100) NOT NULL,
--   description TEXT,
--   photo VARCHAR(255) DEFAULT NULL,
--   PRIMARY KEY (book_id),
--   KEY author_id (author_id),
--   CONSTRAINT books_ibfk_1 FOREIGN KEY (author_id) REFERENCES authors (author_id)
-- );

-- INSERT INTO books VALUES
--   (1, 1, 'Life in Silence', 'A touching story about overcoming personal struggles through silence and introspection.', NULL),
--   (2, 1, 'Fragments of Everyday Life', 'Short stories capturing the beauty and complexity of daily moments.', NULL),
--   (3, 2, 'Stories of the Wind', 'Tales inspired by the ever-changing winds and the mysteries they carry.', NULL),
--   (4, 2, 'Between Noise and Calm', 'A narrative exploring the balance between chaos and peace.', NULL),
--   (5, 1, 'The Horizon and the Sea', 'An evocative journey of discovery along the endless horizon.', NULL),
--   (6, 1, 'Winds of Change', 'Stories about transformation and the winds that guide us.', NULL),
--   (7, 2, 'Paths of the Soul', 'A poetic exploration of the inner paths we all travel.', NULL),
--   (8, 2, 'Under the Grey Sky', 'A dramatic tale set against a backdrop of uncertain skies.', NULL),
--   (9, 1, 'Notes of a Silence', 'Reflections on moments of quiet and their powerful meanings.', NULL),
--   (10, 2, 'The Last Letter', 'A heartfelt story revolving around a final farewell.', NULL),
--   (11, 1, 'Between Words', 'Exploring what lies beyond spoken language and written text.', NULL),
--   (12, 2, 'Colors of the City', 'A vivid portrayal of urban life through its vibrant colors.', NULL),
--   (13, 1, 'The Weight of the Rain', 'A metaphorical story about burdens and relief brought by rain.', NULL),
--   (14, 2, 'Blue Night', 'A mysterious journey through the darkness and light of the night.', NULL),
--   (15, 1, 'Faces of Memory', 'Stories that capture the fleeting nature of memories.', NULL),
--   (16, 2, 'Origin Tales', 'Exploring the roots and beginnings of our existence.', NULL),
--   (17, 1, 'Fragments of Hope', 'Small glimmers of hope in challenging times.', NULL),
--   (18, 2, 'Trails and Scars', 'The marks left by life’s journeys and struggles.', NULL),
--   (19, 1, 'From the Other Side of the Street', 'A perspective shift to see the world from a new angle.', NULL),
--   (20, 2, 'Interrupted Seasons', 'Stories about unexpected changes and pauses in life.', NULL);

-- DROP TABLE IF EXISTS book_categories;
-- CREATE TABLE book_categories (
--   book_id INT NOT NULL,
--   category_id INT NOT NULL,
--   PRIMARY KEY (book_id, category_id),
--   KEY category_id (category_id),
--   CONSTRAINT book_categories_ibfk_1 FOREIGN KEY (book_id) REFERENCES books (book_id),
--   CONSTRAINT book_categories_ibfk_2 FOREIGN KEY (category_id) REFERENCES categories (category_id)
-- );

-- INSERT INTO book_categories VALUES
--   (1, 1), (5, 1), (9, 1), (13, 1), (16, 1), (17, 1), (20, 1),
--   (2, 2), (3, 2), (7, 2), (8, 2), (11, 2), (12, 2), (15, 2), (18, 2), (20, 2),
--   (4, 3), (6, 3), (10, 3), (14, 3), (19, 3),
--   (1, 4), (3, 4), (4, 4), (5, 4), (7, 4), (10, 4), (13, 4), (17, 4);

-- DROP TABLE IF EXISTS book_publishers;
-- CREATE TABLE book_publishers (
--   book_id INT NOT NULL,
--   publish_id INT NOT NULL,
--   PRIMARY KEY (book_id, publish_id),
--   KEY publish_id (publish_id),
--   CONSTRAINT book_publishers_ibfk_1 FOREIGN KEY (book_id) REFERENCES books (book_id),
--   CONSTRAINT book_publishers_ibfk_2 FOREIGN KEY (publish_id) REFERENCES publishers (publish_id)
-- );

-- INSERT INTO book_publishers VALUES
--   (1, 1), (4, 1), (5, 1), (8, 1), (10, 1), (13, 1), (16, 1), (18, 1),
--   (2, 2), (6, 2), (9, 2), (12, 2), (15, 2), (19, 2),
--   (3, 3), (7, 3), (11, 3), (14, 3), (17, 3), (20, 3);

-- DROP TABLE IF EXISTS users;
-- CREATE TABLE users (
--   id INT NOT NULL AUTO_INCREMENT,
--   username VARCHAR(50) NOT NULL,
--   password VARCHAR(100) NOT NULL,
--   role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
--   photo VARCHAR(255) DEFAULT NULL,
--   description TEXT DEFAULT NULL,
--   favorite_book_id INT DEFAULT NULL,
--   created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
--   PRIMARY KEY (id),
--   UNIQUE KEY username (username),
--   CONSTRAINT fk_favorite_book FOREIGN KEY (favorite_book_id) REFERENCES books (book_id)
-- );

-- INSERT INTO users VALUES
--   (1, 'kayky', '123', 'admin', NULL, NULL, NULL, '2025-08-04 17:36:45'),
--   (2, 'kaue', '123', 'user', NULL, NULL, NULL, '2025-08-04 17:36:45');

-- DROP TABLE IF EXISTS loans;
-- CREATE TABLE loans (
--   loans_id INT NOT NULL AUTO_INCREMENT,
--   user_id INT DEFAULT NULL,
--   book_id INT DEFAULT NULL,
--   loan_date DATETIME NOT NULL,
--   PRIMARY KEY (loans_id),
--   KEY user_id (user_id),
--   KEY book_id (book_id),
--   CONSTRAINT loans_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id),
--   CONSTRAINT loans_ibfk_2 FOREIGN KEY (book_id) REFERENCES books (book_id)
-- );

-- INSERT INTO loans VALUES
--   (1, 1, 1, '2025-06-10 14:30:00'),
--   (2, 2, 3, '2025-06-12 10:00:00'),
--   (3, 1, 4, '2025-06-13 16:45:00'),
--   (4, 1, 5, '2025-06-14 09:15:00'),
--   (5, 2, 6, '2025-06-15 11:20:00'),
--   (6, 2, 7, '2025-06-15 15:45:00'),
--   (7, 1, 8, '2025-06-16 08:00:00');

-- CREATE TABLE reviews (
--   review_id INT NOT NULL AUTO_INCREMENT,
--   user_id INT NOT NULL,
--   book_id INT NOT NULL,
--   rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
--   comment TEXT,
--   review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
--   PRIMARY KEY (review_id),
--   UNIQUE KEY unique_review (user_id, book_id),
--   FOREIGN KEY (user_id) REFERENCES users(id),
--   FOREIGN KEY (book_id) REFERENCES books(book_id)
-- );
