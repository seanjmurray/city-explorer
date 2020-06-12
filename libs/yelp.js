require('dotenv').config();
const superagent = require('superagent');
function yelpHandler(req,res){
  let url = process.env.YELP_URL;
  let query = {
    limit: 5,
    offset: (req.query.page -1) * 5,
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
function Restaurant(obj){
  this.name=obj.name;
  this.image_url=obj.image_url;
  this.price=obj.price;
  this.rating=obj.rating;
  this.url=obj.url;
}
module.exports.yelpHandler = yelpHandler;
