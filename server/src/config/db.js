const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    const isSRVError =
      error.message?.includes("querySrv") ||
      error.message?.includes("ECONNREFUSED") ||
      error.message?.includes("ENOTFOUND");
    if (isSRVError) {
      console.error(
        "MongoDB Atlas connection failed — check network DNS settings."
      );
      console.error(
        "Tip: Ensure your network supports DNS SRV records, or switch to a direct mongodb:// connection string."
      );
    } else {
      console.error("MongoDB connection error:", error.message);
    }
    process.exit(1);
  }
};

module.exports = connectDB;
