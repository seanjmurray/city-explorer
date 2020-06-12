'use strict';
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const pg = require('pg');
const PORT = process.env.PORT || 3001;
const DB = process.env.DATABASE_URL;
const client = new pg.Client(DB);
const location = require('./libs/location');
const weather = require('./libs/weather');
const trails = require('./libs/trails');
const movies = require('./libs/movie');
const yelp = require('./libs/yelp');
const welp = require('./libs/error');
client.on('error', err => console.error(err));
app.use(cors());
///////////////////////////ROUTES//////////////////////////////////////
app.get('/location', location.locationHandler)
app.get('/weather', weather.weatherHandler)
app.get('/trails', trails.trailsHandler)
app.get('/movies', movies.moviesHandler)
app.get('/yelp', yelp.yelpHandler)
app.use('*', welp.handler404)
//////////////////////////DB CONN + SERVER/////////////////////////////
client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Server started on ${PORT}`))
  });
