const express = require("express");
const postRouter = express.Router();
const postModel = require("./postModel");
const userModel = require("./userModel");
const validateToken = require("../middlewares/validateToken");
const userRouter = require("./userController");

postRouter.post("/createpost", validateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const newPost = new postModel({
      userId: userId,
      content: req.body.content,
      image: req.body.image || "",
    });
    const savedPost = await newPost.save();
    return res.status(201).json({
      message: "Post created successfully",
      data: savedPost,
    });
  } catch (error) {
    console.error("Error creating post:", error.message);
    return res.status(500).json({ message: error.message });
  }
});

postRouter.patch("/editpost/:id", validateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }

    if (post.likes.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You have already liked this post" });
    }

    const updatedPost = await postModel.findByIdAndUpdate(postId, req.body, {
      new: true,
      runValidators: true,
    });
    return res
      .status(200)
      .json({ message: "Post Updated Successfully", data: updatedPost });
  } catch (error) {
    console.error("Error creating post:", error.message);
    return res.status(500).json({ message: error.message });
  }
});

postRouter.delete("/deletepost/:id", validateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post Not Found" });
    }
    if (post.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }
    await postModel.findByIdAndDelete(postId);

    return res.status(200).json({ message: "Post Deleted Successfully" });
  } catch (error) {
    console.error("Error creating post:", error.message);
    return res.status(500).json({ message: error.message });
  }
});

postRouter.get("/get/:postId", validateToken, async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching the post" });
  }
});

postRouter.get("/myPosts", validateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await postModel
      .find({ userId: userId })
      .populate("userId", "name profilePicture");
    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this user" });
    }
    return res
      .status(200)
      .json({ data: posts, message: "Posts fetched successfully" });
  } catch (error) {
    console.error("Error fetching user's posts:", error.message);
    return res.status(500).json({ message: error.message });
  }
});

postRouter.get("/allPosts", validateToken, async (req, res) => {
  try {
    const posts = await postModel
      .find()
      .populate("userId", "name profilePicture");
    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts available" });
    }
    return res
      .status(200)
      .json({ data: posts, message: "Posts fetched successfully" });
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    return res.status(500).json({ message: error.message });
  }
});

postRouter.patch("/like/:postId", validateToken, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;
  try {
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.likes.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You have already liked this post" });
    }
    post.likes.push(userId);
    await post.save();
    return res.status(200).json({ message: "Post liked successfully" });
  } catch {
    return res.status(500).json({ message: error.message });
  }
});

postRouter.get("/likes/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await postModel.findById(postId).populate("likes", "name");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({
      postId,
      likes: post.likes,
      message: "Fetched likes successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

userRouter.patch("/comment/:postId", async (req, res) => {
  const { userId, text } = req.body;
  const { postId } = req.params;
  try {
    const post = await userModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.comments.push({ userId, text });
    await post.save();
    res.status(200).json({ message: "Comment added", post });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
});

module.exports = postRouter;
