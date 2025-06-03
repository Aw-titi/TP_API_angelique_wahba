import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  postId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
},{ timestamps: true });

// Empêche un même user de liker plusieurs fois le même post
likeSchema.index({ userId: 1, postId: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);
export default Like;
