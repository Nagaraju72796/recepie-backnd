const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  likes: { type: Number, default: 0 },
  image: { type: String, required: true },
  ingredients: [{ type: String }],
  steps: [{ type: String }],
  userId: { type: Number }, // Links to the user who published it (optional)
  trendScore: { type: Number, default: 0 } // For trending recipes
});

module.exports = mongoose.model('Recipe', recipeSchema);