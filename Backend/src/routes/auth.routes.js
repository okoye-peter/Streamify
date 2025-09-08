import express from "express";
import { login, logout, register, onboard, addAllUsers } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);

router.post("/register", register);

router.post("/logout", logout);

// router.get("/add/all", addAllUsers);

router.post('/onboarding', protectRoute, onboard)

// get authenticated user details
router.get("/me", protectRoute, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
})

export default router;