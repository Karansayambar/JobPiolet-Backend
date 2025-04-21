const mongoose = require("mongoose");

const dburl =
  "mongodb+srv://karansayambar:Sanjivani317@cluster0.jqjduq4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const connectDB = async () => {
  try {
    await mongoose.connect(dburl);
    console.log("mongoose connected successfully");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connectDB;
