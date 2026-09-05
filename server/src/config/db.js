const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    if (error.message && error.message.includes("bad auth")) {
      console.error("MongoDB connection failed: Authentication failed. Check your username and password.");
    } else {
      console.error("MongoDB connection failed. Please check your connection string and network access.");
    }
    process.exit(1);
  }
};

module.exports = connectDB;
