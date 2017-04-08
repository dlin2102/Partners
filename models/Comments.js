var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  body: String,
  author: String,
  idea: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea' }
});

mongoose.model('Comment', CommentSchema);
