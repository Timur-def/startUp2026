import mongoose from "mongoose";

const user = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  login: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "salesman"],
    default: "user",
  },
  productsCart: {
    type: Array,
    required: true,
    default: [],
  },
  saleProductArray: {
    type: Array,
    required: true,
    default: [],
  },
});

const product = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: String,
    required: true,
    trim: true,
  },
  modelPath: {
    type: String,
    required: true,
    trim: true,
  },
  shopmanInfo: {
    type: Object,
    required: true,
  },
  addressHome: {
    type: String,
    required: true,
  },
});
const questionInTheHelpBlog = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },

  goodRating: {
    type: Array,
    required: true,
    default: [],
  },
  badRating: {
    type: Array,
    required: true,
    default: [],
  },
});

export const User = mongoose.model("User", user);
export const Product = mongoose.model("Product", product);
export const QuestionInTheHelpBlog = mongoose.model(
  "QuestionInTheHelpBlog",
  questionInTheHelpBlog,
);
