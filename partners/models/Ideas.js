var mongoose = require('mongoose');

var IdeaSchema = new mongoose.Schema({
  title: String,
  description: String,
  upvotes: {type: Number, default: 0},
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
})

mongoose.model('Idea', IdeaSchema);
