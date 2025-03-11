const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      ref: "Users" 
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "", 
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId], 
      default: [],
      ref: "Users"
    },
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Users", 
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        }
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now, 
    },
    updatedAt: {
      type: Date,
      default: Date.now, 
    },
  },
  { timestamps: true } 
);

const PostModel = mongoose.model("Posts", postSchema);
module.exports = PostModel;
