const mongoose = require("mongoose");
require("dotenv").config();
const connectMongoDB = async () => {
  try {
    const URI = process.env.DB_URI;
    console.log(`Connecting Mongo DB at ${URI}`);
    await mongoose.connect(URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting with MongoDB", error);
  }
};
module.exports = { connectMongoDB };
