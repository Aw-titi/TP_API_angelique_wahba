import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  authorId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  likesCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Post = mongoose.model("Post", postSchema);
export default Post;
