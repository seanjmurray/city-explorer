'use strict';
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const PORT = process.env.PORT || 3001;

/////////////////////////location route////////////////////////////////
app.get('/location',(req,res)=>{
  try{
    let apiData = require('./data/location.json');
    let retObj = new Location(req.query.city,apiData[0]);
    res.status(200).send(retObj);
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
    let retArr = [];
    let apiData = require('./data/weather.json');
    apiData.data.forEach(day =>{
      new Weather(day,retArr);
    })
    res.status(200).send(retArr);
  }catch(err){
    res.status(500).send('Sorry, something went wrong');
  }
})

//////////////////////////WEATHER CONSTRUCTOR//////////////////////////
function Weather(obj,arr){
  this.forecast=obj.weather.description;
  this.time=obj.valid_date;
  arr.push(this);
}


app.listen(PORT, ()=> console.log(`Server started on ${PORT}`))

