var express = require('express');
var jwt = require('express-jwt');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var Idea = mongoose.model('Idea')
var Comment = mongoose.model('Comment')
var User = mongoose.model('User');

//register route
router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    return res.json({token: user.generateJWT()})
  });
});

//login route
router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

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

/*delete idea */
router.delete('/ideas/:idea', auth, function(req, res){
  req.idea.comments.forEach(function(id){
      Comment.remove({_id: id}, function(err){
        if(err) {return next(err)}
    })
    })
        Idea.remove({_id: req.params.idea}, function(err, idea){
        if(err) {return next(err)}
        Idea.find(function(err, ideas){
          if(err) {return next(err)}
          res.json(ideas)
      })
    })
})


/*upvote idea */
router.put('/ideas/:idea/upvote', auth, function(req, res, next) {
  req.idea.upvote(function(err, idea){
    if (err) { return next(err); }

    res.json(idea);
  });
});

/* Creating a new idea and saving it to database */
router.post('/ideas', auth, function(req, res, next) {
  var idea = new Idea(req.body);
  idea.author = req.payload.username;

  idea.save(function(err, idea){
    if(err){ return next(err); }

    res.json(idea);
  });
});

/* Creating a new comment and saving it to database */

router.post('/ideas/:idea/comments', auth, function(req, res, next) {
  var comment = new Comment(req.body);
  comment.idea = req.idea;
  comment.author = req.payload.username;

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
