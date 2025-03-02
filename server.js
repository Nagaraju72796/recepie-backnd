const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
require('dotenv').config();

const User = require('./models/User');
const Recipe = require('./models/Recipe');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Logs requests for debugging

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('DB connected successfully'))
  .catch((error) => console.log('DB connection error:', error));

// Homepage Route
app.get('/', (req, res) => {
  res.send('<h1 align="center">Welcome to the Recipe Project Backend</h1>');
});

// Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }
    res.json({ userId: user._id, username: user.username, email: user.email });
  } catch (err) {
    console.error('Error in /login:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Register Route
app.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const username = fullName.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
    const newUser = new User({ username, fullName, email, password: hashPassword, savedRecipes: [] });
    await newUser.save();
    res.status(201).json({ message: 'Registration successful', userId: newUser._id });
  } catch (err) {
    console.error('Error in /register:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get Recipe by ID
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (recipe) res.json(recipe);
    else res.status(404).json({ message: 'Recipe not found' });
  } catch (err) {
    console.error('Error in /api/recipes/:id:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get Saved Recipes
app.get('/api/saved/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const saved = await Recipe.find({ _id: { $in: user.savedRecipes } });
    res.json(saved);
  } catch (err) {
    console.error('Error in /api/saved/:userId:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Save a Recipe
app.post('/api/saved/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { recipeId } = req.body;
    if (!user.savedRecipes.includes(recipeId)) {
      user.savedRecipes.push(recipeId);
      await user.save();
    }
    res.json(user.savedRecipes);
  } catch (err) {
    console.error('Error in POST /api/saved/:userId:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get Trending Recipes
app.get('/api/trending', async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ trendScore: -1, likes: -1 }).limit(10);
    res.json(recipes);
  } catch (err) {
    console.error('Error in /api/trending:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get Published Recipes
app.get('/api/published', async (req, res) => {
  try {
    const userId = req.query.userId;
    const recipes = await Recipe.find({ userId });
    res.json(recipes);
  } catch (err) {
    console.error('Error in /api/published:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Publish a New Recipe
app.post('/api/published', async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    console.error('Error in POST /api/published:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update User Profile
app.put('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error in PUT /api/users/:userId:', err);
    res.status(500).json({ message: 'Error saving profile' });
  }
});

// Update Published Recipe
app.put('/api/published/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    console.error('Error in PUT /api/published/:id:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get Dishes Data (Added from the second server.js)
const dishesData = {
  allTimeBest: [
    { title: "Spaghetti Bolognese", time: "45 mins", likes: 300, image: "/dish7.jpg" },
    { title: "Pizza Margherita", time: "30 mins", likes: 450, image: "/dish8.jpg" },
    { title: "Butter Chicken", time: "50 mins", likes: 275, image: "/dish9.jpg" },
    { title: "Chocolate Cake", time: "1 hr", likes: 320, image: "/dish10.jpg" },
    { title: "Caesar Salad", time: "15 mins", likes: 180, image: "/dish11.jpg" },
    { title: "Sushi Rolls", time: "40 mins", likes: 210, image: "/dish12.jpg" },
  ],
  todaySpecials: [
    { title: "Fish Curry", time: "40 mins", likes: 130, image: "/dish19.jpg" },
    { title: "Steak Fries", time: "45 mins", likes: 220, image: "/dish20.jpg" },
    { title: "Quinoa Salad", time: "20 mins", likes: 95, image: "/dish21.jpg" },
    { title: "Pancakes", time: "25 mins", likes: 310, image: "/dish22.jpg" },
    { title: "Lamb Chops", time: "50 mins", likes: 160, image: "/dish23.jpg" },
    { title: "Mango Sorbet", time: "30 mins", likes: 140, image: "/dish24.jpg" },
  ],
};

app.get('/api/dishes', (req, res) => {
  try {
    res.json(dishesData);
  } catch (err) {
    console.error('Error in /api/dishes:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start Server
app.listen(port, () => {
  console.log('Server running on http://localhost:${port}');
});