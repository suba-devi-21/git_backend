const express = require("express");
const userRouter = express.Router();
const userModel = require("./userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validateToken = require("../middlewares/validateToken");

userRouter.post("/register", async (req, res) => {
  try {
    const userExists = await userModel.findOne({ email: req.body.email });
    if (userExists) {
      return res.status(400).json({ message: "User Already Exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = { ...req.body, password: hashedPassword };

    await userModel.create(newUser);
    return res
      .status(201)
      .json({ data: newUser, message: "User Registered Successfully" });
  } catch (error) {
    return res.status(500).json({ message: err.message });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: "User Not found" });
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid Password" });
    }
    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    

    return res
      .status(200)
      .json({ user:user,token,userId:user._id, isAdmin: user.isAdmin, message: "Login Successful" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

userRouter.get("/currentUser", validateToken, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    return res
      .status(200)
      .json({ data: user, message: "User Fetched Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

userRouter.delete("/deleteUser/:id", validateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await userModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User Not Found" });
    }

    return res.status(200).json({ message: "User Deleted Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

userRouter.patch("/updateUser/:id", validateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    const updatedUser = await userModel.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const { password, ...userWithoutPassword } = updatedUser.toObject();

    return res
      .status(200)
      .json({
        data: userWithoutPassword,
        message: "User Updated Successfully",
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

userRouter.get("/allUsers", validateToken, async (req, res) => {
  try {
    const users = await userModel.find().select("-password"); 
    return res
      .status(200)
      .json({ data: users, message: "Users Fetched Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

userRouter.patch('/follow/:id',validateToken,async(req,res)=>{
    const userIdToFollow = req.params.id;
    const currentUserId = req.user._id;
    try {
        const userToFollow = await userModel.findById(userIdToFollow);
        if (!userToFollow) {
            return res.status(404).json({ message: "User not found" });
        }

        if (userToFollow.followers.includes(currentUserId)) {
            return res.status(400).json({ message: "You are already following this user" });
        }

        
        await userModel.findByIdAndUpdate(userIdToFollow, {
            $push: { followers: currentUserId },
        });

        
        await userModel.findByIdAndUpdate(currentUserId, {
            $push: { following: userIdToFollow },
        });

        return res.status(200).json({ message: "Successfully followed the user" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})

userRouter.patch('/unfollow/:id', validateToken, async (req, res) => {
    const userIdToUnfollow = req.params.id; // User ID to unfollow
    const currentUserId = req.user._id; // Logged-in user's ID

    try {
        // Check if the user to unfollow exists
        const userToUnfollow = await userModel.findById(userIdToUnfollow);
        if (!userToUnfollow) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if not following
        if (!userToUnfollow.followers.includes(currentUserId)) {
            return res.status(400).json({ message: "You are not following this user" });
        }

        // Unfollow the user
        await userModel.findByIdAndUpdate(userIdToUnfollow, {
            $pull: { followers: currentUserId },
        });

        // Update the current user's following list
        await userModel.findByIdAndUpdate(currentUserId, {
            $pull: { following: userIdToUnfollow },
        });

        return res.status(200).json({ message: "Successfully unfollowed the user" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


module.exports = userRouter;
