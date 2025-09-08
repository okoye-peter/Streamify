import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
    getRecommendedUsers, 
    getAuthUserFriends, 
    sendFriendRequest, 
    acceptFriendRequest,
    getFriendRequests,
    getOutgoingFriendRequests,
    getFriendRequestsCount,
    declineFriendRequest
} from "../controllers/users.controller.js";

const router = express.Router();

// apply middleware to all routes
router.use(protectRoute);

router.get('/', getRecommendedUsers);
router.get('/friends', getAuthUserFriends);
router.get('/friend-requests', getFriendRequests);
router.get('/friend-requests/count', getFriendRequestsCount);
router.post('/friend-requests/:id', sendFriendRequest);
router.put('/friend-requests/:id/accept', acceptFriendRequest);
router.put('/friend-requests/:id/reject', declineFriendRequest);
router.get("/outgoing-requests", getOutgoingFriendRequests);

export default router;