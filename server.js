'use strict';
require('dotenv').config();
const express = require('express');
const superAgent = require('superagent');
const PORT = process.env.PORT || 3000;
const app = express();
const pg = require('pg');
const cors = require('cors');
const methodOverride = require('method-override');
const db = new pg.Client(process.env.DATABASE_URL);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

//==============================================================
//Routs 
app.get('/', renderHomePage);
app.get('/searches', showFormHandler);
app.post('/searches/new', createSearch);
app.get('/books/:id', booksHandler);
app.post('/books', addBook);
app.delete('/delete/:book_id', deleteBook);
// app.put('/update/:book_id', updateBook);
app.get('*', errorHandler);

//========================================================

// Handler Functions 
function booksHandler(req, res) {
  const sql = 'SELECT * FROM books WHERE id=$1;';
  const value = [req.params.id];
  db.query(sql, value).then(results => {
    const element = results.rows[0];
    res.render('pages/books/show', { data: element });
  })
}

function errorHandler(req, res) {
  res.send('Something went wrong');
}

function renderHomePage(req, res) {
  const dbData = 'SELECT * FROM books;';
  db.query(dbData).then(results => {
    let data = results.rows;
    if (results) {
      res.render('pages/index', {
        searchResults: data,
        booksQty: data.length
      });
    }
  }).catch(error => {
    res.send('Something went wrong in home page!')
  })
};

function showFormHandler(req, res) {
  try {
    res.render('pages/searches/new')
  } catch {
    errorHandler();
  }
}

function createSearch(request, response) {
  try {
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';
    if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
    if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
    console.log(request.body)
    superAgent.get(url)
      .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
      .then(results =>
        response.render('pages/show', { searchResults: results }));
  } catch (error) {
    response.status(500).send(`Something went wrong with search route: ${error}`);
  }
}

function addBook(req, res) {
  const bookInfo = req.body;
  const sql = 'INSERT INTO books(title, author, isbn, image_url, description)  VALUES($1,$2,$3,$4,$5) RETURNING id;';
  const sqlValues = [bookInfo.title, bookInfo.author, bookInfo.isbn, bookInfo.image_url, bookInfo.description];
  db.query(sql, sqlValues).then(data => {
    const book_id = data.rows[0];
    res.status(200).redirect(`/books/${book_id.id}`)
  }).catch(error => {
    console.error;
    res.status(404).send(`Something went wrong ${error}`);
  });
}

function deleteBook(req, res) {
  // let { title, description, category, contact, status } = request.body;
  console.log(req.params.book_id);
  // let { image_url, isbn, title, author, description } = request.body;
  let sql = 'DELETE FROM books WHERE id=$1;';
  const values = [req.params.book_id];
  db.query(sql, values).then(res.redirect('/')).catch(error => { res.send('Something went wrong') })


}

//=============================================================

// Constructor function

function Book(info) {
  this.image_url = info.imageLinks ? info.imageLinks.smallThumbnail : "https://i.imgur.com/J5LVHEL.jpg";
  this.isbn = info.industryIdentifiers ? info.industryIdentifiers[0].identifier : 'ISBN Not Found';
  this.title = info.title || 'No title available'; // short circuit
  this.author = info.authors || 'Author not found';
  this.description = info.description || 'Description not found'

}


//=============================================================

//Port = 3000
db.connect().then(() => {
  console.log('Connected to Database!!')
  app.listen(PORT, () => {
    console.log(`Listening to port No. ${PORT}`);
  })
});

