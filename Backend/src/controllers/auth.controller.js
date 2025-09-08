import { upsertStreamUser } from "../lib/stream-chat.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 8)
      return res
        .status(400)
        .json({ message: "password must be at least 8 characters" });

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email format" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res
        .status(400)
        .json({ message: "Email already exist, please use a different email" });

    const idx = Math.floor(Math.random() * 100); // generate random number between 1 - 100
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}`;

    const newUser = await User.create({
      email,
      name,
      password,
      profilePicture: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.name,
        image: newUser.profilePicture || "",
      });
    } catch (error) {
      console.log("Error creating stream user:", error);
    }

    const token = jwt.sign(
      {
        userId: newUser._id,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d", // 7days
      }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // equivalent of 7 days in milliseconds
      httpOnly: true, // prevent XSS attack
      sameSite: "strict", // prevent CSRF attack
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      success: true,
      user: newUser,
    });
  } catch (error) {
    console.log("Error encountered during registration", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "invalid email or password" });

    const isPasswordCorrect = await user.checkPassword(password);
    if (!isPasswordCorrect)
      return res.status(401).json({ message: "invalid email or password" });

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d", // 7days
      }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // equivalent of 7 days in milliseconds
      httpOnly: true, // prevent XSS attack
      sameSite: "strict", // prevent CSRF attack
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error encountered during registration", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const onboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, bio, nativeLanguage, learningLanguage, location } = req.body;

    if (!name || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !name && "name",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...req.body, isOnboarded: true },
      { new: true }
    );
    if (!updatedUser)
      return res.status(400).json({ message: "User not found" });

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        image: updatedUser.profilePicture || "",
      });
    } catch (error) {
      console.log("Error updating stream user:", error);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.log("Error onboarding user", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    const results = await Promise.allSettled(
      users.map((user) =>
        upsertStreamUser({
          id: user._id.toString(),
          name: user.name,
          image: user.profilePicture || "",
        })
      )
    );

    // Count successes/failures
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected");

    return res.status(200).json({
      total: users.length,
      success: successCount,
      failed: failed.length,
      failedUsers: failed.map((f, i) => users[i]._id), // IDs of users that failed
    });
  } catch (error) {
    console.error("Error in addAllUsers:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
