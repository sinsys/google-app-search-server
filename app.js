const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const apps = require('./playstore.js');

const app = express();

app.use(morgan('common'));
app.use(cors());

app.get('/', (req, res) => {
  res
    .status(200)
    .send('App is running successfully');
});

app.get('/apps', (req, res) => {

  // Setup our base query params
  const { 
    search = '',
    genre,
    sort
  } = req.query;

  // Define available genres
  const genreOpts = [
    'Action', 
    'Puzzle', 
    'Strategy', 
    'Casual', 
    'Arcade', 
    'Card',
    'PretendPlay',
    'Action%20%26%20Adventure'
  ];

  // Define available sort
  const sortOpts = [
    'Rating',
    'App'
  ];

  // Error handle the sort - Ensure a valid sort query value was entered
  if( sort ) {
    if( !sortOpts
      .includes(sort)
    ) {
      return (
        res
          .status(400)
          .send(`Sort must be one of [${sortOpts.join(', ')}]`)
      );
    };
  };
  
  // Error handle the genre - Ensure a valid genre value was entered
  if( genre ) {
    if( !genreOpts
      .includes(encodeURIComponent(genre))
    ) {
      return (
        res
          .status(400)
          .send(`Genre must be one of [${genreOpts.join(', ')}]`)
      );
    };
  };

  // Errors are handled. Query param values are valid.... let's roll!

  // Create basic results based on search term (since we have a default value for it)
  let results = apps
    .filter((app) => 
      app
        .App
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // Define sorting behavior if sorting by app name (A-Z)
  if( sort === 'App' ) {
    results
      .sort((a, b) => {
        return (
          a[sort].toLowerCase() > b[sort].toLowerCase()
            ? 1
            : a[sort].toLowerCase() < b[sort].toLowerCase()
              ? -1
              : 0
        );
      });
  // Define sorting behavior if sorting by rating (5 -> 0)
  } else if ( sort === 'Rating' ) {
    results
      .sort((a, b) => {
        return (
          a[sort] < b[sort]
            ? 1
            : a[sort] > b[sort]
              ? -1
              : 0
        );
      });
  };

  // Filter existing results based on selected genre
  if( genre ) {
    console.log(encodeURIComponent(genre));
    let genreResults = 
      results
        .filter((app) => 
          app.Genres
            // Some genres contain multiple values separated by ;
            // Create an array of these Genres
            .split(';')
            // Test if our selected genre exists in the array
            .includes(genre)
        )
    // Redefine results based on our filter
    results = genreResults;
  };

  // Data compiled - Return to user
  res
    .status(200)
    .json(results);
});

// Sample request
// http://localhost:8000/apps?search=u&sort=App&genre=Action
// Expected alphabetical sort with 3 entries with an Action genre containing the letter 'u'

module.exports = app;