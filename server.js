'use strict';
require('dotenv').config();
// const bodyParser = require('body-parser');
const express = require('express');
const superAgent = require('superagent');
const PORT = process.env.PORT || 3000;
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

//==============================================================
//handlers 

app.get('/', renderHomePage);
app.get('/searches/new', showFormHandler);
app.post('/searches', createSearch);


//========================================================

function renderHomePage(req, res) {
  res.render('pages/index');
};

function showFormHandler(req, res) {
  res.render('pages/searches/new')

}


// No API key required
// Console.log request.body and request.body.search
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body);
  console.log(request.body.search);

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
  console.log(url);
  superAgent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/show', { searchResults: results }));
}

//=============================================================

// Constructer function

// function Books(title, autherName, description) {
//   const imgURl = 'https://i.imgur.com/J5LVHEL.jpg';
//   this.title = title;
//   this.autherName = autherName;
//   this.description = description;
// }
function Book(info) {
  this.placeholderImage = info.imageLinks.thumbnail;
  // 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title || 'No title available'; // shortcircuit
  this.authr = info.authors || 'Auther not found';
  this.description = info.description || 'Describtion not found'

}


//=============================================================

//Port = 3000
app.listen(PORT, () => {
  console.log(`Listening to port No. ${PORT}`);
})

