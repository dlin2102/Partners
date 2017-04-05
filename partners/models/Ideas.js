var mongoose = require('mongoose');

var IdeaSchema = new mongoose.Schema({
  title: String,
  description: String,
  image_url: String,
  upvotes: {type: Number, default: 0},
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
})

IdeaSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};

mongoose.model('Idea', IdeaSchema);
