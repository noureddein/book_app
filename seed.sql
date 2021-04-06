CREATE TABLE IF NOT EXISTS savedBooks(
  id SERIAL PRIMARY KEY NOT NULL,
  img TEXT(256) NOT NULL,
  isbn VARCHAR(256) NOT NULL,
  title VARCHAR(256) NOT NULL,
  author VARCHAR(256) NOT NULL,
  book_description VARCHAR(256) NOT NULL
);

INSERT INTO savedBooks (img, isbn, title,author ,book_description)  VALUES (
        'https://i.imgur.com/J5LVHEL.jpg" alt="Harry Potter Puzzles Book: Interesting Book for Fan of J. K. Rowling',
        'Harry Potter Puzzles Book: Interesting Book for Fan of J. K. Rowling',
        'ISBN: 9798634472041',
        'Author: Tim Cary',
        'A unique and magical gift for all Harry Potter fans! Not to easy, and not to hard - the questions nd '
);


