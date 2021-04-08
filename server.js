'use strict';
require('dotenv').config();
const express = require('express');
const superAgent = require('superagent');
const PORT = process.env.PORT || 3000;
const app = express();
const pg = require('pg');
const db = new pg.Client(process.env.DATABASE_URL);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

//==============================================================
//handlers 

app.get('/', renderHomePage);
app.get('/searches/new', showFormHandler);
app.post('/searches', createSearch);
app.get('*', errorHandler);


function errorHandler(req, res) {
  res.send('Somthing went wrong');
}

//========================================================

function renderHomePage(req, res) {
  const dbData = 'SELECT * FROM savedBooks;';

  db.query(dbData).then(results => {
    let data = results.rowCount;
    if (data) {
      res.render();
      // .then(results => response.render('pages/show', { searchResults: results }));

    }
  }).catch()



};

function showFormHandler(req, res) {
  try {
    res.render('pages/searches/new')
  } catch {
    errorHandler();
  }

}

// Console.log request.body and request.body.search
function createSearch(request, response) {
  try {
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';
    if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
    if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
    console.log(url);
    superAgent.get(url)
      .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
      .then(results => response.render('pages/show', { searchResults: results }));
  } catch (error) {
    response.status(500).send(`Somthing went wrong with search route: ${error}`);
  }
}

//=============================================================

// Constructer function

function Book(info) {
  this.placeholderImage = info.imageLinks ? info.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  this.isbn = info.industryIdentifiers ? info.industryIdentifiers[0].identifier : 'ISBN Not Found';
  this.title = info.title || 'No title available'; // shortcircuit
  this.author = info.authors || 'Auther not found';
  this.description = info.description || 'Describtion not found'

}


//=============================================================

//Port = 3000
db.connect().then(() => {
  console.log('Connected to Database!!')
  app.listen(PORT, () => {
    console.log(`Listening to port No. ${PORT}`);
  })
});

