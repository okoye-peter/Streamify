import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import mongoose from "mongoose";

export const getRecommendedUsers = async (req, res) => {
  try {
    const authUser = req.user;
    const { page = 1, search = "" } = req.query;
    const limit = 9;
    const skip = (page - 1) * limit;

    // Convert to ObjectIds - handle case where friends array might be undefined
    
    const excludedIds = [
      new mongoose.Types.ObjectId(authUser.id),
      ...[].concat(authUser?.friends || []).map(id => new mongoose.Types.ObjectId(id)),
    ];

    // Build filter
    const filter = {
      _id: { $nin: excludedIds }, // Exclude self & friends
      isOnboarded: true,
    };

    // Search by name (case-insensitive)
    if (search.trim()) {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    // Fetch users and total count in parallel
    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .skip(skip)
        .limit(limit)
        .select("name profilePicture nativeLanguage learningLanguage")
        .lean(), // Use lean() for better performance since we don't need mongoose documents
      User.countDocuments(filter),
    ]);

    // Calculate pagination info
    const currentPageNum = parseInt(page);
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = currentPageNum < totalPages;
    const hasPrevPage = currentPageNum > 1;

    res.status(200).json({
      data: users,
      pagination: {
        currentPage: currentPageNum,
        totalPages,
        totalUsers,
        limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? currentPageNum + 1 : null,
        prevPage: hasPrevPage ? currentPageNum - 1 : null,
      },
      nextPage: hasNextPage ? currentPageNum + 1 : null,
      hasMore: hasNextPage,
      currentPage: currentPageNum,
    });
  } catch (error) {
    console.error("Error fetching recommended users:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getAuthUserFriends = async (req, res) => {
  try {
    const authUser = req.user;
    const { search, page = 1 } = req.query;

    const limit = 9;
    const skip = (page - 1) * limit;

    const query = { _id: { $in: authUser.friends } };

    // If search term exists, add regex condition for "name"
    if (search) {
      query.name = { $regex: search, $options: "i" };
      // $options: "i" makes it case-insensitive
    }

    // Get total count for pagination info
    const totalFriends = await User.countDocuments(query);

    // Get paginated friends
    const friends = await User.find(query)
      .select("name nativeLanguage profilePicture learningLanguage")
      .skip(skip)
      .limit(limit);

    // Calculate pagination info
    const totalPages = Math.ceil(totalFriends / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      data: friends,
      nextPage: hasNextPage ? parseInt(page) + 1 : null,
      hasMore: hasNextPage,
      currentPage: parseInt(page),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalFriends,
        limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching authenticated user's friends:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const { id: recipientId } = req.params;
    const senderId = req.user.id;

    if (senderId === recipientId) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself." });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    if (recipient.friends?.includes(senderId)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user." });
    }

    // Check if a friend request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId },
        { sender: recipientId, recipient: senderId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Friend request already exists." });
    }

    const newFriendRequest = await FriendRequest.create({
      sender: senderId,
      recipient: recipientId,
    });

    res.status(201).json(newFriendRequest);
  } catch (error) {
    console.error("Error sending friend request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    if (friendRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Friend request is not pending." });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to accept this friend request.",
      });
    }

    // Add each user to the other's friends list
    // $addToSet ensures that the user is added only if they are not already in the array
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    await FriendRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Friend request accepted successfully." });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found." });
    }

    if (friendRequest.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Friend request is not pending." });
    }

    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to accept this friend request.",
      });
    }

    await FriendRequest.findByIdAndDelete(requestId);
    res.status(200).json({ message: "Friend request rejected successfully." });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, search = "" } = req.query;
    const limit = 9;
    const skip = (page - 1) * limit;

    // Build base filter
    const filter = {
      recipient: userId,
      status: "pending",
    };

    if (search.trim()) {
      // Method 1: Use populate with match (simpler and more reliable)
      const allRequests = await FriendRequest.find(filter)
        .populate({
          path: "sender",
          select: "name profilePicture nativeLanguage learningLanguage",
          match: { name: { $regex: search.trim(), $options: "i" } },
        })
        .sort({ createdAt: -1 })
        .lean();

      // Filter out requests where sender is null (didn't match the search)
      const filteredRequests = allRequests.filter(
        (request) => request.sender !== null
      );

      // Apply pagination
      const incomingRequests = filteredRequests.slice(skip, skip + limit);
      const totalRequest = filteredRequests.length;

      res.status(200).json({ incomingRequests, totalRequest });
    } else {
      // No search - use regular populate
      const [incomingRequests, totalRequest] = await Promise.all([
        FriendRequest.find(filter)
          .skip(skip)
          .limit(limit)
          .populate(
            "sender",
            "name profilePicture nativeLanguage learningLanguage"
          )
          .sort({ createdAt: -1 })
          .lean(),
        FriendRequest.countDocuments(filter),
      ]);
      res.status(200).json({ incomingRequests, totalRequest });
    }
  } catch (error) {
    console.error("💥 Error fetching friend requests:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getOutgoingFriendRequests = async (req, res) => {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "recipient",
      "name profilePicture nativeLanguage learningLanguage"
    );

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error("Error fetching outgoing friend requests:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getFriendRequestsCount = async (req, res) => {
  try {
    const incomingRequestsCount = await FriendRequest.countDocuments({
      recipient: req.user.id,
      status: "pending",
    });

    res.status(200).json(incomingRequestsCount);
  } catch (error) {
    console.error("Error fetching incoming friend requests count:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
