const mongoose = require('mongoose');

const connectDatabase = async () => {
  const uri = process.env.MONGO_URI;
  const retryDelay = Number(process.env.MONGO_RETRY_DELAY_MS || 3000);

  const connect = async () => {
    try {
      await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('MongoDB connected');
    } catch (error) {
      console.error('MongoDB connection failed:', error.message || error);
      console.log(`Retrying MongoDB connection in ${retryDelay}ms...`);
      setTimeout(connect, retryDelay);
    }
  };

  connect();
};

module.exports = connectDatabase;
