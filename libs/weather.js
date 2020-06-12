require('dotenv').config();
const superagent = require('superagent');


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
function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.valid_date;
}

module.exports.weatherHandler = weatherHandler;
