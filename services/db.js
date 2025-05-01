const mongoose = require("mongoose");
require("dotenv").config();

const dburl = process.env.DB_URL;
const connectDB = async () => {
  try {
    await mongoose.connect(dburl);
    console.log("mongoose connected successfully");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connectDB;
