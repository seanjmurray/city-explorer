require('dotenv').config();
const superagent = require('superagent');
const pg = require('pg');
const DB = process.env.DATABASE_URL;
const client = new pg.Client(DB);
client.on('error', err => console.error(err));
client.connect()
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
function Location(search, obj) {
  this.search_query = search;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}
module.exports.locationHandler = locationHandler;
