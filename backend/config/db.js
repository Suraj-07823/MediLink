const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
