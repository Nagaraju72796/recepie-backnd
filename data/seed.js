const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');
const Recipe = require('../models/Recipe');

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('DB connected for seeding'))
  .catch((error) => console.log('DB connection error:', error));

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Recipe.deleteMany({});

    // Seed Recipes first (so we have IDs to reference)
    const recipes = [
      {
        title: 'Classic Spaghetti Carbonara',
        author: 'Chef John',
        likes: 1234,
        image: '/dish2.jpg',
        ingredients: [
          '400g spaghetti',
          '150g pancetta, diced',
          '2 large eggs',
          '1 cup grated Parmesan cheese',
          '2 cloves garlic, minced',
          'Salt and black pepper to taste',
          'Fresh parsley, chopped (for garnish)'
        ],
        steps: [
          'Cook spaghetti until al dente. Reserve 1 cup of pasta water.',
          'Cook pancetta until crispy. Add garlic.',
          'Whisk eggs and Parmesan.',
          'Toss spaghetti with pancetta, then egg mixture. Add water as needed.',
          'Season and garnish.'
        ],
        trendScore: 87
      },
      {
        title: 'Chicken Stir Fry',
        author: 'Chef Amy',
        likes: 85,
        image: '/dish1.jpg',
        ingredients: [
          '500g chicken breast, sliced',
          '2 tbsp soy sauce',
          '1 bell pepper, sliced',
          '1 broccoli head, chopped',
          '2 tbsp vegetable oil',
          '1 tsp ginger, minced',
          'Salt and pepper to taste'
        ],
        steps: [
          'Marinate chicken in soy sauce.',
          'Heat oil, add ginger, then chicken.',
          'Add bell pepper and broccoli.',
          'Season and serve.'
        ],
        trendScore: 50
      }
    ];
    const savedRecipes = await Recipe.insertMany(recipes);

    // Seed Users with references to savedRecipes
    const users = [
      {
        username: 'adminUser',
        fullName: 'Admin User',
        email: 'admin@gmail.com',
        password: await bcrypt.hash('admin', 10),
        savedRecipes: [savedRecipes[0]._id, savedRecipes[1]._id] // Use ObjectId directly
      },
      {
        username: 'testUser',
        fullName: 'Test User',
        email: 'test@gmail.com',
        password: await bcrypt.hash('test123', 10),
        savedRecipes: [savedRecipes[0]._id] // Use ObjectId directly
      }
    ];
    await User.insertMany(users);

    console.log('Data seeded successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding data:', err);
    mongoose.connection.close();
  }
};

seedData();