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

/* Using param() to auto load an object*/

router.param('idea', function(req, res, next, id) {
  var query = Idea.findById(id);

  query.exec(function (err, idea){
    if (err) { return next(err); }
    if (!idea) { return next(new Error('can\'t find idea')); }

    req.idea = idea;
    return next();
  });
});

router.get('/ideas/:idea', function(req, res) {
  res.json(req.idea);
});

/*upvote idea */
router.put('/ideas/:idea/upvote', function(req, res, next) {
  req.idea.upvote(function(err, idea){
    if (err) { return next(err); }

    res.json(idea);
  });
});

module.exports = router;
