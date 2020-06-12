require('dotenv').config();
const superagent = require('superagent');
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
function Movie(obj){
  this.title=obj.title;
  this.overview=obj.overview;
  this.average_votes=obj.vote_average;
  this.total_votes=obj.vote_count;
  this.image_url=`https://image.tmdb.org/t/p/w500${obj.poster_path}`
  this.popularity=obj.popularity;
  this.released_on=obj.release_date;
}
module.exports.moviesHandler = moviesHandler;
