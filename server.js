'use strict';
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const superagent = require('superagent');
app.use(cors());
const PORT = process.env.PORT || 3001;

/////////////////////////location route////////////////////////////////
app.get('/location',(req,res)=>{
  try{
    let search = req.query.city
    let url = `${process.env.LOC_API}?key=${process.env.LOC_KEY}&q=${search}&format=json`
    superagent.get(url)
      .then(apiData =>{
        let retObj = new Location(search,apiData.body[0]);
        res.status(200).send(retObj);
      }).catch(err => console.log(err))
  }catch(err){
    res.status(500).send('Sorry, something went wrong');
  }
})
///////////////////////LOCATION CONSTRUCTOR////////////////////////////
function Location(search,obj){
  this.search_query=search;
  this.formatted_query=obj.display_name;
  this.latitude=obj.lat;
  this.longitude=obj.lon;
}
//////////////////////////Weather route////////////////////////////////
app.get('/weather', (req,res)=>{
  try{
    let loc = req.query.search_query;
    let url = `${process.env.WEA_API}?city=${loc}&units=i&key=${process.env.WEA_KEY}`;
    superagent.get(url)
      .then(apiData => {
        let retArr = apiData.body.data.map((obj)=> new Weather(obj))
        res.status(200).send(retArr);
      }).catch(err => console.log(err))
  }catch(err){
    res.status(500).send('Sorry, something went wrong');
  }
})

//////////////////////////WEATHER CONSTRUCTOR//////////////////////////
function Weather(obj){
  this.forecast=obj.weather.description;
  this.time=obj.valid_date;
}
/////////////////////////////Trail route///////////////////////////////
app.get('/trails', (req,res) => {
  try{
    let loc = [req.query.latitude,req.query.longitude];
    let url = `${process.env.TRAIL_API}?lat=${loc[0]}&lon=${loc[1]}&maxDistance=10&key=${process.env.TRAIL_KEY}`
    superagent.get(url)
      .then(apiData => {
        let retArr=apiData.body.trails.map(obj => new Trail(obj));
        res.status(200).send(retArr);
      }).catch(err => console.log(err))
  }catch(err){
    res.status(500).send('Sorry, something went wrong');
  }
})
////////////////////////////TRAIL CONSTRUCTOR//////////////////////////
function Trail(obj){
  this.name=obj.name;
  this.location=obj.location;
  this.length=obj.length;
  this.stars=obj.stars;
  this.star_votes=obj.starVotes;
  this.summary=obj.summary;
  this.trail_url=obj.url;
  this.conditions=`${obj.conditionDetails || ''} ${obj.conditionStatus}`;
  this.conditions_date=obj.conditionDate.slice(0,obj.conditionDate.indexOf(' '));
  this.conditions_time=obj.conditionDate.slice(obj.conditionDate.indexOf(' ')+1,obj.conditionDate.length);
}

////////////////////////////All other routes///////////////////////////
app.get('*', (req,res)=>{
  res.status(404).send('sorry, this route does not exist');
})

app.listen(PORT, ()=> console.log(`Server started on ${PORT}`))

