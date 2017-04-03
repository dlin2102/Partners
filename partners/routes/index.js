var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Idea = mongoose.model('Idea')
var Comment = mongoose.model('Comment')

/* home page */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* idea page */
router.get('/ideas', function(req, res, next) {
  Idea.find(function(err, ideas){
    if(err){ return next(err); }

    res.json(ideas);
  });
});

/* Creating a new idea and saving it to database */
router.post('/ideas', function(req, res, next) {
  var idea = new Idea(req.body);

  idea.save(function(err, idea){
    if(err){ return next(err); }

    res.json(idea);
  });
});

module.exports = router;
