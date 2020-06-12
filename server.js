'use strict';
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
app.use(cors());
const PORT = process.env.PORT || 3001;
const DB = process.env.DATABASE_URL;

const client = new pg.Client(DB);
client.on('error', err => console.error(err));

///////////////////////////ROUTES//////////////////////////////////////
app.get('/location', locationHandler)
app.get('/weather', weatherHandler)
app.get('/trails', trailsHandler)
app.get('/movies', moviesHandler)
app.get('/yelp', yelpHandler)
app.use('*', handler404)
/////////////////////////location route////////////////////////////////
function locationHandler(req, res){
  let search = req.query.city
  let sql = 'SELECT * FROM locations WHERE search_query LIKE ($1);';
  let safe = [search];
  client.query(sql, safe)
    .then(dbData => {
      if (!dbData.rowCount) {
        let url = process.env.LOC_API;
        let query = {
          key: process.env.LOC_KEY,
          q: search,
          format: 'json'
        }
        superagent.get(url)
          .query(query)
          .then(apiData => {
            let retObj = new Location(search, apiData.body[0]);
            console.log('API ITEM')
            res.status(200).send(retObj);
            let sql = 'INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4);'
            let safe = [retObj.search_query, retObj.formatted_query, retObj.latitude, retObj.longitude];
            client.query(sql, safe)
              .then()
          }).catch(err => console.log(err))
      } else {
        console.log('DB DATA')
        res.status(200).send(dbData.rows[0]);
      }
    }).catch(err => {
      console.log(err)
      res.status(500).send('Sorry, something went wrong');
    })
}
//////////////////////////Weather route////////////////////////////////
function weatherHandler(req, res){
  let loc = req.query.search_query;
  let url = process.env.WEA_API;
  let query = {
    city: loc,
    units: 'i',
    key: process.env.WEA_KEY
  }
  superagent.get(url)
    .query(query)
    .then(apiData => {
      let retArr = apiData.body.data.map((obj) => new Weather(obj))
      res.status(200).send(retArr);
    }).catch(err => {
      console.log(err)
      res.status(500).send('Sorry, something went wrong');
    })
}
/////////////////////////////Trail route///////////////////////////////
function trailsHandler(req, res){
  let loc = [req.query.latitude, req.query.longitude];
  let url = process.env.TRAIL_API;
  let query = {
    lat: loc[0],
    lon: loc[1],
    maxDistance: 10,
    key: process.env.TRAIL_KEY
  }
  superagent.get(url)
    .query(query)
    .then(apiData => {
      let retArr = apiData.body.trails.map(obj => new Trail(obj));
      res.status(200).send(retArr);
    }).catch(err => {
      console.log(err)
      res.status(500).send('Sorry, something went wrong');
    })
}
////////////////////////////Movies route///////////////////////////////
function moviesHandler(req,res){
  let url = process.env.MOV_URL;
  let query = {
    api_key: process.env.MOV_KEY,
    query: req.query.search_query
  }
  superagent.get(url)
    .query(query)
    .then(apiData =>{
      let retArr = apiData.body.results.map(obj => new Movie(obj))
      res.status(200).send(retArr);
    }).catch(err => {
      console.log(err)
      res.status(500).send('Sorry, something went wrong');
    })
}
////////////////////////////Yelp route/////////////////////////////////
function yelpHandler(req,res){
  let url = process.env.YELP_URL;
  let query = {
    limit: 10,
    latitude: req.query.latitude,
    longitude: req.query.longitude,
    categories: 'restaurants'
  }
  superagent.get(url)
    .set({'Authorization': `Bearer ${process.env.YELP_KEY}`})
    .query(query)
    .then(apiData =>{
      let retArr = apiData.body.businesses.map(obj => new Restaurant(obj))
      res.status(200).send(retArr);
    }).catch(err => {
      console.log(err)
      res.status(500).send('Sorry, something went wrong');
    })
}
////////////////////////////All other routes///////////////////////////
function handler404(req, res){
  res.status(404).send('sorry, this route does not exist');
}

///////////////////////LOCATION CONSTRUCTOR////////////////////////////
function Location(search, obj) {
  this.search_query = search;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}
//////////////////////////WEATHER CONSTRUCTOR//////////////////////////
function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.valid_date;
}
////////////////////////////TRAIL CONSTRUCTOR//////////////////////////
function Trail(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = `${obj.conditionDetails || ''} ${obj.conditionStatus}`;
  this.condition_date = obj.conditionDate.split(' ')[0];
  this.condition_time = obj.conditionDate.split(' ')[1];
}
////////////////////////////MOVIES CONSTRUCTOR/////////////////////////
function Movie(obj){
  this.title=obj.title;
  this.overview=obj.overview;
  this.average_votes=obj.vote_average;
  this.total_votes=obj.vote_count;
  this.image_url=`https://image.tmdb.org/t/p/w500${obj.poster_path}`
  this.popularity=obj.popularity;
  this.released_on=obj.release_date;
}
////////////////////////////YELP CONSTRUCTOR///////////////////////////
function Restaurant(obj){
  this.name=obj.name;
  this.image_url=obj.image_url;
  this.price=obj.price;
  this.rating=obj.rating;
  this.url=obj.url;
}


client.connect()
  .then(() => {
    app.listen(PORT, () => console.log(`Server started on ${PORT}`))
  });
