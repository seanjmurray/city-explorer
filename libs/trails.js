require('dotenv').config();
const superagent = require('superagent');
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
module.exports.trailsHandler = trailsHandler;
