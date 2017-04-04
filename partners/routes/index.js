var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Idea = mongoose.model('Idea')
var Comment = mongoose.model('Comment')

/* home page */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* ideas indexpage */
router.get('/ideas', function(req, res, next) {
  Idea.find(function(err, ideas){
    if(err){ return next(err); }

    res.json(ideas);
  });
});

/* Using param() to auto load Idea*/

router.param('idea', function(req, res, next, id) {
  var query = Idea.findById(id);

  query.exec(function (err, idea){
    if (err) { return next(err); }
    if (!idea) { return next(new Error('can\'t find idea')); }

    req.idea = idea;
    return next();
  });
});

/* Using param() to auto load Comment*/

router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function (err, comment){
    if (err) { return next(err); }
    if (!comment) { return next(new Error('can\'t find comment')); }

    req.comment = comment;
    return next();
  });
});

/*idea showpage */
router.get('/ideas/:idea', function(req, res, next) {
  req.idea.populate('comments', function(err, idea) {
    if (err) { return next(err); }

    res.json(idea);
  });
});


/*upvote idea */
router.put('/ideas/:idea/upvote', function(req, res, next) {
  req.idea.upvote(function(err, idea){
    if (err) { return next(err); }

    res.json(idea);
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

/* Creating a new comment and saving it to database */

router.post('/ideas/:idea/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.idea = req.idea;

  comment.save(function(err, comment){
    if(err){ return next(err); }

    req.idea.comments.push(comment);
    req.idea.save(function(err, idea) {
      if(err){ return next(err); }

      res.json(comment);
    });
  });
});

module.exports = router;
