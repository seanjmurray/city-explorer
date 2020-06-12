////////////////////////////All other routes///////////////////////////
function handler404(req, res){
  res.status(404).send('sorry, this route does not exist');
}

module.exports.handler404 = handler404;
