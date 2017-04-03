var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Idea = mongoose.model('Idea');
var Comment = mongoose.model('Comment')

/* home page */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* post page */
router.get('/ideas', function(req, res, next) {
  Idea.find(function(err, ideas){
    if(err){ return next(err); }

    res.json(ideas);
  });
});

module.exports = router;
